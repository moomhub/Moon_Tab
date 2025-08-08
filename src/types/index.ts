import { IconData } from './icon';

// 卡片类型
export enum CardType {
  // 书签卡片
  BOOKMARK = 0,
  // 倒计时卡片
  COUNTDOWN = 1,
  // 天气卡片
  WEATHER = 2,
}

// 书签图标类型
export enum BookmakeIconType {
  // 图片类型
  IMAGE = 0,
  // 文字类型
  TEXT = 1,
}

export interface Position {
  x: number; // x轴
  y: number; // y轴
  h: number; // 高度
  w: number; // 宽度
}

// 基础卡片
interface BaseCardData {
  id?: string; // uuid
  type: CardType; // 类型
  name: string; // 名称
  position: Position;
}

// 书签卡片类型
export interface BookmarkCardData extends BaseCardData {
  url?: string; // 链接
  placeholder: boolean; // 是否为占位卡片，true为占位卡片，false为正常卡片，占位卡片不会跳转网页
  desc: string; // 书签描述
  iconType: BookmakeIconType; // 图标类型
  icon?: IconData; // 图标链接
  icons?: IconData[]; // 图标链接数据
  bgColor: string; // 背景颜色
}

// 倒计时卡片类型
export interface CountdownCardData extends BaseCardData {
  text: string; // 文本
  date: string; // 日期
  background: string; // 背景图片
}
// 天气卡片类型
export interface WeatherCardData extends BaseCardData {
  city: string; // 城市
  region: string; // 背景颜色
}

export interface ExtendCardData {
  [key: string]: any;
}
// 所有卡片
export type AllCardData =
  | BookmarkCardData
  | CountdownCardData
  | WeatherCardData
  | ExtendCardData;

// 插件配置
export interface PluginSettings {
  theme: 'light' | 'dark'; // 主题
  fontSize: number; // 字体大小
  backgroundImage: string; // 背景图片
}

// 滑动页面类型
export interface SwiperData {
  id: string; // 滑动ID
  data: Array<AllCardData>; // 书签数据
}

/**
 * 卡片组件接口定义
 */
export interface CardInformationData {
  /** 卡片显示名称 */
  title: string;
  /** 卡片类型 */
  type: CardType;
  /** 卡片图标路径 */
  image: string;
  /** 卡片描述 */
  desc: string;
}

// 卡片布局
export enum CardLayoutEnum {
  ONE = '1x1',
  TWO = '2x1',
  THREE = '1x2',
  FOUR = '2x2',
  FIVE = '2x3',
}

export interface ContextMenuData {
  position: {
    x: number; // x轴
    y: number; // y轴
  };
  swiperId: string; // 滑动ID
  card: AllCardData; // 卡片ID
}

export interface BookmarkIcon {
  image: boolean; // 图片
  value: string; // 图片链接或者文字
}

// Swiper 滑动页面略缩信息
export interface ThumbnailPage {
  id: string; // 滑动页面ID
  thumbnail: string; // 略缩图
}
