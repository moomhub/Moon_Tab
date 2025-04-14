<!-- 书签卡片组件 -->
<template>
  <div
    class="bookmark-card"
    @click="handleBookmarkClick"
    :style="{
      background: data.bgColor,
    }"
  >
    <img
      class="bookmark-icon"
      v-if="bookmarkIcon?.image"
      :src="bookmarkIcon?.value"
    />
    <div v-else class="bookmark-placeholder" :style="placeholderStyles">
      {{ bookmarkIcon?.value }}
    </div>
  </div>
</template>

<script setup lang="ts" name="BookmarkCard">
import { DEFAULT_BOOKMARK_ICON } from '@/constants/icon';
import { useIndexedDB, useSystemStore } from '@/store';
import { BookmarkCardData, BookmakeIconType, BookmarkIcon } from '@/types';
import { IconStoreType } from '@/types/icon';
import murmurhash from 'murmurhash';
// 传递的props数据
const props = defineProps<{
  swiperId: string; // 当前滑动ID
  data: BookmarkCardData; // 书签显示数据
}>();

// Pinia状态管理
const systemStore = useSystemStore();
const indexedDB = useIndexedDB();

const bookmarkIcon = ref<BookmarkIcon>();



// 处理图片图标
const handleBookmarkIcon = async () => {
  if (props.data.iconType === BookmakeIconType.TEXT) {
    bookmarkIcon.value = {
      image: false,
      // 第一个字符
      value: props.data.name.charAt(0).toUpperCase(),
    };
    return;
  }
  const currentIcon = props.data.icon;
  if (currentIcon?.store === IconStoreType.LOCAL) {
    bookmarkIcon.value = {
      image: true,
      value: currentIcon.url || DEFAULT_BOOKMARK_ICON,
    };
    return;
  }
  const db = (await indexedDB.iconDB.getItem(
    currentIcon?.key as string
  )) as Blob | null;
  const iconDbUrl = db ? URL.createObjectURL(db) : null;
  bookmarkIcon.value = {
    image: true,
    value: iconDbUrl || DEFAULT_BOOKMARK_ICON,
  };
  return;
};

watch(
  () => props.data.iconType,
  async () => {
    await handleBookmarkIcon();
  }
);

watch(
  () => props.data.icon,
  async () => {
    await handleBookmarkIcon();
  }
);

onBeforeMount(async () => {
  await handleBookmarkIcon();
});

// // 图片大小
// const innerStyles = computed(() => {
//   const styles: Partial<CSSStyleDeclaration> = {};
//   const { h, w } = props.data.position;
//   if (w === 2 && h === 1) {
//     styles.width = '50%';
//   } else if (w === 1 && h === 2) {
//     styles.width = '50%';
//   }
//   styles.width = '50%';
//   return styles;
// });

const placeholderStyles = computed(() => {
  const { h, w } = props.data.position;
  const styles = { fontSize: '50px' };
  if ((w === 2 && h === 2) || (w === 3 && h === 2)) {
    styles.fontSize = '50px';
  } else {
    styles.fontSize = '30px';
  }
  return Object.assign({}, { ...styles });
});

// 处理点击事件
const handleBookmarkClick = () => {
  console.log('card: bookmark click', props.data);
  if (props.data.placeholder) {
    MessagePlugin.info('此卡片为占位卡片，无法跳转');
    return;
  }
  if (systemStore.baseSetting.searchOpenWay) {
    // 新窗口打开
    window.open(props.data.url, '_blank');
    return;
  }
  window.location.href = props.data.url as string;
};
</script>

<style lang="less" scoped>
.bookmark-card {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  .bookmark-icon {
    // object-fit: cover; // 确保图片填充整个容器
    width: 70%;
    display: block;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    margin: auto;
    object-fit: contain;
  }

  .bookmark-placeholder {
    color: #fff;
  }
}
</style>
