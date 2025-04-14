<template>
  <t-dialog
    placement="center"
    width="600"
    v-model:visible="visible"
    header="选择本地图标"
    :footer="false"
    @close="handleDialogClose"
  >
    <div class="content narrow-scrollbar">
      <LocalIconData
        ref="iconDataRef"
        @icon-item-click="handleIconItemClick"
      ></LocalIconData>
    </div>
  </t-dialog>
</template>

<script setup lang="ts" name="AddCardDialog">
import { useVisible } from '@/hooks';
import LocalIconData from '@/components/icon/LocalIconData.vue';
import { IconData } from '@/types/icon';

// hooks 实例
const { visible, open, close } = useVisible();

// vue ref
const iconDataRef = ref<InstanceType<typeof LocalIconData>>();

// 打开弹窗
const openDialog = (data: IconData[]) => {
  // 设置图标数据
  iconDataRef.value?.setIconData(data);
  nextTick(() => {
    open(); // 打开弹窗
  });
};

// 处理对话框关闭事件
const handleDialogClose = async () => {
  close();
};

// 点击图标
function handleIconItemClick(icon: IconData) {
  console.log('current choose local icon:', icon);
  emit('result', icon);
  nextTick(() => {
    close();
  });
}

// 抛出图标点击事件
const emit = defineEmits<{
  (e: 'result', data: IconData): void;
}>();

defineExpose({
  openDialog,
});
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 400px;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
}
</style>
