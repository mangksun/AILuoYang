<template>
  <view class="live2d-page">
    <view v-if="loading" class="status-layer">
      <view class="status-card">
        <view class="status-title">洛灵儿加载中</view>
        <view class="status-desc">正在打开数字人 H5 容器</view>
      </view>
    </view>

    <view v-if="errorMessage" class="status-layer error-layer">
      <view class="status-card">
        <view class="status-title">加载失败</view>
        <view class="status-desc">{{ errorMessage }}</view>
        <button class="retry-btn" @tap="reload">重试</button>
      </view>
    </view>

    <web-view :src="h5Url" @message="onWebMessage" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app';

const DEFAULT_H5_URL = 'http://10.111.6.196:5173/live2d/index.html';

const h5Url = ref(DEFAULT_H5_URL);
const loading = ref(true);
const errorMessage = ref('');

function normalizeH5Url(rawUrl?: string) {
  if (!rawUrl) return DEFAULT_H5_URL;

  try {
    return decodeURIComponent(rawUrl);
  } catch {
    return rawUrl;
  }
}

function onWebMessage(event: any) {
  const messages = event?.detail?.data || [];
  const latest = Array.isArray(messages) ? messages[messages.length - 1] : messages;

  if (!latest || typeof latest !== 'object') return;

  if (latest.type === 'LIVE2D_READY') {
    loading.value = false;
    errorMessage.value = '';
  }

  if (latest.type === 'LIVE2D_ERROR') {
    loading.value = false;
    errorMessage.value = latest.message || '数字人 H5 加载异常';
  }
}

function postLifecycle(type: string) {
  // 小程序 web-view 主动向 H5 发消息能力有限，这里先保留生命周期钩子位置。
  void type;
}

function reload() {
  errorMessage.value = '';
  loading.value = true;
  const separator = h5Url.value.includes('?') ? '&' : '?';
  h5Url.value = `${h5Url.value}${separator}reload=${Date.now()}`;
}

onLoad((query = {}) => {
  h5Url.value = normalizeH5Url(query.h5Url as string | undefined);

  if (!/^https:\/\//.test(h5Url.value) && !/^http:\/\/(localhost|10\.111\.6\.196)/.test(h5Url.value)) {
    errorMessage.value = 'web-view 正式环境必须使用已配置业务域名的 HTTPS 地址';
    loading.value = false;
  }
});

onShow(() => postLifecycle('show'));
onHide(() => postLifecycle('hide'));
onUnload(() => postLifecycle('unload'));
</script>

<style scoped lang="scss">
.live2d-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #faf8f5;
}

.status-layer {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(250, 248, 245, 0.92), rgba(255, 252, 248, 0.72));
}

.error-layer {
  pointer-events: auto;
}

.status-card {
  width: 560rpx;
  padding: 40rpx;
  border: 1px solid rgba(212, 175, 55, 0.28);
  border-radius: 28rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 24rpx 70rpx rgba(139, 30, 34, 0.12);
}

.status-title {
  color: #8b1e22;
  font-size: 34rpx;
  font-weight: 900;
}

.status-desc {
  margin-top: 16rpx;
  color: #8f7f76;
  font-size: 25rpx;
  line-height: 1.5;
}

.retry-btn {
  height: 72rpx;
  margin-top: 28rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 26rpx;
  background: #8b1e22;
}
</style>
