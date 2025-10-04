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

    <t-loading attach="#gridstack" size="small" :loading="loading"></t-loading>
    <div id="gridstack" class="grid-stack" ref="gridstackRef">
      <div
        v-for="page in currentPages"
        class="grid-stack-item"
        :gs-id="page.id"
        :id="page.id"
        :key="page.id"
      >
        <div
          class="thumbnail"
          :style="{
            backgroundImage: isWallpaperLoaded
              ? `url(${currentWallpaper})`
              : 'none',
          }"
        >
          <img :src="page.thumbnail" />
        </div>
        <div class="delete" @click="deletePage(page.id)">
          <CloseIcon />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="PageSetting">
import html2canvas from 'html2canvas';
import { CloseIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { useSwiperStore, useWallpaperStore } from '@/store';
import { useLoading } from '@/hooks';
import { getSwipweThumbnailPages } from '@/utils/eventBus';
import { GridStack, GridStackNode } from 'gridstack';
import { generateID } from '@/utils/system';
import { SwiperData, ThumbnailPage } from '@/types';

// Pinia Store
const swiperStore = useSwiperStore();
const wallpaperStore = useWallpaperStore();
// gridstack Ref
const grid = ref<GridStack | null>(null);
// Gridstack HTMLElement Ref
const gridstackRef = ref<HTMLElement | null>(null);
// 当前用于操作的页面
const currentPages = ref<Array<ThumbnailPage>>([]);
// 当前壁纸
const currentWallpaper = ref<string>('');
// 壁纸图片是否加载完成
const isWallpaperLoaded = ref<boolean>(false);

const { loading, setLoading } = useLoading();

// 重置当前页面为默认的原始页面
function resetPage() {
  // 重置数据
  currentPages.value = [...getSwipweThumbnailPages()];
  // 完全销毁并重新初始化GridStack
  if (grid.value) {
    grid.value.destroy(false);
    grid.value = null;
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
  // originalPages.value = [...currentPages.value];
  // 显示保存成功提示
  MessagePlugin.success('书签页面已保存');
}

// 新增滑动页面
async function addPage() {
  if (currentPages.value.length >= 8) {
    MessagePlugin.warning('滑动的页面太多啦!');
    return;
  }
  const newId = generateID();
  // 创建一个临时的div元素来显示当前壁纸
  const tempDiv = document.createElement('div');
  tempDiv.style.width = '240px';
  tempDiv.style.height = '135px';
  tempDiv.style.backgroundImage = `url(${currentWallpaper.value})`;
  tempDiv.style.backgroundSize = 'cover';
  tempDiv.style.backgroundPosition = 'center';
  tempDiv.style.backgroundRepeat = 'no-repeat';
  tempDiv.style.position = 'absolute';
  tempDiv.style.top = '-9999px'; // 移出视口
  tempDiv.style.left = '-9999px';
  // 添加到文档中以确保正确渲染
  document.body.appendChild(tempDiv);
  try {
    // 使用html2canvas捕获临时div的内容
    const canvas = await html2canvas(tempDiv, {
      width: 240,
      height: 135,
      scale: 1,
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const newPageThumbnail = {
      id: newId,
      thumbnail: canvas.toDataURL('image/png'),
    };

    // 从文档中移除临时div
    document.body.removeChild(tempDiv);

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
  } catch (error) {
    // 如果捕获失败，回退到纯色背景
    console.error('Failed to capture wallpaper for new page:', error);
  }
}
// 删除滑动页面
function deletePage(pageId: string) {
  // 检查页面数量，确保最少保留两个页面
  if (currentPages.value.length <= 2) {
    MessagePlugin.warning('至少需要保留两个页面');
    return;
  }

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
      row: 4,
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
  grid.value.load(currentPages.value);
};

// 重新加载GridStack
const loadGridStack = () => {
  grid.value!.load(currentPages.value);
  setLoading(false);
};

// 预加载壁纸图片
const preloadWallpaper = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      isWallpaperLoaded.value = true;
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
};

onMounted(async () => {
  // await buildSwiperThumbnailPage();
  currentPages.value = [...getSwipweThumbnailPages()];
  currentWallpaper.value = await wallpaperStore.getCurrentWallpaperImage();

  // 预加载壁纸图片，确保在初始化GridStack之前壁纸已经加载完成
  try {
    if (currentWallpaper.value && currentWallpaper.value !== '#f1f3f5') {
      await preloadWallpaper(currentWallpaper.value);
    } else {
      // 如果是默认背景色，直接标记为加载完成
      isWallpaperLoaded.value = true;
    }
  } catch (error) {
    console.error('壁纸预加载失败:', error);
    isWallpaperLoaded.value = true; // 即使加载失败也继续显示
  }

  nextTick(() => {
    initGrid();
    loadGridStack();
  });
});
</script>

<style lang="less" scoped>
.operate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 20px;
  background-color: var(--td-bg-color-secondarycontainer);
  border-radius: 8px;
  .left {
    display: flex;
    align-items: center;
  }

  .right {
    display: flex;
    align-items: center;
  }
}
.grid-stack {
  width: 100%;
  min-height: 200px;

  .grid-stack-item {
    width: 240px;
    height: 135px;
    overflow: hidden;
    border-radius: var(--td-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      .delete {
        display: flex;
      }
    }

    .thumbnail {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transition: all 0.3s ease;
      cursor: move;
      // 添加默认背景色，防止壁纸加载前显示纯透明背景
      background-color: #f1f3f5;

      &:hover {
        transform: scale(1.1);
        img {
          transform: scale(1.1);
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.3s ease;
        overflow: hidden;
      }
    }
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
      display: none;
      z-index: 10;
    }
  }
}
</style>
