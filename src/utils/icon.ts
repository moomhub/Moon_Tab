// 信标页中的图标/图片处理工具类

import { DEFAULT_BOOKMARK_ICON, ICON_LOCAL_DATA } from '@/constants/icon';
import { useIndexedDB } from '@/store';
import { IconData, IconStoreType } from '@/types/icon';

export async function getSystemIconData() {
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
}

//
export async function buildIconPath(icon: IconData) {
  if (icon.store === IconStoreType.LOCAL) {
    return icon.url || DEFAULT_BOOKMARK_ICON;
  }
  const indexedDB = useIndexedDB();
  const db = (await indexedDB.iconDB.getItem(
    icon?.key as string
  )) as Blob | null;
  return buildBlobImagePath(db);
}

export function buildBlobImagePath(blob: Blob | null) {
  const iconDbUrl = blob ? URL.createObjectURL(blob) : null;
  return iconDbUrl || DEFAULT_BOOKMARK_ICON;
}
