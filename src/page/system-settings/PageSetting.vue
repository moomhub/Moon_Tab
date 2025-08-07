<template>
  <div class="max">
    <div class="operate">
      <div class="left">
        <t-button theme="primary" @click="addPage">添加页面</t-button>
      </div>
      <div class="right">
        <t-space>
          <t-button theme="primary" @click="resetPage">重置</t-button>
          <t-button theme="primary" @click="savePage">保存</t-button>
        </t-space>
      </div>
    </div>
    <t-loading size="small" :loading="loading" show-overlay>
      <div class="grid-stack" ref="gridstackRef">
        <div
          v-for="page in currentPages"
          class="grid-stack-item"
          :gs-id="page.id"
          :id="page.id"
          :key="page.id"
        >
          <div class="thumbnail">
            <img :src="page.thumbnail" />
          </div>
          <div class="delete" @click="deletePage(page.id)">
            <CloseIcon />
          </div>
        </div>
      </div>
    </t-loading>
  </div>
</template>

<script setup lang="ts" name="PageSetting">
import html2canvas from 'html2canvas';
import { CloseIcon, EllipsisIcon } from 'tdesign-icons-vue-next';
import { useSwiperStore, useWallpaperStore } from '@/store';
import { getSwiperPageHtml } from '@/utils/eventBus';
import { GridStack, GridStackNode } from 'gridstack';
import { generateID } from '@/utils/system';
import { SwiperData } from '@/types';
import { useLoading } from '@/hooks';

// 滑动页面略缩信息
interface ThumbnailPage {
  id: string; // 滑动页面ID
  thumbnail: string; // 略缩图
}

// Pinia Store
const swiperStore = useSwiperStore();
const wallpaperStore = useWallpaperStore();
// hooks
const { loading, setLoading } = useLoading(true);
// gridstack Ref
const grid = ref<GridStack | null>(null);
// Gridstack HTMLElement Ref
const gridstackRef = ref<HTMLElement | null>(null);
// 原始页面数组 （用于重置编辑页面）
const originalPages = ref<Array<ThumbnailPage>>([]);
// 当前用于操作的页面
const currentPages = ref<Array<ThumbnailPage>>([]);

// 重置当前页面为默认的原始页面
function resetPage() {
  // 重置数据
  currentPages.value = [...originalPages.value];

  // 完全销毁并重新初始化GridStack
  if (grid.value) {
    // 1. 销毁现有GridStack实例
    grid.value.destroy(false);
    grid.value = null;

    // 2. 确保DOM更新完成后再重新初始化
    nextTick(() => {
      initGrid();
      loadGridStack();
    });
  } else {
    // 如果没有GridStack实例，直接初始化
    initGrid();
    loadGridStack();
  }
}

// 保存当前页面
function savePage() {
  // 获取当前页面ID和store中的页面ID
  const currentIds = currentPages.value.map((page) => page.id);
  const storeIds = swiperStore.swiperData.map((page) => page.id);

  // 找出新增的页面(在currentPages中但不在store中)
  const newPages = currentPages.value.filter(
    (page) => !storeIds.includes(page.id)
  );
  // 找出删除的页面(在store中但不在currentPages中)
  const deletedIds = storeIds.filter((id) => !currentIds.includes(id));
  // 处理删除的页面
  deletedIds.forEach((id) => {
    // 找到要删除的页面索引
    const index = swiperStore.swiperData.findIndex((page) => page.id === id);
    if (index !== -1) {
      // 从store中删除该页面
      swiperStore.swiperData.splice(index, 1);
    }
  });
  // 处理新增的页面
  newPages.forEach((page) => {
    // 创建新的页面数据
    swiperStore.swiperData.push({
      id: page.id,
      data: [], // 空数据，或者根据需要初始化
    });
  });
  // 重新排序剩余页面
  const newOrder = currentPages.value.map((page) => page.id);
  const reorderedSwiperData = newOrder
    .map((id) => {
      return swiperStore.swiperData.find((page) => page.id === id);
    })
    .filter(Boolean);
  // 更新store
  swiperStore.swiperData = reorderedSwiperData as SwiperData[];
  // 同步更新originalPages
  originalPages.value = [...currentPages.value];
  // 显示保存成功提示
  MessagePlugin.success('书签页面已保存');
}

// 新增滑动页面
async function addPage() {
  const newId = generateID();
  // Create a blank thumbnail for the new page
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 135;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f1f3f5'; // A default background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const newPageThumbnail = {
    id: newId,
    thumbnail: canvas.toDataURL('image/png'),
  };
  // Add to local thumbnail list
  currentPages.value.push(newPageThumbnail);
  // Add the new widget to the gridstack instance
  await nextTick();
  if (grid.value) {
    const el = document.getElementById(newId);
    if (el) {
      grid.value.makeWidget(el);
    }
  }
}
// 删除滑动页面
function deletePage(pageId: string) {
  const index = currentPages.value.findIndex((page) => page.id === pageId);
  if (index !== -1) {
    currentPages.value.splice(index, 1);
  }
  grid.value!.load(currentPages.value);
}

// 初始化Gridstack
const initGrid = () => {
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
      row: 5,
      column: 2,
      minRow: 1,
      cellHeight: '140px',
      alwaysShowResizeHandle: false,
      acceptWidgets: false,
      disableDrag: false,
      disableResize: true,
    },
    gridstackRef.value
  );
  grid.value.on('change', (event, items: GridStackNode[]) => {
    // Filter out the 'add-page-block' from the items being sorted
    const changedItems = items.filter((item) => item.id !== 'add-page-block');
    if (changedItems.length === 0) return;
    if (!grid.value) return;
    // Sort nodes by their position to get the visual order
    const sortedNodes = [...grid.value.engine.nodes]
      .filter((n) => n.id !== 'add-page-block') // Exclude the add page block
      .sort((a, b) => {
        const aPos = { x: a.x ?? 0, y: a.y ?? 0 };
        const bPos = { x: b.x ?? 0, y: b.y ?? 0 };
        if (aPos.y === bPos.y) {
          return aPos.x - bPos.x;
        }
        return aPos.y - bPos.y;
      });
    const newOrderIds = sortedNodes.map((node) => node.id as string);
    const currentOrderIds = currentPages.value.map((page) => page.id);
    // Check if the order has actually changed
    if (JSON.stringify(newOrderIds) === JSON.stringify(currentOrderIds)) {
      return;
    }
    // Reorder the thumbnailPages array
    const pageMap = new Map(currentPages.value.map((p) => [p.id, p]));
    const newThumbnailPages = newOrderIds
      .map((id) => pageMap.get(id))
      .filter((page): page is ThumbnailPage => page !== undefined);
    currentPages.value = newThumbnailPages;
  });
};

// 重新加载GridStack
const loadGridStack = () => {
  grid.value!.load(currentPages.value, true);
};

// 构建滑动页面的略缩图
async function buildSwiperThumbnailPage() {
  // 清空现有数据，避免重复积累
  originalPages.value = [];
  const swiperPageHtmls = getSwiperPageHtml();
  // 跟踪缺失的DOM元素
  const missingDomPages: string[] = [];
  try {
    // 按照swiperStore.swiperData的顺序生成缩略图
    for (const page of swiperStore.swiperData) {
      console.log('Generating thumbnail for page:', page.id);
      const dom = swiperPageHtmls[page.id];
      if (!dom) {
        missingDomPages.push(page.id);
        continue;
      }
      const el = await addBackgroundToElement(dom);

      try {
        const rect = el.getBoundingClientRect();
        const canvas = await html2canvas(el, {
          width: rect.width,
          height: rect.height,
          scale: 2, // 清晰度
          backgroundColor: '#f1f3f5', // 设置一个背景色
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        // 使用Map确保ID唯一性（防止重复添加）
        const pageExists = originalPages.value.some((p) => p.id === page.id);
        if (!pageExists) {
          originalPages.value.push({
            id: page.id,
            thumbnail: canvas.toDataURL('image/png'),
          });
        }
      } catch (error) {
        console.error(
          `Failed to generate thumbnail for page ${page.id}:`,
          error
        );
      }
    }
    // 报告缺失的DOM元素
    if (missingDomPages.length > 0) {
      console.warn(
        `Missing DOM elements for pages: ${missingDomPages.join(', ')}`
      );
    }
    console.log('originalPages.value', originalPages.value);

    // 确保originalPages和currentPages同步
    currentPages.value = [...originalPages.value];

    console.log('Thumbnail generation completed successfully');
  } catch (error) {
    console.error('Error generating thumbnails:', error);
  }
}
// 为DOM元素添加背景图片
const addBackgroundToElement = async (el: HTMLElement) => {
  // 设置默认背景图片路径
  const backgroundImg = await wallpaperStore.getCurrentWallpaperImage();
  console.log('backgroundImg', backgroundImg);
  // 为元素添加背景样式
  el.style.backgroundImage = `url(${backgroundImg})`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  el.style.backgroundRepeat = 'no-repeat';
  return el;
};


onMounted(async () => {
  await buildSwiperThumbnailPage();
  initGrid();
  // 关闭加载状态
  setLoading(false);
});
</script>

<style lang="less" scoped>
.grid-stack {
  width: 100%;
  min-height: 200px;
  background: var(--td-bg-color-page);
}

.grid-stack-item {
  width: 240px;
  height: 135px;

  .delete {
    position: absolute;
    top: 4px;
    right: 4px;
    cursor: pointer;
    background-color: var(--td-error-color);
    border-radius: 50%;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 10;
  }
}

.add-page-block {
  .add-page-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--td-bg-color-page);
    border: 2px dashed #ced4da;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #dee2e6;
    }
  }
}

.thumbnail {
  width: 100%;
  height: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.sidebar > .grid-stack-item,
.grid-stack-item-content {
  text-align: center;
  background-color: #18bc9c;
}
</style>

<style scoped lang="less">
.operate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.left {
  display: flex;
  align-items: center;
}

.right {
  display: flex;
  align-items: center;
}

// 可以根据需要添加更多样式
</style>
