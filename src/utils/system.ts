import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { useIndexedDB, useSystemStore } from '@/store';
import { DEFAULT_BOOKMARK_ICON_DATA, ICON_LOCAL_DATA } from '@/constants/icon';
import { IconData, IconStoreType } from '@/types/icon';
import { S3Backup } from './backup';
import { buildBlobImagePath } from './icon';

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
