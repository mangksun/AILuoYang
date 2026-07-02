<template>
  <view class="page-shell verify-page">
    <view class="nav-row">
      <button class="back" @tap="goBack">‹</button>
      <view class="nav-title">扫码核销</view>
    </view>

    <!-- 扫码按钮 -->
    <view class="scan-card tang-card">
      <view class="scan-icon" @tap="scanCode">
        <text class="scan-qr">⊞</text>
      </view>
      <text class="scan-text">点击扫描游客二维码</text>
      <button class="scan-btn gold-button" :disabled="scanning" @tap="scanCode">
        {{ scanning ? '扫描中...' : '开始扫码' }}
      </button>
    </view>

    <!-- 核销结果 -->
    <view v-if="result" class="result-card tang-card" :class="result.success ? 'result-success' : 'result-fail'">
      <view class="result-icon">{{ result.success ? '✓' : '✗' }}</view>
      <view class="result-title">{{ result.success ? '核销成功' : '核销失败' }}</view>
      <view class="result-msg">{{ result.message }}</view>
      <view v-if="result.orderNo" class="result-detail">订单号: {{ result.orderNo }}</view>
    </view>

    <!-- 历史记录 -->
    <view v-if="history.length" class="history-card tang-card">
      <view class="card-title">本次核销记录</view>
      <view v-for="(item, idx) in history" :key="idx" class="history-item">
        <text class="history-no">{{ item.orderNo }}</text>
        <text :class="item.success ? 'history-ok' : 'history-fail'">
          {{ item.success ? '成功' : '失败' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { staffCheck } from '@/api/ticket';

const scanning = ref(false);
const result = ref<{ success: boolean; message: string; orderNo?: string } | null>(null);
const history = ref<Array<{ success: boolean; message: string; orderNo: string }>>([]);

async function scanCode() {
  if (scanning.value) return;
  scanning.value = true;
  result.value = null;

  try {
    const scanRes = await new Promise<UniApp.ScanCodeSuccessRes>((resolve, reject) => {
      uni.scanCode({
        scanType: ['qrCode'],
        success: resolve,
        fail: reject,
      });
    });

    let orderId: number;
    let orderNo = '';
    try {
      const payload = JSON.parse(scanRes.result);
      orderId = payload.orderId;
      orderNo = payload.orderNo || '';
    } catch {
      result.value = { success: false, message: '无效的二维码格式' };
      return;
    }

    const checkResult = await staffCheck({ orderId, checkType: 'entry' });
    const success = checkResult.data?.success !== false;
    const msg = success ? '核销成功' : (checkResult.message || '核销失败');
    result.value = { success, message: msg, orderNo };
    history.value.unshift({ success, message: msg, orderNo });
  } catch (error: any) {
    const msg = error?.data?.message || error?.message || '核销失败';
    result.value = { success: false, message: msg };
    history.value.unshift({ success: false, message: msg, orderNo: '-' });
  } finally {
    scanning.value = false;
  }
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

.verify-page {
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

/* 扫码卡片 */
.scan-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 30rpx;
  margin-top: 26rpx;
}

.scan-icon {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
  background: rgba(139, 30, 34, 0.08);
}

.scan-qr {
  font-size: 80rpx;
  color: $shendu-red;
}

.scan-text {
  margin-top: 24rpx;
  color: $text-muted;
  font-size: 26rpx;
}

.scan-btn {
  width: 80%;
  margin-top: 36rpx;
}

/* 核销结果 */
.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 30rpx;
  margin-top: 20rpx;
}

.result-success {
  border-color: rgba(22, 163, 74, 0.3);
}

.result-fail {
  border-color: rgba(139, 30, 34, 0.3);
}

.result-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 40rpx;
  color: #fff;
}

.result-success .result-icon {
  background: #16a34a;
}

.result-fail .result-icon {
  background: $shendu-red;
}

.result-title {
  margin-top: 18rpx;
  font-size: 34rpx;
  font-weight: 900;
  color: $text-main;
}

.result-msg {
  margin-top: 10rpx;
  color: $text-muted;
  font-size: 26rpx;
}

.result-detail {
  margin-top: 12rpx;
  color: $text-muted;
  font-size: 24rpx;
}

/* 历史记录 */
.history-card {
  padding: 30rpx;
  margin-top: 20rpx;
}

.card-title {
  color: $text-main;
  font-size: 30rpx;
  font-weight: 900;
  margin-bottom: 18rpx;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 0;
  border-top: 1px solid rgba(236, 231, 225, 0.6);
}

.history-no {
  color: $text-main;
  font-size: 26rpx;
}

.history-ok {
  color: #16a34a;
  font-size: 26rpx;
  font-weight: 700;
}

.history-fail {
  color: $shendu-red;
  font-size: 26rpx;
  font-weight: 700;
}
</style>
