import { UploadFile } from 'tdesign-vue-next';
import { BookmakeIconType } from './index';

// 图标类型
export enum IconStoreType {
  LOCAL = 'local', // 本地
  DB = 'db', // 远程
}
// 图标数据库信息
export interface IconData {
  store: IconStoreType; // 图标类型
  key?: string; // 数据中的key
  url?: string; // 图标地址
}

export interface UploadIconData extends IconData {
  blob?: Blob; // 文件
  type?: BookmakeIconType; // 图标类型
}
