import {
  CurrentWallpaperResult,
  WallpaperImage,
  WallpaperType,
} from '@/types/wallpaper';

// 文件类型
export const FileAccept = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
  doc: 'application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
  excel:
    'application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip, application/x-zip-compressed',
  rar: 'application/x-rar-compressed',
  txt: 'text/plain',
  code: 'text/plain',
  all: '*/*',
};

// 本地默认壁纸
export const LOCAL_WALLPAPER: WallpaperImage = {
  id: 'local',
  type: WallpaperType.LOCAL,
  imageData: new URL('@/assets/wallpaper/local-default.jpg', import.meta.url)
    .href, // 默认当前选择的图片路径
  videoData: new URL('@/assets/wallpaper/local-default.mp4', import.meta.url)
    .href, // 默认当前选择的图片路径
};

// 本地存储的bing每日壁纸的key，用于存储bing每日壁纸的信息，包括图片和视频
export const BING_DAILY_WALLPAPER_DB_KEY = 'bing_daily_wallpaper';

// 默认的壁纸
export const DEFAULT_WALLPAPER: CurrentWallpaperResult = {
  imageData: '', // 本地壁纸
  videoData: '', // 本地视频
};

// 默认的壁纸
export const DEFAULT_LOCAL_WALLPAPER: CurrentWallpaperResult = {
  imageData: LOCAL_WALLPAPER.imageData, // 本地壁纸
  videoData: LOCAL_WALLPAPER.videoData, // 本地视频
};
