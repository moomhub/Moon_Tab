<template>
  <t-layout @click="setMenuVisible(false)">
    <div class="wallpaper">
      <img
        draggable="false"
        :src="showWallpaper(wallpaper.imageData)"
        crossorigin="anonymous"
      />
      <video
        class="wallpaper-video"
        preload="auto"
        loop
        playsinline
        autoplay
        muted
        :src="showWallpaper(wallpaper.videoData)"
        tabindex="-1"
      ></video>
    </div>
    <SearchBar />
    <t-content>
      <SwiperCard ref="swiperRef" />
    </t-content>
    <!-- 侧边栏 -->
    <t-sticky-tool
      placement="right-bottom"
      shape="round"
      type="compact"
      @click="handleStickyToolClick"
      class="operate-menu"
    >
      <t-sticky-item label="home">
        <template #icon><home-icon /></template>
      </t-sticky-item>
      <t-sticky-item label="add">
        <template #icon><add-icon /></template>
      </t-sticky-item>
      <t-sticky-item label="system">
        <template #icon> <setting1-filled-icon /></template>
      </t-sticky-item>
    </t-sticky-tool>
    <AddCard ref="addCardRef" />
    <SystemSettings ref="systemSettingsRef" />
  </t-layout>
</template>
<script setup lang="ts" name="App">
import { Setting1FilledIcon, AddIcon, HomeIcon } from 'tdesign-icons-vue-next';
import { setMenuVisible, initEventBus } from '@/utils/eventBus';

import { TdStickyItemProps } from 'tdesign-vue-next';
import AddCard from '@/page/add-card/AddCard.vue';
import SystemSettings from '@/page/system-settings/SystemSettings.vue';
import SearchBar from '@/page/search-bar/SearchBar.vue';
import SwiperCard from '@/page/swiper/CardSwiper.vue';
import { CheckBackUpToS3 } from './utils/system';
import { CurrentWallpaperResult, WallpaperImage } from './types/wallpaper';
import { DEFAULT_LOCAL_WALLPAPER, DEFAULT_WALLPAPER } from './constants';
import { initBingDailyWallpaper } from './utils/wallpaper';
import {
  useIndexedDB,
  useSwiperStore,
  useWallpaperStore,
  useSystemStore,
} from './store';

// Pinia store
const systemStore = useSystemStore();
const swiperStore = useSwiperStore();
const indexedDB = useIndexedDB();
const wallpaperStore = useWallpaperStore();

// Vue Ref
const swiperRef = ref<InstanceType<typeof SwiperCard>>();
const addCardRef = ref<InstanceType<typeof AddCard>>();
const systemSettingsRef = ref<InstanceType<typeof SystemSettings>>();

// 当前壁纸
const wallpaper = ref<CurrentWallpaperResult>(DEFAULT_WALLPAPER);

/**
 * 点击侧边栏按钮
 * @param context 点击事件上下文
 */
const handleStickyToolClick = (context: {
  e: MouseEvent;
  item: TdStickyItemProps;
}) => {
  const { label } = context.item;
  console.log('choose sticky tool label:', label);
  switch (label) {
    case 'home':
      swiperRef.value?.returnHome();
      break;
    case 'add':
      addCardRef.value?.openDrawer();
      break;
    case 'system':
      systemSettingsRef.value?.openSystemSetting();
      break;
  }
};

// 根据不同的类型构建不同的壁纸
function showWallpaper(value: string | Blob | undefined) {
  return value instanceof Blob ? URL.createObjectURL(value) : value;
}
// 初始化壁纸数据
async function initWallpapre() {
  // 获取当前壁纸信息
  const result = (await indexedDB.wallpaperDB.getItem(
    wallpaperStore.currentWallpaperId
  )) as WallpaperImage | null;

  if (result === null) {
    wallpaper.value = DEFAULT_LOCAL_WALLPAPER;
    return;
  }
  wallpaper.value = {
    imageData: result.imageData,
    videoData: result.videoData,
  };
  return;
}

watch(
  () => wallpaperStore.currentWallpaperId,
  async (newValue) => {
    // 监听当前壁纸ID的变化.实时更新当前壁纸信息
    await initWallpapre();
  }
);

onBeforeMount(async () => {
  // 初始化swiper数据
  swiperStore.init();
  // 初始化事件总线
  initEventBus();
  // 初始化壁纸数据
  await initWallpapre();
  // 初始化bing每日壁纸数据
  await initBingDailyWallpaper();
  // 检查是否需要备份数据到S3
  await CheckBackUpToS3();
});
</script>

<style lang="less" scope>
@import './style.less';
.operate-menu {
  right: 10px !important;
  border: unset !important;
  background-color: unset !important;
  box-shadow: unset !important;

  &:hover {
    .t-sticky-item {
      .t-icon {
        color: var(--td-text-color-anti) !important;
      }
    }
  }
  .t-sticky-item {
    &:hover {
      background-color: rgb(221, 221, 221, 0.5) !important;
      .t-icon {
        color: var(--td-text-color-anti) !important;
      }
    }
    .t-icon {
      color: var(--td-text-color-anti) !important;
    }
  }
}
.wallpaper {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    font-size: 0; /* 隐藏损坏图标 */
    color: transparent; /* 隐藏alt文本 */

    // 隐藏空src的图片
    &[src=''] {
      display: none;
    }
  }
  .wallpaper-video {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: inline-block;
    vertical-align: baseline;
  }
}
</style>
