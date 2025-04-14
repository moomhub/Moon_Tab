import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { _Object } from '@aws-sdk/client-s3';
import { useSwiperStore, useSystemStore, useIndexedDB } from '@/store';
import { S3FileList, S3ResultEnum, S3TestResult } from '@/types/s3';
import { dayjs } from './time';
import S3Service from './s3';

// 常量定义
const BACKUP_FILENAME_PREFIX =
  import.meta.env.VITE_BACKUP_ZIP_PREFIX || 'MoonTab-Backup';
const MBACKUP_FILENAME =
  import.meta.env.VITE_BACKUP_ZIP_CONFIG_FILE_NAME || 'moontab-backup.mbak';
const ICONS_DIR = import.meta.env.VITE_BACKUP_ZIP_ICONS_DIR || 'icons/';
const BACKUP_VERSION = import.meta.env.VITE_PROJECT_VERSION || '1.0.0';

// 获取需要备份的Store实例
function getBackupStores() {
  return [useSwiperStore(), useSystemStore()];
}

// 生成标准备份文件名
function getBackupFileName() {
  return `${BACKUP_FILENAME_PREFIX}_${dayjs().format(
    'YYYY-MM-DD_HHmmssSSSSSS'
  )}.zip`;
}

// 生成备份数据包
async function getBackupZip() {
  const stores = getBackupStores();
  const indexedDB = useIndexedDB();
  const zip = new JSZip();

  // 收集Store状态数据
  const storeStates = stores.reduce((acc, store) => {
    acc[store.$id] = store.$state;
    return acc;
  }, {} as Record<string, unknown>);

  // 构造备份元数据
  const backupMetadata = {
    version: BACKUP_VERSION,
    timestamp: dayjs().toISOString(),
    stores: storeStates,
  };

  // 添加元数据文件
  zip.file(MBACKUP_FILENAME, JSON.stringify(backupMetadata));

  // 添加图标文件
  const iconFiles = new Map<string, File>();
  await indexedDB.iconDB.iterate((file: File, key: string) => {
    const blobSuffix = file.name?.split('.').pop();
    iconFiles.set(`${ICONS_DIR}${key}.${blobSuffix}`, file);
  });

  iconFiles.forEach((blob, path) => {
    zip.file(path, blob);
  });

  return zip.generateAsync({ type: 'blob' });
}

// 本地备份
export async function LocalBackup() {
  const content = await getBackupZip();
  saveAs(content, getBackupFileName());
}

// 从备份文件恢复
async function restoreFromZip(zip: JSZip) {
  const stores = getBackupStores();
  const indexedDB = useIndexedDB();

  // 恢复图标数据
  await indexedDB.iconDB.clear();
  const restoreIcons = Object.keys(zip.files)
    .filter((path) => path.startsWith(ICONS_DIR))
    .map(async (path) => {
      const blob = await zip.file(path)?.async('blob');
      if (!blob) return;

      // 获取完整文件名和扩展名
      const fileName = path.replace(ICONS_DIR, '');
      const split = fileName.split('.');
      const key = split[0];
      const suffix = split[1];

      // 根据扩展名自动识别 MIME 类型
      let mimeType = 'application/octet-stream';
      if (suffix) {
        const mimeMap: Record<string, string> = {
          svg: 'image/svg+xml',
          svgz: 'image/svg+xml',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
          ico: 'image/x-icon',
        };
        mimeType = mimeMap[suffix] || mimeType;
      }

      // 创建标准 File 对象
      const file = new File([blob], fileName, {
        type: mimeType,
        lastModified: Date.now(),
      });

      // 使用完整文件名作为键存储
      await indexedDB.iconDB.setItem(key, file);
    });

  await Promise.all(restoreIcons);

  // 验证备份文件
  const backupFile = zip.file(MBACKUP_FILENAME);
  if (!backupFile) {
    throw new Error(S3ResultEnum.FILE_NOT_FOUND);
  }

  // 解析备份数据
  const backupData = JSON.parse(await backupFile.async('text'));
  if (backupData.version !== BACKUP_VERSION) {
    console.warn('Backup version mismatch');
  }

  // 恢复Store状态
  stores.forEach((store) => {
    const state = backupData.stores?.[store.$id];
    // @ts-ignore 忽略类型错误，因为我们知道$state的结构和备份数据一致
    if (state) store.$patch(state);
  });
}

// 本地恢复
export async function LocalRestore(file: File) {
  const zip = await new JSZip().loadAsync(file);
  await restoreFromZip(zip);
}

// S3服务管理
export function createS3Service() {
  const systemStore = useSystemStore();
  if (!systemStore.backupSetting.s3Config) {
    throw new Error(S3ResultEnum.CONFIG_ERROR);
  }
  return new S3Service(systemStore.backupSetting.s3Config);
}

// S3备份
export async function S3Backup() {
  const blob = await getBackupZip();
  const buffer = await blob.arrayBuffer();
  const s3Service = createS3Service();
  // 1. 先上传新备份
  await s3Service.saveFile(getBackupFileName(), new Uint8Array(buffer));

  // 2. 获取所有备份文件并按时间排序
  const fileList = await s3Service.getFileList();
  const backupFiles = fileList
    .filter(
      (file): file is Required<Pick<_Object, 'Key'>> & _Object => !!file.Key
    )
    .filter((file) => file.Key.endsWith('.zip'))
    .sort(
      (a, b) =>
        (a.LastModified?.getTime() || 0) - (b.LastModified?.getTime() || 0)
    );
  // 3. 如果超过3份，删除最旧的
  if (backupFiles.length > 3) {
    const filesToDelete = backupFiles.slice(0, backupFiles.length - 3);
    await Promise.all(
      filesToDelete.map((file) => s3Service.deleteFile(file.Key!))
    );
  }
}

// S3恢复
export async function S3Restore(key: string) {
  const content = await createS3Service().getFile(key);
  if (!content) throw new Error(S3ResultEnum.FILE_NOT_FOUND);
  const blob = new Blob([content]);
  const zip = await new JSZip().loadAsync(blob);
  await restoreFromZip(zip);
}

// 检测S3连接
export const CheckS3Connection = async (): Promise<S3TestResult> => {
  try {
    await createS3Service().checkConnection();
    return {
      success: true,
      message: S3ResultEnum.CONNECTION_SUCCESS,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: S3ResultEnum.CONNECTION_FAILURE };
  }
};

// 显示S3文件列表
// 修改showS3Files方法中的类型声明
export const ShowS3FilesList = async (): Promise<S3FileList> => {
  try {
    const resultt = await createS3Service().getFileList();

    const data = resultt
      .filter(
        (file): file is Required<Pick<_Object, 'Key'>> & _Object => !!file.Key
      )
      .filter((file) => file.Key.endsWith('.zip'))
      .map((file) => ({
        Key: file.Key,
        LastModified: file.LastModified,
        Size: file.Size,
        ETag: file.ETag,
      }))
      .sort(
        (a, b) =>
          (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0)
      );

    return {
      success: true,
      files: data,
    };
  } catch (error) {
    console.error('获取S3文件列表失败:', error);
    return {
      success: false,
      files: [],
    };
  }
};
