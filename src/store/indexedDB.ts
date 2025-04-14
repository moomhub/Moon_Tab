import { defineStore } from 'pinia';
import localforage from 'localforage';

// 系统设置数据
const useIndexedDB = defineStore('indexedDB', () => {

  // 壁纸数据库
  const wallpaperDB = localforage.createInstance({
    name: 'wallpaperDB',
    driver: localforage.INDEXEDDB,
    storeName: 'wallpaperDB',
    description: 'wallpaperDB',
  });

  // 图标数据库
  const iconDB = localforage.createInstance({
    name: 'iconDB',
    driver: localforage.INDEXEDDB,
    storeName: 'iconDB',
    description: 'iconDB',
  });

  return {
    wallpaperDB,
    iconDB,
  };
});

export default useIndexedDB;
