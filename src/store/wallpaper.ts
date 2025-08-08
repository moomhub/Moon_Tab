import { defineStore } from 'pinia';
import persist from './plugin';
import { WallpaperImage, WallpaperType } from '@/types/wallpaper';
import { BING_DAILY_WALLPAPER_DB_KEY, LOCAL_WALLPAPER } from '@/constants';
import useIndexedDB from './indexedDB';

// 系统设置数据
const useWallpaperStore = defineStore(
  'wallpaperStore',
  () => {
    // 当前壁纸类型  默认壁纸类型：bing
    const type = ref<WallpaperType>(WallpaperType.LOCAL);

    // bing 每日壁纸的日期 默认日期：2025-01-01
    const bingDailyDate = ref<string>('2025-01-01');

    // 本地壁纸ID（默认为本地壁纸）
    const localWallpapreId = ref<string>('local');

    // 当前壁纸ID,根据类型动态计算
    const currentWallpaperId = computed(() => {
      if (type.value === WallpaperType.LOCAL) {
        return localWallpapreId.value;
      }
      return BING_DAILY_WALLPAPER_DB_KEY;
    });

    async function getCurrentWallpaperImage(): Promise<string> {
      const indexedDB = useIndexedDB();

      try {
        let wallpaperData: WallpaperImage | null ;
        if(currentWallpaperId.value === 'local'){
          wallpaperData = LOCAL_WALLPAPER;
        }else{
          wallpaperData =  await indexedDB.wallpaperDB.getItem(currentWallpaperId.value);
        }
        if (wallpaperData && wallpaperData.imageData) {
          // 如果是Blob对象，转换为URL
          if (wallpaperData.imageData instanceof Blob) {
            return URL.createObjectURL(wallpaperData.imageData);
          }
          // 如果已经是URL字符串，直接返回
          return wallpaperData.imageData as string;
        }
      } catch (error) {
        console.error('获取壁纸图片失败:', error);
      }
      // 返回默认背景色
      return '#f1f3f5';
    }

    return {
      type,
      bingDailyDate,
      localWallpapreId,
      currentWallpaperId,
      getCurrentWallpaperImage,
    };
  },
  {
    persist: persist('wallpaper'),
  }
);

export default useWallpaperStore;
