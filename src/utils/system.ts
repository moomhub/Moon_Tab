import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { useIndexedDB, useSystemStore } from '@/store';
import { DEFAULT_BOOKMARK_ICON_DATA, ICON_LOCAL_DATA } from '@/constants/icon';
import { IconData, IconStoreType } from '@/types/icon';
import { S3Backup } from './backup';
import { buildBlobImagePath } from './icon';
import { S3ConnectionConfig } from '@/types/store';

/**
 * Description 生成UUID,用于书签ID
 * @returns {any}
 */
export function generateID() {
  // 使用 nanoid 生成 随机唯一ID
  return nanoid();
}

/**
 * Description 检查是否需要备份到S3
 * @returns {any}
 */
export const CheckBackUpToS3 = async () => {
  const systemStore = useSystemStore();
  if (
    !systemStore.backupSetting.s3.enabled ||
    !systemStore.backupSetting.s3.autoBackup
  ) {
    return;
  }
  const lastBackupTime = systemStore.backupSetting.s3.lastBackupDate;
  const now = dayjs();
  const lastBackup = dayjs(lastBackupTime);
  const diff = now.diff(lastBackup, 'day');

  // 如果没有上次备份时间或已超过备份间隔天数，则执行备份
  if (!lastBackupTime || diff >= systemStore.backupSetting.s3.backupInterval) {
    try {
      await S3Backup();
      systemStore.backupSetting.s3.lastBackupDate = new Date().toLocaleString();
      console.log('自动备份成功');
    } catch (error) {
      console.error('自动备份失败:', error);
    }
  }
};

/**
 * Description 构建书签图标
 * @param {IconData} icon
 * @returns {any}
 */
export const buildBookmarkIcon = async (icon: IconData) => {
  if (icon.store === IconStoreType.DB) {
    const key = icon.key as string;
    const indexedDB = useIndexedDB();
    const blob = (await indexedDB.iconDB.getItem(key)) as Blob | null;
    if (blob) {
      return {
        key,
        store: icon.store,
        url: URL.createObjectURL(blob),
      };
    }
  }
  if (icon.store === IconStoreType.LOCAL) {
    if (icon.url) {
      return icon;
    }
  }
  return DEFAULT_BOOKMARK_ICON_DATA;
};

export const getSystemIconData = async () => {
  const indexedDB = useIndexedDB();
  const iconData: IconData[] = [];
  // 添加默认的书签图标
  iconData.push(...ICON_LOCAL_DATA);
  //从数据库中读取图标数据
  await indexedDB.iconDB.iterate((value, key, iterationNumber) => {
    iconData.push({
      key,
      store: IconStoreType.DB,
      url: buildBlobImagePath(value as Blob),
    });
  });
  return iconData;
};

/**
 * 将S3连接配置数据进行编码处理
 * @param data S3连接配置对象
 * @returns 经过编码处理的字符串
 */
export const getS3CopyData = (data: S3ConnectionConfig) => {
  // 将配置对象转换为JSON字符串并进行Base64编码
  const base64 = btoa(JSON.stringify(data));
  // 将Base64编码后的字符串字符顺序反转
  return base64.split('').reverse().join('');
};

/**
 * 解码并解析S3连接配置数据
 * @param data 加密后的Base64编码字符串，经过反转处理
 * @returns S3ConnectionConfig 解析后的S3连接配置对象
 */
export const getS3PasteData = (data: string): S3ConnectionConfig => {
  // 将输入字符串反转，这是加密过程的一部分
  const reversed = data.split('').reverse().join('');
  // 将反转后的字符串进行Base64解码，然后解析为JSON对象
  return JSON.parse(atob(reversed));
};



