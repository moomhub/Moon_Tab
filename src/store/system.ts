import { defineStore } from 'pinia';
import persist from './plugin';
import {
  BackupAndRecoverySettingData,
  BaseSettingData,
  WallpaperSettingData,
} from '@/types/store';

import {
  DEFAULT_BACKUP_SETTING_DATA,
  DEFAULT_BASE_SETTING_DATA,
  DEFAULT_WALLPAPER_SETTING_DATA,
} from '@/constants/store';

// 系统设置数据
const useSystemStore = defineStore(
  'systemStore',
  () => {
    // 基础配置
    const baseSetting = ref<BaseSettingData>(DEFAULT_BASE_SETTING_DATA);

    // 存储配置
    const backupSetting = ref<BackupAndRecoverySettingData>(
      DEFAULT_BACKUP_SETTING_DATA
    );

    return {
      baseSetting,
      backupSetting,
    };
  },
  {
    persist: persist('system'),
  }
);

export default useSystemStore;
