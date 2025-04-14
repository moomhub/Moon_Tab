<template>
  <div class="max">
    <t-form-item label="显示文字" name="text">
      <t-input v-model="formData.text" placeholder="请输入倒计时显示文本" />
    </t-form-item>

    <t-form-item label="结束日期" name="date">
      <t-date-picker
        v-model="formData.date"
        placeholder="请选择倒计时日期"
        clearable
        allow-input
        :disable-date="(date: DateValue) => {
          const result = disablePreviousDate(date);
          return typeof result === 'boolean' ? result : false;
        }"
      />
    </t-form-item>
    <t-form-item label="背景图片" name="background">
      <div class="max-width narrow-scrollbar countdown-background">
        <t-space>
          <div
            v-for="(item, index) in DEFAULT_COUNTDOWN_BACKGROUND_LIST"
            :key="index"
            class="upload-image"
            :class="{ 'is-select': formData.background === item }"
            @click="formData.background = item"
          >
            <img class="image" :src="item" alt="图标" />
            <div class="check">
              <CheckIcon />
            </div>
          </div>
        </t-space>
      </div>
    </t-form-item>
  </div>
</template>

<script lang="ts" setup name="CountdownForm">
import type { DateValue } from 'tdesign-vue-next';
import { CheckIcon } from 'tdesign-icons-vue-next';
import { CountdownCardData } from '@/types';
import { DEFAULT_COUNTDOWN_FORM_DATA } from '@/constants/form';
import { DEFAULT_COUNTDOWN_BACKGROUND_LIST } from '@/constants/card';
import { Dayjs } from 'dayjs';

// 定义组件 props
const props = defineProps({
  formData: {
    type: Object as PropType<CountdownCardData>,
    default: { ...DEFAULT_COUNTDOWN_FORM_DATA },
    required: true,
  },
});

// 禁用今天之前的日期
const disablePreviousDate = (date: DateValue) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date && new Date(date).getTime() < today.getTime();
};
</script>

<style lang="less" scoped>
/* 保持与BookmarkCard.vue一致的样式风格 */

.countdown-background {
  padding: 5px;
  overflow-x: auto;

  .upload-image {
    cursor: pointer;
    position: relative;
    width: 6rem;
    height: 4rem;
    border-radius: 6px;
    cursor: pointer;

    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px !important;
    }

    .check {
      display: none;
      color: #fff;
      position: absolute;
      top: -0.1rem;
      right: -0.1rem;
      background: rgb(51, 149, 255);
      width: 0.8rem;
      height: 0.8rem;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
  }
  .is-select {
    box-shadow: rgb(51, 149, 255) 0px 0px 0px 2px;
    .check {
      display: flex;
    }
  }
}
</style>
