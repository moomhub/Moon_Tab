<template>
  <t-drawer v-model:visible="visible" header="新增卡片" :footer="false">
    <div class="content">
      <CardInformation
        v-for="(item, index) in ALL_COMPONENT_CARD"
        :key="index"
        :information="item"
        @click.stop="handleCardClick(item.type)"
      ></CardInformation>
    </div>
    <AddCardDialog ref="addCardDialogRef" :type="currentFormType" />
  </t-drawer>
</template>

<script setup lang="ts" name="AddCard">
import { CardType } from '@/types';
import { ALL_COMPONENT_CARD } from '@/types/constants';
import { useSwiperStore } from '@/store';
import { currentSwiperIndex } from '@/utils/eventBus';
import CardInformation from '@/components/card/CardInformation.vue';
import AddCardDialog from '@/components/dialog/AddCardDialog.vue';
import { checkCardFreePosition, getAllCardPosition } from '@/utils/swiper';
import { useVisible } from '@/hooks';

// Pinia store
const swiperStore = useSwiperStore();
// Vue refs
const addCardDialogRef = ref<InstanceType<typeof AddCardDialog>>();
// Hooks
const { open, close, visible } = useVisible();

// 当前卡片类型
const currentFormType = ref<CardType>(CardType.BOOKMARK); // 当前表单类型

// 处理卡片点击
function handleCardClick(type: CardType) {
  // 检查网格是否有空闲位置
  const availablePosition = checkCardFreePosition(
    getAllCardPosition(swiperStore.swiperData[currentSwiperIndex.value])
  );
  if (!availablePosition) {
    MessagePlugin.error('当前页面没有空余位置,请删除卡片后再添加卡片');
    return;
  }
  currentFormType.value = type;
  console.log('add card type:', addCardDialogRef.value);
  switch (type) {
    case CardType.BOOKMARK:
      addCardDialogRef.value?.openDialog(type); // 打开对话框
      break;
    case CardType.WEATHER:
      break;
    case CardType.COUNTDOWN:
      addCardDialogRef.value?.openDialog(type); // 打开对话框
      break;
    default:
      break;
  }
}

// 打开抽屉
function openDrawer() {
  // 打开抽屉
  // open();

  // 由于目前没有编写天气卡片,所以先隐藏天气卡片和倒计时卡片
  // TODO 后续进行删除
  handleCardClick(CardType.BOOKMARK);
}

// 抛出方法
defineExpose({
  openDrawer,
});
</script>

<style lang="less" scoped>
.content {
  display: flex;
  gap: 1rem;
  height: 100%;
  overflow: auto;
  flex-direction: column;
}
</style>
