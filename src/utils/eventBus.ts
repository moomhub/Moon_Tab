import { ref } from 'vue';
import { useSwiperStore } from '@/store';

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

const currentSwiperId = ref('');

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
