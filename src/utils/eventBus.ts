import { ref } from 'vue';
import { useSwiperStore } from '@/store';
import Swiper from 'swiper';
import { ThumbnailPage } from '@/types';
import html2canvas from 'html2canvas';

// 右键菜单数据
interface MenuData {
  // 菜单位置
  position: {
    x: number; // 相对于浏览器窗口的x坐标
    y: number; // 相对于浏览器窗口的y坐标
  };
  cardId: string; // 右键菜单的卡片id
}

// 默认菜单状态数据
const defaultMenuData: MenuData = {
  position: { x: 0, y: 0 },
  cardId: '',
};

// 当前滑动页面ID
const currentSwiperId = ref('');


// 略缩图滑动器
const swiperPageDoms = ref<Record<string, any>>({});

export function setSwiperPageDoms(pageHtml: Record<string, any>) {
  swiperPageDoms.value = pageHtml;
}
export function getSwiperPageDoms() {
 return swiperPageDoms.value;
}
// 略缩图滑动器
const swipweThumbnailPages = ref<Array<ThumbnailPage>>([]);

export async function buildSwipweThumbnailPages() {
  const swiperStore = useSwiperStore();
  // 清空现有数据，避免重复积累
  swipweThumbnailPages.value = [];
  // 跟踪缺失的DOM元素
  const missingDomPages: string[] = [];
  try {
    // 按照swiperStore.swiperData的顺序生成缩略图
    for (const page of swiperStore.swiperData) {
      const dom = swiperPageDoms.value[page.id];
      if (!dom) {
        missingDomPages.push(page.id);
        continue;
      }
      try {
        const rect = dom.getBoundingClientRect();
        const canvas = await html2canvas(dom, {
          width: rect.width,
          height: rect.height,
          scale: 2, // 清晰度
          backgroundColor: null, // 设置一个背景色
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        // 使用Map确保ID唯一性（防止重复添加）
        const pageExists = swipweThumbnailPages.value.some(
          (p) => p.id === page.id
        );
        if (!pageExists) {
          swipweThumbnailPages.value.push({
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
    console.log('Thumbnail generation completed successfully');
  } catch (error) {
    console.error('Error generating thumbnails:', error);
  }
}

export function getSwipweThumbnailPages() {
  return swipweThumbnailPages.value;
}

// 设置当前swiper的id
export function setCurrentSwiperId(id: string) {
  currentSwiperId.value = id;
}
// 获取当前swiper的id
export function getCurrentSwiperId() {
  return currentSwiperId.value;
}

// 当前swiper滑动页面的下标
export const currentSwiperIndex = ref(0);

// 设置当前swiper滑动页面的id
export const setCurrentSwiperIndex = (index: number) => {
  currentSwiperIndex.value = index;
};

// 获取当前swiper滑动页面的id
export const getCurrentSwiperIndex = () => {
  try {
    const swiperStore = useSwiperStore();
    return swiperStore.swiperData[currentSwiperIndex.value].id;
  } catch (e) {
    return '';
  }
};

// 菜单显示状态
export const menuVisible = ref(false);

// 设置菜单显示状态
export const setMenuVisible = (visible: boolean) => {
  menuVisible.value = visible;
};

// 菜单数据
export const menuData = ref<MenuData>(defaultMenuData);

// 设置菜单状态
export const setMenuData = (data: MenuData) => {
  menuData.value = data;
};

// 初始化全局事件总线
export const initEventBus = () => {
  setMenuVisible(false);
  setMenuData(defaultMenuData);
  setCurrentSwiperId('');
  setCurrentSwiperIndex(0);
};