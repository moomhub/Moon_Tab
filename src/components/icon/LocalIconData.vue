<!--图标数据 -->
<template>
  <t-row :gutter="0">
    <t-col
      class="col"
      :span="2"
      v-for="(item, index) in iconDatas"
      :key="index"
    >
      <div
        class="icon-item"
        :class="{ 'not-delete': !showDelete }"
        @click="clickIconItem(item)"
      >
        <div class="icon">
          <img :src="item.url" />
        </div>
        <t-popconfirm
          v-if="showDeleteBtn(item)"
          theme="danger"
          content="是否删除该图标"
          @confirm="deleteIcon(item)"
        >
          <div class="delete">
            <CloseIcon />
          </div>
        </t-popconfirm>
      </div>
    </t-col>
  </t-row>
</template>

<script setup lang="ts" name="IconData">
import { useIndexedDB } from '@/store';
import { IconData, IconStoreType } from '@/types/icon';
import { CloseIcon } from 'tdesign-icons-vue-next';

// 定义组件 props
const props = defineProps({
  // 显示输出按钮
  showDelete: {
    type: Boolean,
    default: false,
    required: false,
  },
});

//
const indexedDB = useIndexedDB();

const iconDatas = ref<IconData[]>([]);

// 是否显示删除按钮
function showDeleteBtn(icon: IconData) {
  if (!props.showDelete) {
    return false;
  }
  if (icon.store === IconStoreType.LOCAL) {
    return false;
  }
  return true;
}

// 设置图标数据
function setIconData(arrayData: IconData[]) {
  iconDatas.value = arrayData;
}

// 删除图标
async function deleteIcon(icon: IconData) {
  // 删除本地db中的图标数据
  await indexedDB.iconDB.removeItem(icon.key as string);
  // 从 iconDatas 中移除被删除的图标数据
  iconDatas.value = iconDatas.value.filter((item) => item.key !== icon.key);
}

// 点击图标
function clickIconItem(icon: IconData) {
  emit('iconItemClick', icon);
}

// 抛出图标点击事件
const emit = defineEmits<{
  (e: 'iconItemClick', data: IconData): void;
}>();

// 暴露方法给父组件调用
defineExpose({ setIconData });
</script>

<style scoped lang="less">
.col {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-delete {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.icon-item {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: var(--td-radius-medium);
  background-color: var(--td-font-gray-4);
  display: flex;
  align-items: center;
  justify-content: center;

  .icon {
    width: 70%;
    height: 70%;
    border-radius: var(--td-radius-medium);
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      transition: transform 0.2s ease-in-out;
    }
  }

  .delete {
    color: var(--td-text-color-anti);
    position: absolute;
    top: -0.3rem;
    right: -0.3rem;
    background: var(--td-error-color);
    width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
  }
}
</style>
