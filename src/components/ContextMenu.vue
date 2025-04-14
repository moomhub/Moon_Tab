<template>
  <Teleport to="body">
    <div
      class="moom-menu"
      v-show="menuVisible"
      :style="{
        top: Math.min(currentPosition.y, windowHeight - 300) + 'px',
        left: currentPosition.x + 'px',
      }"
    >
      <t-space direction="vertical">
        <div>
          <div class="item">布局大小</div>

          <div class="item">
            <t-space break-line size="1">
              <div
                v-for="size in sizeOptions"
                :key="size.label"
                class="option"
                :class="{ 'is-active': isCurrentSize(size.value) }"
                @click="handleSizeChange(size.value)"
              >
                <div class="menu-item-content">
                  <div class="menu-item-label">{{ size.label }}</div>
                </div>
              </div>
            </t-space>
          </div>
          <div class="hover item" @click="handleEdit">
            <span>修改</span>
          </div>
          <div class="hover item delete" @click="handleDelete">
            <span>删除</span>
          </div>
        </div>
      </t-space>
    </div>
  </Teleport>
</template>

<script setup lang="ts" name="ContextMenu">
// import { closeAllMenus, isMenuActive } from '../utils/eventBus'
import { MessagePlugin } from 'tdesign-vue-next';
import {
  menuVisible,
  menuData,
  setMenuVisible,
  getCurrentSwiperId,
  setCurrentSwiperId,
} from '@/utils/eventBus';

import { useIndexedDB, useSwiperStore } from '@/store';
import {
  AllCardData,
  BookmarkCardData,
  CardType,
  ContextMenuData,
  Position,
} from '@/types';
import {
  computeCardIsChange,
  getCurrentSwiperAllCardPosition,
} from '@/utils/swiper';
import BookmarkCard from './card/BookmarkCard.vue';
import { IconStoreType } from '@/types/icon';

// Pinia store
const swiperStore = useSwiperStore();

// 布局大小选项
const sizeOptions = [
  { label: '1×1', value: { width: 1, height: 1 }, description: '小卡片' },
  { label: '1×2', value: { width: 2, height: 1 }, description: '横向卡片' },
  { label: '2×1', value: { width: 1, height: 2 }, description: '竖向卡片' },
  { label: '2×2', value: { width: 2, height: 2 }, description: '中等卡片' },
  { label: '2×3', value: { width: 3, height: 2 }, description: '大卡片' },
];

// 是否为当前大小（高亮选项）
const isCurrentSize = (size: { width: number; height: number }) => {
  return (
    currentCardData.value?.position.w === size.width &&
    currentCardData.value?.position.h === size.height
  );
};

// 处理卡片布局改变事件
const handleSizeChange = (size: { width: number; height: number }) => {
  // 当前卡片位置
  const originalCardPosition = currentCardData.value?.position as Position;
  const changeCardPosition = {
    cardId: currentCardData.value?.id || '', // 假设你有一个当前卡片的 ID 或其他标识
    position: {
      x: currentCardData.value?.position.x || 0,
      y: currentCardData.value?.position.y || 0,
      w: size.width,
      h: size.height,
    },
  };
  console.log(
    'original/change card position:',
    originalCardPosition,
    changeCardPosition
  );
  const swiperData = swiperStore.getSwiperDataById(getCurrentSwiperId());
  const currentSwiperAllCardPosition = getCurrentSwiperAllCardPosition(swiperData);
  // 计算卡片是否可以改变
  const result = computeCardIsChange(
    currentSwiperAllCardPosition,
    changeCardPosition
  );
  console.log('compute change card position result:', result);
  if (!result.success) {
    MessagePlugin.error('当前页面没有空余位置,请跳转卡片后再修改卡片布局');
    setMenuVisible(false);
    return;
  }
  const change = result.positions as [];
  swiperStore.updateCardPositionBySwiperIdss(getCurrentSwiperId(), change);
  setMenuVisible(false);
  return;
};

// 处理卡片编辑事件
const handleEdit = () => {
  emit('edit', currentCardData.value as AllCardData);
  setMenuVisible(false);
};

// 处理卡片删除事件
const handleDelete = () => {
  if (currentCardData.value?.type === CardType.BOOKMARK) {
    const icon = (currentCardData.value as BookmarkCardData).icon;
    if (icon?.store === IconStoreType.DB) {
      const indexedDB = useIndexedDB(); // 确保这里正确引入 useIndexedDB 函数
      indexedDB.iconDB.removeItem(icon.key as string); // 删除 bookmark中的图标
    }
  }
  swiperStore.deleteCardBySwiperIdAndCardId(
    getCurrentSwiperId(),
    menuData.value.cardId
  );
  setMenuVisible(false);
};

const windowHeight = ref(0);

onMounted(() => {
  windowHeight.value = window.innerHeight;
  window.addEventListener('resize', updateWindowHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowHeight);
});

const updateWindowHeight = () => {
  windowHeight.value = window.innerHeight;
};

// 当前卡片数据
const currentCardData = ref<AllCardData>();
// 当前坐标
const currentPosition = ref({
  x: 0,
  y: 0,
});

// 打开右键菜单
function openContextMenu(data: ContextMenuData) {
  currentCardData.value = data.card;
  setCurrentSwiperId(data.swiperId);
  currentPosition.value = { x: data.position.x, y: data.position.y };
  nextTick(() => {
    setMenuVisible(true);
  });
}

// 关闭右键菜单
function closeContextMenu() {
  setMenuVisible(false);
}
// 抛出事件
defineExpose({ openContextMenu, closeContextMenu });

const emit = defineEmits<{
  (e: 'edit', card: AllCardData): void;
}>();
</script>

<style lang="less" scoped>
.moom-menu {
  position: fixed;
  width: 160px;
  background: var(--td-bg-color-container);
  z-index: 100;
  border-radius: var(--td-radius-small);
  padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
  font-size: var(--td-font-size-link-small);
  color: var(--td-text-color-primary);

  .item {
    font-size: var(--td-font-size-link-medium);
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);

    .option {
      display: flex;
      align-items: center;
      padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-xl);
      cursor: pointer;
      transition: background-color 0.2s;
      color: black;
      border-radius: var(--td-radius-small);
      font-size: var(--td-font-size-link-small);
      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }
    }
    .is-active {
      color: var(--td-brand-color);
    }
  }

  .hover {
    cursor: pointer;
    &:hover {
      background-color: var(--td-bg-color-container-hover);
    }
  }
  .delete {
    color: var(--td-error-color);
  }
}
</style>
