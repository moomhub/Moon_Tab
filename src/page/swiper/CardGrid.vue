<template>
  <!-- 书签布局Grid-->
  <div ref="gridstackRef" class="grid-stack">
    <div
      v-for="(w, indexs) in bookmark.data"
      class="grid-stack-item"
      :gs-x="w.position.x"
      :gs-y="w.position.y"
      :gs-w="w.position.w"
      :gs-h="w.position.h"
      :gs-id="w.id"
      :id="w.id"
      :key="w.id"
    >
      <BaseCard
        :id="bookmark.id"
        :data="w"
        @contextmenu.prevent="handleContextMenu($event, w)"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="CardGrid">
import { GridStack } from 'gridstack';
import { type GridStackNode } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import { CardType, ContextMenuData } from '@/types';
import BaseCard from '@/components/card/BaseCard.vue';
import { SwiperData, AllCardData } from '@/types';

import { useSwiperStore } from '@/store';

interface ExpendedGridStackNode extends GridStackNode {
  expand: AllCardData; // 扩展属性
}

// 传递的props数据
const props = defineProps<{
  bookmark: SwiperData;
}>();

// Pinia store
const swiperStore = useSwiperStore();

// gridstack Ref
const grid = ref<GridStack | null>(null);
// 因为有多个grid，所以需要一个ref来标识当前的gri
const gridstackRef = ref<HTMLElement | null>(null);

// 构建grid数据
function buildGirdData(data: Array<AllCardData>) {
  return data.map((item) => {
    return {
      id: item.id,
      x: item.position.x || 0,
      y: item.position.y || 0,
      w: item.position.w || 1,
      h: item.position.h || 1,
      // 拓展数据
      expand: item,
    };
  });
}

const init = () => {
  if (!gridstackRef.value) {
    // 没有gridstackRef，则不初始化
    console.error('grid element not found');
    return;
  }
  if (grid.value) {
    // 如果已经存在网格实例，先销毁它
    grid.value.destroy();
  }
  grid.value = GridStack.init(
    {
      row: 4,
      column: 12,
      minRow: 1,
      maxRow: 2,
      cellHeight: 'auto',
      // margin: 5,
      alwaysShowResizeHandle: false,
      float: true,
      acceptWidgets: false,
      disableDrag: false,
      disableResize: true,
    },
    gridstackRef.value
  );

  // 加载数据
  grid.value.load(buildGirdData(props.bookmark.data)); // doesn't trigger 'added, sadly - so manually trigger it

  //   // 监听变化事件
  grid.value.on('change', (event, items: GridStackNode[]) => {
    const changeCardData = items.map((item) => {
      const position = {
        x: item.x as number,
        y: item.y as number,
        w: item.w as number,
        h: item.h as number,
      };
      const id = item.id as string;
      return {
        id,
        position,
      };
    });
    swiperStore.updateCardPositionBySwiperId(props.bookmark.id, changeCardData);
    console.log('Grid changed:', changeCardData);
  });
};
// onBeforeMount(() => {
//   gridData.value = [...props.bookmark.data];
// }),
onMounted(() => {
  init();
  // 初始化当前卡片数量
  cardNumber.value = props.bookmark.data.length;
});

// 卡片数量
const cardNumber = ref(0);

watch(
  () => props.bookmark.data, // 创建新数组确保引用不同
  (newValue, oldValue) => {
    const currentCardNumber = newValue.length; // 当前卡片数量
    if (currentCardNumber > cardNumber.value) {
      const newCardId = newValue[currentCardNumber - 1].id as string; // 获取新添加的卡片的ID
      nextTick(() => {
        grid.value?.makeWidget(newCardId);
      });
    } else {
      // 卡片数量减少或者卡片的位置改变、宽高改变，重新加载数据
      grid.value?.load(buildGirdData(newValue));
    }
    cardNumber.value = currentCardNumber; // 更新卡片数量
  },
  { deep: true, immediate: true }
);

// 处理右键菜单事件
const handleContextMenu = (event: MouseEvent, cardData: AllCardData) => {
  const menuHeight = 300; // 预估菜单高度
  const windowHeight = window.innerHeight;
  const adjustedY =
    event.clientY + menuHeight > windowHeight
      ? windowHeight - menuHeight - 10
      : event.clientY;
  // 抛出事件
  emit('ContextMenu', {
    position: { x: event.clientX, y: adjustedY },
    swiperId: props.bookmark.id,
    card: cardData,
  });
};

const emit = defineEmits<{
  (e: 'ContextMenu', data: ContextMenuData): void;
}>();
</script>

<style lang="less" scoped>
.grid-stack {
  max-height: 400px !important;
  width: 80rem;
  top: 20vh;
}

.grid-stack-item {
  border-radius: 6px;
}

.grid-stack-item-content {
  /* inset: 15px; */
  border-radius: 6px;
  overflow: hidden;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
}

.grid-stack-item.ui-draggable-dragging,
.grid-stack-item.ui-resizable-resizing {
  opacity: 0.8;
  // z-index: 100;
}
/* 拖动时的占位 */
:deep(.grid-stack-placeholder) {
  border-radius: 10px;

  .placeholder-content {
    transform: scale(0.9);
    border-radius: 10px;
    opacity: 0.8;
  }
}
</style>
