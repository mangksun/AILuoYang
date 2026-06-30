<template>
  <view class="page-shell questions-page">
    <view
      v-for="item in logs"
      :key="item.id"
      class="qa-card tang-card"
    >
      <view class="qa-question">
        <text class="qa-label">问</text>
        <text class="qa-text">{{ item.user_input }}</text>
      </view>
      <view class="qa-answer">
        <text class="qa-label qa-label--ai">答</text>
        <view class="qa-text-wrap">
          <text :class="['qa-text', { collapsed: !expandedIds.has(item.id) }]">{{ item.ai_reply }}</text>
          <text
            v-if="isLong(item.ai_reply)"
            class="toggle-btn"
            @tap="toggle(item.id)"
          >{{ expandedIds.has(item.id) ? '收起' : '展开全文' }}</text>
        </view>
      </view>
      <view class="qa-meta">
        <text v-if="item.intent" class="qa-intent">{{ item.intent }}</text>
        <text class="qa-time">{{ formatTime(item.created_at) }}</text>
      </view>
    </view>

    <view v-if="loading" class="loading-tip">加载中...</view>

    <view v-if="!loading && logs.length && noMore" class="loading-tip">没有更多了</view>

    <view v-if="!loading && !logs.length" class="empty tang-card">
      <text>暂无提问记录</text>
      <text class="empty-sub">去首页向洛灵儿提问吧</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onReachBottom } from '@dcloudio/uni-app';
import { getMyChatLogs } from '@/api/ai';
import type { ChatLogItem } from '@/api/ai';

const logs = ref<ChatLogItem[]>([]);
const loading = ref(false);
const noMore = ref(false);
const page = ref(1);
const pageSize = 20;
const expandedIds = ref(new Set<number>());

const LONG_THRESHOLD = 120;

function isLong(text: string) {
  return text && text.length > LONG_THRESHOLD;
}

function toggle(id: number) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id);
  } else {
    expandedIds.value.add(id);
  }
}

loadLogs();

async function loadLogs() {
  if (loading.value || noMore.value) return;
  loading.value = true;
  try {
    const data = await getMyChatLogs(page.value, pageSize);
    logs.value.push(...data.list);
    if (logs.value.length >= data.total) {
      noMore.value = true;
    } else {
      page.value++;
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

onReachBottom(() => {
  loadLogs();
});

function formatTime(raw: string) {
  if (!raw) return '';
  return raw.slice(0, 16).replace('T', ' ');
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.questions-page {
  padding-top: 20rpx;
  padding-bottom: 60rpx;
  background: $paper-bg;
  min-height: 100vh;
}

.qa-card {
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.qa-question {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
}

.qa-answer {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid rgba(236, 231, 225, 0.6);
}

.qa-label {
  flex-shrink: 0;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  background: $shendu-red;
}

.qa-label--ai {
  background: $tang-gold;
}

.qa-text-wrap {
  flex: 1;
  min-width: 0;
}

.qa-text {
  font-size: 28rpx;
  color: $text-main;
  line-height: 1.6;
  word-break: break-all;
}

.qa-text.collapsed {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

.toggle-btn {
  display: inline-block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: $shendu-red;
}

.qa-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
  padding-top: 16rpx;
  border-top: 1px solid rgba(236, 231, 225, 0.4);
}

.qa-intent {
  font-size: 22rpx;
  color: $shendu-red;
  padding: 4rpx 16rpx;
  background: rgba(139, 30, 34, 0.08);
  border-radius: 100rpx;
}

.qa-time {
  font-size: 22rpx;
  color: $text-muted;
}

.loading-tip {
  padding: 30rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: $text-muted;
}

.empty {
  padding: 80rpx 40rpx;
  text-align: center;
  color: $text-muted;
  font-size: 28rpx;
}

.empty-sub {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: $text-muted;
  opacity: 0.7;
}
</style>
