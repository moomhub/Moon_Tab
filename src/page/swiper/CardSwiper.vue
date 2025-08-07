<template>
  <div class="swiper-container">
    <swiper
      class="swiper"
      ref="swiperRef"
      direction="vertical"
      :slides-per-view="1"
      :space-between="50"
      :loop="true"
      :simulateTouch="false"
      :mousewheel="true"
      :allow-touch-move="false"
      :touch-start-prevent-default="false"
      :touchMoveStopPropagation="false"
      :preventClicksPropagation="false"
      :modules="[Mousewheel, Pagination, Navigation]"
      :pagination="{ clickable: true, enabled: true }"
      events-prefix="swiper-"
      @init="onInit"
      @real-index-change="onRealIndexChange"
    >
      <swiper-slide
        class="swiper-container"
        v-for="(swiperData, indexs) in swiperDatas"
        :key="swiperData.id"
      >
        <div
          class="max flex-center"
          :ref="(el) => setSwiperPageRef(el, swiperData.id)"
        >
          <div class="grid-container">
            <CardGrid
              :bookmark="swiperData"
              @-context-menu="handelContextMunu"
            />
          </div>
        </div>
      </swiper-slide>
    </swiper>

    <!-- 右键菜单 -->
    <ContextMenu ref="contextMenuRef" @edit="handleCardEdit" />
    <!-- 通用书签编辑 -->
    <EditCardDataDialog ref="editCardDataDialogRef" />
  </div>
</template>

<script setup lang="ts">
// 由于 swiper/vue 未导出 SwiperClass，从 swiper 核心模块导入
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Swiper as SwiperClass } from 'swiper';
import { Mousewheel, Navigation, Pagination } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import ContextMenu from '@/components/ContextMenu.vue';
import EditCardDataDialog from '@/components/dialog/EditCardDataDialog.vue';
import CardGrid from './CardGrid.vue';
import { useSwiperStore, useWallpaperStore } from '@/store';
import {
  currentSwiperIndex,
  setCurrentSwiperId,
  setSwiperPageDoms,
} from '@/utils/eventBus';
import { AllCardData, ContextMenuData, SwiperData } from '@/types';

// Pinia store
const swiperStore = useSwiperStore();
const wallpaperStore = useWallpaperStore();
// 滑动实例Ref
const swiperElement = ref<SwiperClass | null>(null);
// 滑动数据
const swiperDatas = computed(() => swiperStore.swiperData);

// 滑动页面dom Ref
const swiperPageRefs = ref<Record<string, any>>({});

// 获取页面 DOM 引用
const setSwiperPageRef = async (el: any, id: string) => {
  if (el) {
    swiperPageRefs.value[id] = el;
  }
};

// 滑动组件Ref
const swiperRef = ref<InstanceType<typeof Swiper>>();

const editCardDataDialogRef = ref<InstanceType<typeof EditCardDataDialog>>();

// 监听当前真实索引改变
const onRealIndexChange = (swiper: any) => {
  console.log('current swiper real index', swiper.realIndex);
  setCurrentSwiperId(swiperStore.swiperData[swiper.realIndex].id);
};

// 监听原始滑动页面改变
watch(
  () => swiperStore.swiperData.length,
  (newVal) => {
    console.log('current swiper index {}', currentSwiperIndex.value, newVal);
    console.log('swiper data length:', newVal);
    const swiperIndex = currentSwiperIndex.value + 1;
    if (swiperIndex > newVal) {
      // 如果当前索引大于等于新的数组长度，将索引设置为数组的最后一个元素的索引
      // 为了解决删除最后一个页面时，当前索引失效的情况
      currentSwiperIndex.value = newVal;
      swiperElement.value?.slideToLoop(currentSwiperIndex.value, 300, true);
    }
  }
);

// 回到首页
function returnHome() {
  swiperElement.value?.slideToLoop(0, 300, true);
}

// swiper初始化 时将会对象赋值
function onInit(swiper: any) {
  console.log('swiper real index:', swiper);
  swiperElement.value = swiper;
  setCurrentSwiperId(swiperStore.swiperData[swiper.realIndex].id);
}

// 右键菜单Ref
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>();

const selectedCard = ref<AllCardData>();

// 处理右键事件
function handelContextMunu(data: ContextMenuData) {
  contextMenuRef.value?.openContextMenu(data);
}

function handleCardEdit(data: AllCardData) {
  selectedCard.value = { ...data };
  console.log('selected card edit value', selectedCard.value);
  editCardDataDialogRef.value?.openEditCardDialog(data);
}

onMounted(() => {
  setSwiperPageDoms(swiperPageRefs.value);
});

// 暴露方法给父组件调用
defineExpose({
  // 回到首页
  returnHome,
});
</script>

<style lang="less" scoped>
.swiper {
  z-index: unset;

  :deep(.swiper-wrapper) {
    z-index: unset;
  }
}

.swiper-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  // opacity: 0
}

.grid-container {
  width: 80rem;
  height: 100%;
  padding-top: 30vh;
}
.swiper {
  width: 100%;
  height: 100vh;
  margin-bottom: auto;
  margin-top: auto;

  &-slide {
    text-align: center;
    font-size: 18px;
    // background: #fff;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :deep(.swiper-pagination) {
    left: 10px;
    right: unset !important;

    &-bullet {
      width: 3px;
      height: 16px;
      right: 0;
      background: var(--td-bg-color-container);
      opacity: 0.5;
      border-radius: 10px;

      &-active {
        background: var(--td-bg-color-container);
        opacity: 1;
      }
    }
  }
}
</style>
