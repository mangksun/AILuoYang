<template>
  <view class="timeline-card tang-card">
    <view class="day-title">第 {{ day.day }} 天 · {{ day.title || '神都漫游' }}</view>
    <view v-for="(item, index) in day.items" :key="index" class="timeline-item">
      <view class="node" />
      <view class="item-body">
        <view class="time">{{ item.timeRange || item.time || '自由安排' }}</view>
        <view class="spot">{{ item.spotName || item.projectName || '推荐景点' }}</view>
        <view class="tips">{{ item.tips || item.reason || '根据你的偏好智能推荐。' }}</view>
        <view class="meta" v-if="item.durationMinutes || item.ticketPrice">
          <text v-if="item.durationMinutes">建议 {{ item.durationMinutes }} 分钟</text>
          <text v-if="item.ticketPrice">门票约 ¥{{ item.ticketPrice }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ItineraryPlan } from '@/api/ai';

defineProps<{ day: ItineraryPlan['days'][number] }>();
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.timeline-card {
  padding: 30rpx;
  margin-top: 24rpx;
}

.day-title {
  margin-bottom: 24rpx;
  color: $shendu-red;
  font-size: 32rpx;
  font-weight: 800;
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 20rpx;
  padding-bottom: 28rpx;

  &::before {
    content: '';
    position: absolute;
    left: 10rpx;
    top: 24rpx;
    bottom: 0;
    width: 2rpx;
    background: linear-gradient(180deg, rgba(212,175,55,0.6), transparent);
  }

  &:last-child::before {
    display: none;
  }
}

.node {
  z-index: 1;
  width: 22rpx;
  height: 22rpx;
  margin-top: 8rpx;
  border: 4rpx solid rgba(212, 175, 55, 0.55);
  border-radius: 50%;
  background: $shendu-red;
}

.item-body {
  flex: 1;
}

.time {
  color: $amber;
  font-size: 22rpx;
  font-weight: 700;
}

.spot {
  margin-top: 8rpx;
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
}

.tips {
  margin-top: 10rpx;
  color: #6f5f57;
  font-size: 24rpx;
  line-height: 1.55;
}

.meta {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;

  text {
    padding: 8rpx 12rpx;
    border-radius: 999rpx;
    color: $shendu-red;
    font-size: 22rpx;
    background: rgba(139, 30, 34, 0.08);
  }
}
</style>
