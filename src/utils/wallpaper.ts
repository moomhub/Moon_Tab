import { useIndexedDB, useWallpaperStore } from '@/store';
import {
  BingWallpaperResuleData,
  BingWallpaperData,
  WallpaperImage,
  WallpaperType,
} from '@/types/wallpaper';
import { dayjs } from './time';
import { getBingDailyWallpaperData } from '@/api';
import { BING_DAILY_WALLPAPER_DB_KEY } from '@/constants';

/**
 * 将 BingImageResuleData 转换为 BingWallpaperData
 * @param data - 原始的 BingImageResuleData 数据
 * @param currentIndex - 当前图片索引，默认为 0
 * @returns 转换后的 BingWallpaperData 对象
 */
export function convertBingWallpaperData(
  data: BingWallpaperResuleData
): BingWallpaperData {
  const bingBaseUrl = 'https://cn.bing.com';
  const imageUrls = data.images.map((item) => bingBaseUrl + item.url);
  return {
    images: imageUrls,
    date: new Date().toDateString(),
  };
}

// 获取自定义壁纸图片
export async function getLocalWallpapersFromDB() {
  const indexedDB = useIndexedDB();
  const result: WallpaperImage[] = [];
  try {
    await indexedDB.wallpaperDB.iterate(
      (value: WallpaperImage, key, iterationNumber) => {
        if (value.type === WallpaperType.LOCAL) {
          result.push(value); // 返回每个键的值，也可以返回 fals
        }
      }
    );
  } catch (error) {
    console.log('wallpaper: get local wallpaper data error:', error);
  }
  return result;
}

// 初始化每日bing壁纸数据
export async function initBingDailyWallpaper() {
  const wallpaperStore = useWallpaperStore();
  const indexedDB = useIndexedDB();
  const now = dayjs();
  const lastBackup = dayjs(wallpaperStore.bingDailyDate);
  const diff = now.diff(lastBackup, 'day');
  if (diff <= 0) {
    // 有当天bing壁纸的数据，直接返回本地indexedDB中的数据
    return;
  }
  try {
    // 获取每日bing壁纸数据
    const bingImageData = await getBingDailyWallpaperData();
    const url = bingImageData.images[0];
    // 加载图片
    const imageResponse = await fetch(url);
    const imageBlob = await imageResponse.blob();
    // 保存到IndexedDB中
    await indexedDB.wallpaperDB.setItem(BING_DAILY_WALLPAPER_DB_KEY, {
      id: BING_DAILY_WALLPAPER_DB_KEY,
      type: WallpaperType.BING,
      imageData: imageBlob,
      createdAt: new Date(),
    });
    wallpaperStore.bingDailyDate = dayjs().format('YYYY-MM-DD');
    return;
  } catch (e) {
    console.log('wallpaper: get bing daily wallpaper data error:', e);
  }
}
