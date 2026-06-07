<template>
  <view class="ticket-card tang-card" @tap="$emit('select', ticket)">
    <view class="ticket-info">
      <view class="ticket-name">{{ ticket.name }}</view>
      <view class="ticket-desc">{{ ticket.description || '神都洛阳精选文旅票种' }}</view>
      <view class="ticket-meta">
        <text>有效 {{ ticket.validDays || 1 }} 天</text>
        <text>可用 {{ ticket.totalUses || 1 }} 次</text>
      </view>
    </view>
    <view class="ticket-side">
      <view class="price">¥{{ formatMoney(ticket.price) }}</view>
      <button class="buy-button" @tap.stop="$emit('buy', ticket)">去购票</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { TicketType } from '@/api/ticket';

defineProps<{ ticket: TicketType }>();
defineEmits<{ select: [ticket: TicketType]; buy: [ticket: TicketType] }>();

function formatMoney(value: string | number) {
  return Number(value || 0).toFixed(2);
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.ticket-card {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 28rpx;
  margin-bottom: 22rpx;
}

.ticket-name {
  font-size: 34rpx;
  font-weight: 800;
  color: $shendu-red;
}

.ticket-desc {
  margin-top: 12rpx;
  color: #6f5f57;
  font-size: 24rpx;
  line-height: 1.6;
}

.ticket-meta {
  display: flex;
  gap: 12rpx;
  margin-top: 18rpx;

  text {
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    color: $amber;
    font-size: 22rpx;
    background: rgba(217, 119, 6, 0.08);
  }
}

.ticket-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  min-width: 164rpx;
}

.price {
  color: $shendu-red;
  font-size: 36rpx;
  font-weight: 900;
}

.buy-button {
  @include pressable;
  padding: 18rpx 26rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  background: linear-gradient(135deg, $shendu-red, $tang-gold);
}
</style>
