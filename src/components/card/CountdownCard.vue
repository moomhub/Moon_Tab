<!-- 倒计时卡片 -->
<template>
  <div
    class="countdown-card"
    :style="{
      backgroundImage: `url(${data.background})`, // 背景图片,
    }"
  >
    <div
      class="one-layout"
      v-if="
        currentLayout === CardLayoutEnum.ONE ||
        currentLayout === CardLayoutEnum.TWO ||
        currentLayout === CardLayoutEnum.THREE
      "
    >
      <div class="text">{{ data.text }}</div>
      <div class="date" v-if="!isExpired">
        {{ RemainingDates }}<span>天</span>
      </div>
      <div class="date" v-else>已结束</div>
      <div v-else class="date">已结束</div>
    </div>
    <div
      class="two-layout"
      v-if="
        currentLayout === CardLayoutEnum.FOUR ||
        currentLayout === CardLayoutEnum.FIVE
      "
    >
      <div class="box">
        <div class="text">距离:{{ data.text }}</div>
        <div class="date" v-if="!isExpired">
          {{ RemainingDates }}<span>天</span>
        </div>
        <div class="date" v-else>已结束</div>
        <span>{{ dayjs().format('YYYY-MM-DD') }} {{ getCurrentWeek() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="CountdownCard">
import { CountdownCardData, CardLayoutEnum } from '@/types';
import { matchCardLayout } from '@/utils/swiper';
import { getCurrentWeek, dayjs, getDaysDifference } from '@/utils/time';

// 传递的props数据
const props = defineProps<{
  swiperId: string; // 当前滑动ID
  data: CountdownCardData; // 书签显示数据
}>();

const currentLayout = computed(() => {
  return matchCardLayout(props.data);
});

// 计算倒计时是否到期
const isExpired = computed(() => {
  return RemainingDates.value < 0;
});

// 剩余日期
const RemainingDates = computed(() => {
  return getDaysDifference(props.data.date);
});
</script>

<style lang="less" scoped>
.countdown-card {
  position: relative;
  width: 100%;
  height: 100%;
  white-space: nowrap;
  border-radius: 10px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  border-radius: 10px;
  color: #fff;

  .one-layout {
    position: relative;
    font-size: 0.7em;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-weight: 800;

    .text {
      width: 80%;
      margin: 0 auto;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .date {
      font-size: 1.4em;
      display: flex;
      align-items: center;

      span {
        font-size: 0.7em;
        font-weight: 600;
        position: relative;
        margin-left: 0.2em;
        vertical-align: text-bottom;
        line-height: 1;
        z-index: 1;
      }
    }
  }

  .two-layout {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;

    .box {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      flex-shrink: 1;
      min-width: 0;
      padding-left: 16px;

      .text {
        font-size: 20px;
        height: 48px;
        line-height: 48px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        text-align: left;
      }
      .date {
        height: 80px;
        line-height: 80px;
        font-size: 64px;
        display: flex;
        align-items: baseline;

        span {
          font-size: 12px;
          position: relative;
          margin-left: 8px;
        }
      }
      span {
        display: block;
        text-align: left;
        font-size: 12px;
      }
    }
  }
}
</style>
