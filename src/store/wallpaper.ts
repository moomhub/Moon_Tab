import { defineStore } from 'pinia';
import persist from './plugin';
import { WallpaperType } from '@/types/wallpaper';
import { BING_DAILY_WALLPAPER_DB_KEY } from '@/constants';

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

    return {
      type,
      bingDailyDate,
      localWallpapreId,
      currentWallpaperId,
    };
  },
  {
    persist: persist('wallpaper'),
  }
);

export default useWallpaperStore;
