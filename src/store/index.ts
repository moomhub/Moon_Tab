import { createPinia } from 'pinia';
import persistedstate from 'pinia-plugin-persistedstate';
import useSwiperStore from './swiper';
import useSystemStore from './system';
import useIndexedDB from './indexedDB';
import useWallpaperStore from './wallpaper';

const pinia = createPinia();
pinia.use(persistedstate);
// 解决setup pinia $reset 失效
// look https://stackoverflow.com/questions/71690883/pinia-reset-alternative-when-using-setup-syntax
pinia.use(({ store }) => {
  const initialState = JSON.parse(JSON.stringify(store.$state));
  store.$reset = () => {
    store.$patch(initialState);
  };
});

export { useSwiperStore, useSystemStore, useIndexedDB, useWallpaperStore };

export default pinia;
