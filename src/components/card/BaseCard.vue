<!-- 基础卡片组件 -->
<template>
  <div class="base-card" @contextmenu.prevent="handleContextMenu">
    <div class="card-content">
      <div class="content" :style="innerStyles">
        <!-- 书签卡片 -->
        <BookmarkCard
          v-if="data.type === CardType.BOOKMARK"
          :swiper-id="id"
          :data="(data as BookmarkCardData)"
        />
        <!-- 倒计时卡片 -->
        <CountdownCard
          v-if="data.type === CardType.COUNTDOWN"
          :swiper-id="id"
          :data="(data as CountdownCardData)"
        />
      </div>
      <div class="title">
        {{ data.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="BaseCard">
import { BookmarkCardData, CardType, CountdownCardData } from '@/types';
import BookmarkCard from '@/components/card/BookmarkCard.vue';
import CountdownCard from '@/components/card/CountdownCard.vue';
import WeatherCard from '@/components/card/WeatherCard.vue';
import { AllCardData } from '@/types';
import { setMenuData, setMenuVisible } from '@/utils/eventBus';

const props = defineProps<{
  id: string;
  data: AllCardData;
}>();

// 图片大小
const innerStyles = computed(() => {
  // 配置尺寸映射表 (建议抽离为常量)
  const SIZE_MAP: Record<string, { width: string; height: string }> = {
    '1x1': { width: '75px', height: '75px' },
    '1x2': { width: '75px', height: '182px' },
    '2x1': { width: '182px', height: '75px' },
    '2x2': { width: '182px', height: '182px' },
    '3x2': { width: '288px', height: '182px' }
  }
  // 解构获取参数
  const { w, h } = props.data.position
  const sizeKey = `${w}x${h}`
  // 查找匹配尺寸，无匹配时使用默认 75x75
  const { width = '75px', height = '75px' } = SIZE_MAP[sizeKey] || {}
  // 返回合并后的样式 (Object.assign 更高效)
  return Object.assign(
    {},
    { transition: 'all 0.3s ease-out' },
    { width, height }
  )
})

/**
 * 右键点击卡片
 * @param e 鼠标事件
 */
const handleContextMenu = (event: MouseEvent) => {
  const menuHeight = 300; // 预估菜单高度
  const windowHeight = window.innerHeight;
  const adjustedY =
    event.clientY + menuHeight > windowHeight
      ? windowHeight - menuHeight - 10
      : event.clientY;
  setMenuData({
    position: { x: event.clientX, y: adjustedY },
    cardId: props.data.id as string,
  });
  nextTick(() => {
    setMenuVisible(true);
  });
};
</script>

<style lang="less" scoped>
.base-card {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  padding: 0.3rem 0.987rem;
  box-sizing: border-box;

  .card-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
    }
    .content {
      width: 100%;
      height: 100%;
      border-radius: 10px;
    }
    .title {
      width: 100%;
      font-size: 12px;
      color: #fff;
      text-align: center;
      overflow: clip;
      text-overflow: ellipsis;
      white-space: nowrap;
      pointer-events: none;
    }
  }
}
</style>
