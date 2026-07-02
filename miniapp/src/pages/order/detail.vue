<template>
  <view class="page-shell detail-page">
    <view class="nav-row">
      <button class="back" @tap="goBack">‹</button>
      <view class="nav-title">订单详情</view>
    </view>

    <view v-if="loading" class="empty tang-card">加载中...</view>

    <template v-else-if="order">
      <!-- 状态卡片 -->
      <view class="status-card tang-card">
        <view class="status-icon" :class="statusClass">{{ statusIcon }}</view>
        <view class="status-text">{{ statusText }}</view>
        <view class="order-no">订单号: {{ order.orderNo }}</view>
      </view>

      <!-- 门票信息 -->
      <view class="info-card tang-card">
        <view class="card-title">门票信息</view>
        <view class="info-row">
          <text class="info-label">票种名称</text>
          <text class="info-value">{{ ticketName(order.ticketTypeId) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">票类</text>
          <text class="info-value">{{ visitorLabel(order.visitorCategory) }} × {{ order.quantity }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">预约日期</text>
          <text class="info-value">{{ order.visitDate ? order.visitDate.slice(0, 10) : '未选择' }}</text>
        </view>
        <view v-if="order.contactName" class="info-row">
          <text class="info-label">联系人</text>
          <text class="info-value">{{ order.contactName }}</text>
        </view>
        <view v-if="order.contactPhone" class="info-row">
          <text class="info-label">手机号</text>
          <text class="info-value">{{ order.contactPhone }}</text>
        </view>
      </view>

      <!-- 二维码卡片 (已支付且未核销) -->
      <view v-if="order.status === 'paid' && verification?.status !== 'used'" class="qr-card tang-card">
        <view class="card-title">入园二维码</view>
        <view class="qr-box">
          <canvas canvas-id="qrcode" class="qr-canvas" />
        </view>
        <text class="qr-hint">请向工作人员出示此二维码</text>
      </view>

      <!-- 核销状态 (已核销) -->
      <view v-if="verification?.status === 'used'" class="verify-card tang-card">
        <view class="verify-status">
          <text class="verify-icon">✓</text>
          <text class="verify-text">已核销</text>
        </view>
        <view v-if="verification.firstVerifiedAt" class="info-row">
          <text class="info-label">核销时间</text>
          <text class="info-value">{{ formatTime(verification.firstVerifiedAt) }}</text>
        </view>
      </view>

      <!-- 支付信息 -->
      <view class="pay-card tang-card">
        <view class="card-title">支付信息</view>
        <view class="info-row">
          <text class="info-label">支付方式</text>
          <text class="info-value">{{ payMethodLabel(order.payMethod) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">商品总额</text>
          <text class="info-value">¥{{ formatMoney(order.totalAmount) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">实付金额</text>
          <text class="info-value highlight">¥{{ formatMoney(order.payAmount) }}</text>
        </view>
        <view v-if="Number(order.refundAmount) > 0" class="info-row">
          <text class="info-label">退款金额</text>
          <text class="info-value refund">-¥{{ formatMoney(order.refundAmount) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ formatTime(order.createdAt) }}</text>
        </view>
      </view>

      <!-- 支付按钮 (待支付) -->
      <view v-if="order.status === 'pending'" class="pay-bar">
        <button class="pay-btn gold-button" :disabled="paying" @tap="handlePay">
          {{ paying ? '支付中...' : '立即支付' }}
        </button>
      </view>
    </template>

    <view v-else class="empty tang-card">订单不存在</view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import UQRCode from '@uqrcode/js';
import { getOrder, payOrder } from '@/api/ticket';
import type { MiniappOrder } from '@/api/ticket';
import { useTicketStore } from '@/stores/ticket';

const ticket = useTicketStore();

const order = ref<MiniappOrder | null>(null);
const orderId = ref<number>(0);
const loading = ref(true);
const paying = ref(false);

const verification = computed(() => order.value?.verification ?? null);

const statusText = computed(() => {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    partial_refund: '部分退款',
    refunded: '已退款',
    cancelled: '已取消',
  };
  return map[order.value?.status || ''] || '未知状态';
});

const statusIcon = computed(() => {
  const map: Record<string, string> = {
    pending: '⏳',
    paid: '✓',
    partial_refund: '↩',
    refunded: '↩',
    cancelled: '✗',
  };
  return map[order.value?.status || ''] || '?';
});

const statusClass = computed(() => {
  const map: Record<string, string> = {
    pending: 'status-pending',
    paid: 'status-paid',
    partial_refund: 'status-refund',
    refunded: 'status-refund',
    cancelled: 'status-cancelled',
  };
  return map[order.value?.status || ''] || '';
});

onLoad(async (options) => {
  orderId.value = Number(options?.id) || 0;
  if (!orderId.value) {
    loading.value = false;
    return;
  }
  await loadOrder();
});

onShow(async () => {
  if (orderId.value && !loading.value) {
    await loadOrder();
  }
});

async function loadOrder() {
  try {
    if (!ticket.tickets.length) {
      await ticket.fetchTickets({ page: 1, pageSize: 100 }).catch(() => undefined);
    }
    order.value = await getOrder(orderId.value);
    if (order.value.status === 'paid' && order.value.verification?.status !== 'used') {
      nextTick(() => generateQRCode());
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '订单加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function ticketName(ticketTypeId: number) {
  return ticket.tickets.find((t) => t.id === ticketTypeId)?.name || `票种 ${ticketTypeId}`;
}

function visitorLabel(category?: string) {
  const labels: Record<string, string> = {
    adult: '成人票',
    child: '儿童票',
    senior: '老人票',
    student: '学生票',
  };
  return labels[category || 'adult'] || '成人票';
}

function payMethodLabel(method: string) {
  const labels: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    cash: '现金',
    member_card: '会员卡',
  };
  return labels[method] || method;
}

function formatMoney(value: string | number) {
  return Number(value || 0).toFixed(2);
}

function formatTime(value?: string) {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 19);
}

async function handlePay() {
  if (!order.value || paying.value) return;
  paying.value = true;
  try {
    const updated = await payOrder(order.value.id);
    order.value = { ...order.value, ...updated };
    uni.showToast({ title: '支付成功', icon: 'success' });
    nextTick(() => generateQRCode());
  } catch (error: any) {
    uni.showToast({ title: error.message || '支付失败', icon: 'none' });
  } finally {
    paying.value = false;
  }
}

function generateQRCode() {
  if (!order.value?.qrcodePayload) return;
  const qr = new UQRCode();
  qr.data = JSON.stringify(order.value.qrcodePayload);
  qr.size = 200;
  qr.make();
  const ctx = uni.createCanvasContext('qrcode');
  qr.canvasContext = ctx;
  qr.drawCanvas();
}

function goBack() {
  uni.navigateBack({
    delta: 1,
    fail: () => uni.switchTab({ url: '/pages/user-center/index' }),
  });
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.detail-page {
  min-height: 100vh;
  padding-top: 72rpx;
  padding-bottom: 40rpx;
}

.nav-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.back {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  color: $shendu-red;
  font-size: 46rpx;
  background: rgba(212, 175, 55, 0.16);
}

.nav-title {
  color: $shendu-red;
  font-size: 40rpx;
  font-weight: 900;
}

/* 状态卡片 */
.status-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 30rpx;
  margin-top: 26rpx;
}

.status-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 40rpx;
  color: #fff;
  background: $text-muted;
}

.status-paid {
  background: #16a34a;
}

.status-pending {
  background: $amber;
}

.status-refund {
  background: $shendu-red;
}

.status-cancelled {
  background: $text-muted;
}

.status-text {
  margin-top: 18rpx;
  color: $text-main;
  font-size: 36rpx;
  font-weight: 900;
}

.order-no {
  margin-top: 12rpx;
  color: $text-muted;
  font-size: 24rpx;
}

/* 通用卡片 */
.info-card,
.pay-card,
.qr-card,
.verify-card {
  padding: 30rpx;
  margin-top: 20rpx;
}

.card-title {
  color: $text-main;
  font-size: 30rpx;
  font-weight: 900;
  margin-bottom: 18rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72rpx;
  border-top: 1px solid rgba(236, 231, 225, 0.6);

  &:first-of-type {
    border-top: none;
  }
}

.info-label {
  color: $text-muted;
  font-size: 26rpx;
}

.info-value {
  color: $text-main;
  font-size: 26rpx;
}

.highlight {
  color: $shendu-red;
  font-size: 30rpx;
  font-weight: 900;
}

.refund {
  color: $amber;
  font-weight: 700;
}

/* 二维码卡片 */
.qr-card {
  text-align: center;
}

.qr-box {
  display: flex;
  justify-content: center;
  padding: 24rpx 0;
}

.qr-canvas {
  width: 400rpx;
  height: 400rpx;
}

.qr-hint {
  margin-top: 12rpx;
  color: $text-muted;
  font-size: 22rpx;
  text-align: center;
}

/* 核销状态 */
.verify-card {
  text-align: center;
}

.verify-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.verify-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-size: 30rpx;
  background: #16a34a;
}

.verify-text {
  color: #16a34a;
  font-size: 32rpx;
  font-weight: 900;
}

/* 支付按钮 */
.pay-bar {
  padding: 30rpx 0;
  margin-top: 20rpx;
}

.pay-btn {
  width: 100%;
}

.empty {
  padding: 60rpx;
  margin-top: 40rpx;
  color: $text-muted;
  font-size: 28rpx;
  text-align: center;
}
</style>
