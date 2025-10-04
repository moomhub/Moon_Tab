import { DEFAULT_BOOKMARK_ICON } from '@/constants/icon';
import { useIndexedDB, useSwiperStore } from '@/store';
import { BookmarkCardData, CardType, BookmakeIconType } from '@/types';
import { IconData, IconStoreType } from '@/types/icon';

// 定义返回的数据结构
export interface BookmarkInfo {
  name: string; // 书签名称
  iconType: BookmakeIconType; // 图标类型
  iconUrl: string; // 图标URL
  icon: IconData; // 图标数据
  url: string; // 书签URL
  bgColor: string; // 背景颜色
}

/**
 * 获取符合条件的书签数据
 * 筛选条件：
 * 1. CardType 为 BOOKMARK
 * 2. iconType 为 IMAGE
 * 处理逻辑：
 * 1. 若存在多个名称相同的书签数据，需以出现次数最多的 icon 对应的书签数据为主
 * 2. 去除其他重复名称的书签数据
 * @returns 包含name、iconType、icon、bgColor字段的对象数组
 */
export async function getFilteredBookmarkData() {
  // 获取store实例
  const swiperStore = useSwiperStore();

  // 收集所有符合条件的书签数据
  const allBookmarks: BookmarkCardData[] = [];

  // 遍历所有滑动页面数据
  swiperStore.swiperData.forEach((swiper) => {
    // 筛选出BOOKMARK类型的卡片
    const bookmarks = swiper.data.filter(
      (card) => card.type === CardType.BOOKMARK
    ) as BookmarkCardData[];

    // 进一步筛选出iconType为IMAGE的书签
    const imageBookmarks = bookmarks.filter(
      (bookmark) =>
        bookmark.iconType === BookmakeIconType.IMAGE &&
        bookmark.icon !== undefined
    );

    // 添加到总数组中
    allBookmarks.push(...imageBookmarks);
  });

  // 处理重复名称的书签，统计每个名称对应的icon出现次数
  const nameIconCountMap = new Map<string, Map<string, number>>();
  const nameBookmarkMap = new Map<string, BookmarkCardData[]>();

  allBookmarks.forEach((bookmark) => {
    const name = bookmark.name;
    const iconKey = bookmark.icon?.key || bookmark.icon?.url || '';

    // 统计名称出现次数及对应的icon
    if (!nameIconCountMap.has(name)) {
      nameIconCountMap.set(name, new Map<string, number>());
      nameBookmarkMap.set(name, []);
    }

    const iconCountMap = nameIconCountMap.get(name)!;
    iconCountMap.set(iconKey, (iconCountMap.get(iconKey) || 0) + 1);
    nameBookmarkMap.get(name)!.push(bookmark);
  });

  // 为每个重复名称选择出现次数最多的icon对应的书签
  const result: BookmarkInfo[] = [];

  nameIconCountMap.forEach(async (iconCountMap, name) => {
    // 找到出现次数最多的icon
    let maxCount = 0;
    let maxIconKey = '';

    iconCountMap.forEach((count, iconKey) => {
      if (count > maxCount) {
        maxCount = count;
        maxIconKey = iconKey;
      }
    });

    // 找到对应icon的书签数据
    const bookmarksWithName = nameBookmarkMap.get(name) || [];
    const bookmarkWithMaxIcon = bookmarksWithName.find((bookmark) => {
      const iconKey = bookmark.icon?.key || bookmark.icon?.url || '';
      return iconKey === maxIconKey;
    });

    // 添加到结果中
    if (bookmarkWithMaxIcon) {
      const iconUrl = await getIconUrl(bookmarkWithMaxIcon.icon as IconData);
      result.push({
        name: bookmarkWithMaxIcon.name,
        iconType: bookmarkWithMaxIcon.iconType,
        iconUrl: iconUrl,
        icon: bookmarkWithMaxIcon.icon as IconData,
        url: bookmarkWithMaxIcon.url || '',
        bgColor: bookmarkWithMaxIcon.bgColor,
      });
    }
  });

  return result;
}

/**
 * 根据图标数据获取图标URL
 * @param icon 图标数据对象，包含图标存储方式和键值等信息
 * @returns 返回图标的URL，如果无法获取则返回默认书签图标
 */
export async function getIconUrl(icon: IconData) {
  const indexedDB = useIndexedDB(); // 获取IndexedDB实例
  // 如果图标存储方式为本地存储，则直接返回图标URL或默认图标
  if (icon?.store === IconStoreType.LOCAL) {
    return icon.url || DEFAULT_BOOKMARK_ICON;
  }
  // 从IndexedDB中获取图标数据
  const db = (await indexedDB.iconDB.getItem(
    icon?.key as string
  )) as Blob | null;
  // 如果获取到图标数据，则创建对象URL，否则返回默认图标
  return db ? URL.createObjectURL(db) : DEFAULT_BOOKMARK_ICON;
}
