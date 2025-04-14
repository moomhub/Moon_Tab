// 基础配置数据
export interface BaseSettingData {
  searchOpenWay: boolean; // 搜索打开方式：true 新窗口打开，false 当前窗口打开
  bookmarkOpenWay: boolean; // 书签打开方式 true 新窗口打开，false 当前窗口打开
  searchEngine: string; // 当前搜索引擎
  searchEngineConfig: SearchEngineConfig[]; // 搜索引擎配置项
}
// 定义搜索配置项的接口类型
export interface SearchEngineConfig {
  id: string; // 配置项的唯一标识
  name: string; // 搜索引擎名称
  url: string; // 搜索地址，{query} 为查询关键字占位符
  icon: string; // 搜索引擎图标路径
  enabled: boolean; // 是否启用该搜索引擎
}

// ================本地壁纸数据类型===========================
// 定义壁纸配置的接口类型
export interface WallpaperSettingData {
  type: WallpaperType; // 壁纸类型：bing 或 local
  bing: BingWallpaperConfig;
  local: CustomWallpaperConfig;
}

// 定义壁纸类型的枚举类型
export enum WallpaperType {
  // 每日BING壁纸
  BING = 0,
  // 本地壁纸
  LOCAL = 1,
}

// Bing 壁纸配置
export interface BingWallpaperConfig {
  randomChoose: boolean; // true 随机选择，false 自定义选择
  date: string; // 日期，格式为 YYYY-MM-DD(当前日期)
}

// 本地壁纸配置
export interface WallpaperImage {
  image: string; // 壁纸图片路径
  video: string; // 动态壁纸内容路径
}

// 本地壁纸配置
export interface CustomWallpaperConfig {
  current: WallpaperImage; // 当前选择的图片路径
  images: WallpaperImage[]; // 本地选择的图片路径数组
}

// S3连接配置
export interface S3ConnectionConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  folder?: string;
}

// ====================备份和恢复配置===========================
export interface BackupAndRecoverySettingData {
  local: {
    lastBackupDate: string; // 上次备份日期
    lastRecoveryDate: string; // 上次恢复日期
  };
  s3: {
    enabled: boolean; // 是否启用S3备份
    autoBackup: boolean; // 是否自动备份
    backupInterval: number; // 备份间隔（天）
    lastBackupDate: string; // 上次备份日期
    lastRecoveryDate: string; // 上次恢复日期
  }; // 将webdav改为s3
  s3Config: S3ConnectionConfig; // S3连接配置
}
