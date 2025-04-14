import {
  BackupAndRecoverySettingData,
  BaseSettingData,
  BingWallpaperConfig,
  S3ConnectionConfig,
  SearchEngineConfig,
  WallpaperSettingData,
  WallpaperType,
} from '@/types/store';

// 所有搜索引擎
export const ALL_SEARCH_ENGINE_CONFIG: SearchEngineConfig[] = [
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd={query}',
    icon: new URL('@/assets/search/baidu.svg', import.meta.url).href,
    enabled: true,
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://cn.bing.com/search?form=bing&q={query}',
    icon: new URL('@/assets/search/bing.svg', import.meta.url).href,
    enabled: true,
  },
  {
    id: 'google',
    name: 'google',
    url: 'https://www.google.com/search?q={query}',
    icon: new URL('@/assets/search/google.svg', import.meta.url).href,
    enabled: true,
  },
  {
    id: '360',
    name: '360',
    url: 'https://www.so.com/s?q={query}',
    icon: new URL('@/assets/search/360.svg', import.meta.url).href,
    enabled: true,
  },
  {
    id: 'sogou',
    name: '搜狗',
    url: 'https://www.sogou.com/web?query={query}',
    icon: new URL('@/assets/search/sogou.svg', import.meta.url).href,
    enabled: true,
  },
  {
    id: 'yandex',
    name: 'Yandex',
    url: 'https://yandex.com/search/?text={query}',
    icon: new URL('@/assets/search/yandex.svg', import.meta.url).href,
    enabled: true,
  },
];

// 默认基础配置数据
export const DEFAULT_BASE_SETTING_DATA: BaseSettingData = {
  searchEngine: 'baidu', // 默认搜索引擎
  searchEngineConfig: ALL_SEARCH_ENGINE_CONFIG, // 所有搜索引擎配置项
  searchOpenWay: true, // 默认搜索打开方式：true 新窗口打开，false 当前窗口打开
  bookmarkOpenWay: true, // 默认书签打开方式 true 新窗口打开，false 当前窗口打开
};

export const DEFAULT_BING_WALLPAPER_CONFIG: BingWallpaperConfig = {
  randomChoose: true, // 默认随机选择
  date: '2025-01-01', // 默认日期，格式为 YYYY-MM-DD
};

// 默认壁纸配置数据
export const DEFAULT_WALLPAPER_SETTING_DATA: WallpaperSettingData = {
  type: WallpaperType.BING, // 默认壁纸类型：bing
  bing: {
    randomChoose: true, // 默认随机选择
    date: '2024-01-01', // 默认日期，格式为 YYYY-MM-DD
  },
  local: {
    current: {
      image: new URL('@/assets/wallpaper/local-default.jpg', import.meta.url)
        .href,
      video: new URL('@/assets/wallpaper/local-default.mp4', import.meta.url)
        .href,
    }, // 默认当前选择的图片路径
    images: [
      {
        image: new URL('@/assets/wallpaper/local-default.jpg', import.meta.url)
          .href, // 默认当前选择的图片路径
        video: new URL('@/assets/wallpaper/local-default.mp4', import.meta.url)
          .href, // 默认当前选择的图片路径
      },
    ], // 默认本地选择的图片路径数组
  },
};

// 默认的S3连接配置
export const DEFAULT_S3_CONNECTION_CONFIG: S3ConnectionConfig = {
  endpoint: '',
  region: '', // AWS默认区域
  accessKeyId: '',
  secretAccessKey: '',
  bucket: '',
};

// 默认的备份和恢复设置数据
export const DEFAULT_BACKUP_SETTING_DATA: BackupAndRecoverySettingData = {
  local: {
    lastBackupDate: '',
    lastRecoveryDate: '',
  },
  s3: {
    enabled: false,
    autoBackup: false,
    backupInterval: 7,
    lastBackupDate: '',
    lastRecoveryDate: '',
  },
  s3Config: DEFAULT_S3_CONNECTION_CONFIG, // 默认的S3连接配置
};
