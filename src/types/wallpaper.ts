// 定义Bing每日图像对象的接口
interface BingDailyImageItem {
  startdate: string;
  fullstartdate: string;
  enddate: string;
  url: string;
  urlbase: string;
  copyright: string;
  copyrightlink: string;
  title: string;
  quiz: string;
  wp: boolean;
  hsh: string;
  drk: number;
  top: number;
  bot: number;
  hs: any[];
}

// 定义工具提示对象的接口
interface BingTooltips {
  loading: string;
  previous: string;
  next: string;
  walle: string;
  walls: string;
}

// 定义每日壁纸数据接口对象
export interface BingWallpaperResuleData {
  images: BingDailyImageItem[];
  tooltips: BingTooltips;
}

// bing 每日壁纸数据
export interface BingWallpaperData {
  images: string[]; // 图片URL数组
  date: string; // 图片日期
}

// 壁纸类型
export enum WallpaperType {
  LOCAL = 'local', // 自定义
  BING = 'bing', // bing
}

// 壁纸对象 包含图片数据和视频数据（动态）
export interface WallpaperImage {
  id: string; // 图片ID
  type: WallpaperType; // 图片类型
  imageData?: Blob | string; // 图片数据
  videoData?: Blob | string; // 视频数据
  createdAt?: Date; // 创建时间
}

export interface CurrentWallpaperResult {
  imageData?: Blob | string; // 图片数据
  videoData?: Blob | string; // 视频数据
}
