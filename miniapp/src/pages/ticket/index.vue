<template>
  <view class="page-shell ticket-page">
    <view class="nav-title">便捷购票</view>
    <scroll-view class="guide-scroll" scroll-x="true" show-scrollbar="false">
      <view class="guide-track">
        <view v-for="guide in guides" :key="guide" class="guide-card" @tap="sendGuide(guide)">{{ guide }}</view>
      </view>
    </scroll-view>

    <view class="feature tang-card">
      <view class="feature-copy">
        <view class="feature-title">AI 先讲景，再购票</view>
        <view class="feature-desc">点击票卡后，洛灵儿会自动发送对应景点/票种介绍气泡。</view>
      </view>
      <view class="feature-image">
        <view class="mountain">神都</view>
        <button class="float-buy" @tap="scrollToTickets">去购票</button>
      </view>
    </view>

    <view class="list-head">
      <text>真实可售票种</text>
      <button @tap="loadTickets">刷新</button>
    </view>

    <TicketCard v-for="ticket in ticketStore.tickets" :key="ticket.id" :ticket="ticket" @select="introduce" @buy="openTicketDetail" />

    <view v-if="!ticketStore.tickets.length && !ticketStore.loading" class="empty tang-card">暂无可售票种，请先在后台配置 active 票种。</view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import TicketCard from '@/components/TicketCard.vue';
import type { TicketType } from '@/api/ticket';
import type { AiAction } from '@/api/ai';
import { useChatStore } from '@/stores/chat';
import { useTicketStore } from '@/stores/ticket';

const chat = useChatStore();
const ticketStore = useTicketStore();
const guides = ['听说应天门夜景极其壮丽，怎么买票？', '想看龙门石窟大佛，有推荐票吗？', '白马寺适合半日游吗？', '给我推荐适合亲子的票'];
let handlingPendingAction = false;

onMounted(loadTickets);
onShow(handlePendingTicketAction);

async function loadTickets() {
  try {
    await ticketStore.fetchTickets({ page: 1, pageSize: 50 });
  } catch (error: any) {
    uni.showToast({ title: error.message || '票种加载失败', icon: 'none' });
  }
}

async function handlePendingTicketAction() {
  if (handlingPendingAction) return;

  const action = uni.getStorageSync('pendingTicketAction') as AiAction | undefined;
  if (!action?.ticketTypeId) return;

  handlingPendingAction = true;
  uni.removeStorageSync('pendingTicketAction');

  try {
    if (!ticketStore.tickets.length) {
      await loadTickets();
    }

    const ticket = ticketStore.tickets.find((item) => item.id === action.ticketTypeId);
    if (!ticket) {
      uni.showToast({ title: '推荐票种暂不可售，请查看列表', icon: 'none' });
      return;
    }

    uni.pageScrollTo({ scrollTop: 520, duration: 300 });
    uni.showModal({
      title: 'AI 已找到票种',
      content: `${ticket.name}，数量 ${action.ticketCount || 1} 张。是否立即创建订单？`,
      confirmText: '立即下单',
      cancelText: '先看看',
      success: (result) => {
        if (result.confirm) {
          openTicketDetail(ticket, action.ticketCount || 1);
        }
      },
    });
  } finally {
    handlingPendingAction = false;
  }
}

function sendGuide(text: string) {
  chat.appendGuide(text).catch(() => undefined);
  uni.switchTab({ url: '/pages/home/index' });
}

function introduce(ticket: TicketType) {
  chat.appendGuide(`请介绍${ticket.name}，并告诉我是否适合现在购买`).catch(() => undefined);
  uni.switchTab({ url: '/pages/home/index' });
}

function openTicketDetail(ticket: TicketType, quantity = 1) {
  uni.navigateTo({ url: `/pages/ticket/detail?id=${ticket.id}&quantity=${quantity}` });
}

function scrollToTickets() {
  uni.pageScrollTo({ scrollTop: 520, duration: 300 });
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.ticket-page {
  padding-top: 72rpx;
  padding-bottom: 70rpx;
}

.nav-title {
  color: $shendu-red;
  font-size: 42rpx;
  font-weight: 900;
}

.guide-scroll {
  width: calc(100vw - 28rpx);
  margin-top: 24rpx;
}

.guide-track {
  display: flex;
  gap: 16rpx;
  padding-right: 28rpx;
}

.guide-card {
  @include pressable;
  flex: 0 0 360rpx;
  min-height: 104rpx;
  padding: 24rpx;
  border: 1px solid rgba(212,175,55,0.24);
  border-radius: 24rpx;
  color: #5f4741;
  font-size: 25rpx;
  line-height: 1.45;
  background: rgba(255,255,255,0.66);
}

.feature {
  margin-top: 26rpx;
  padding: 28rpx;
}

.feature-title {
  color: $shendu-red;
  font-size: 34rpx;
  font-weight: 900;
}

.feature-desc {
  margin-top: 12rpx;
  color: $text-muted;
  font-size: 25rpx;
  line-height: 1.55;
}

.feature-image {
  position: relative;
  height: 260rpx;
  margin-top: 24rpx;
  overflow: hidden;
  border-radius: 28rpx;
  background:
    radial-gradient(circle at 72% 34%, rgba(212,175,55,0.5), transparent 28%),
    linear-gradient(135deg, #8b1e22, #d97706 62%, #ece7e1);
}

.mountain {
  position: absolute;
  left: 34rpx;
  bottom: 34rpx;
  color: rgba(255,255,255,0.32);
  font-size: 88rpx;
  font-weight: 900;
}

.float-buy {
  @include pressable;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 24rpx 44rpx;
  border-radius: 999rpx;
  color: $shendu-red;
  font-size: 30rpx;
  font-weight: 900;
  background: rgba(255,250,240,0.88);
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 34rpx 0 20rpx;

  text {
    color: $shendu-red;
    font-size: 34rpx;
    font-weight: 900;
  }

  button {
    color: $amber;
    font-size: 24rpx;
  }
}

.empty {
  padding: 40rpx;
  color: $text-muted;
  font-size: 26rpx;
  text-align: center;
}
</style>
