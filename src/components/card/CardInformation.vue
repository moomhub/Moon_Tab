<!-- 卡片信息组件,用于渲染卡片对应的卡片信息 -->
<template>
  <div class="card-info">
    <div class="preview">
      <img
        loading="lazy"
        :src="props.information.image"
        :alt="props.information.title"
      />
    </div>
    <div class="information">
      <div class="title">
        {{ props.information.title }}
      </div>

      <div class="describe">
        {{ props.information.desc }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="CardInformation">
import { CardInformationData } from '@/types';

const props = defineProps<{
  information: CardInformationData;
}>();
</script>

<style lang="less" scoped>
.card-info {
  position: relative;
  flex-shrink: 0;
  height: 6.8rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background-color: var(--td-bg-color-secondarycontainer);
  border-radius: var(--td-radius-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  padding-left: 0.85rem;
  margin: var(--td-comp-margin-xs);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--td-shadow-2);
  }

  .preview {
    flex-shrink: 0;
    width: 4.8rem;
    height: 4.8rem;
    border-radius: var(--td-radius-medium);
    background-color: var(--td-bg-color-container);
    img {
      width: 100%;
      height: 100%;
      border-radius: var(--td-radius-medium);
      object-fit: cover;
    }
  }

  .information {
    flex: 1 1 0%;
    padding-right: var(--td-comp-paddingLR-xs);

    .title {
      color: var(--td-text-color-primary);
      font-size: var(--td-font-size-title-small);
      font-weight: 800;
      margin-bottom: var(--td-comp-paddingTB-xs);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .describe {
      font-size: var(--td-font-size-body-small);
      color: var(--td-text-color-placeholder);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      white-space: normal;
      overflow: hidden;
    }
  }
}
</style>
