<template>
  <view class="page-shell travelogue-page">
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="nav-title">旅行游记</view>
      <view class="nav-placeholder" />
    </view>

    <scroll-view v-if="!showResult" class="main-scroll" scroll-y>
      <view class="hero-banner">
        <view class="seal">游</view>
        <view class="hero-copy">
          <view class="hero-title">旅行游记助手</view>
          <view class="hero-desc">告诉我您的行程与风格，AI 为您创作专属游记</view>
        </view>
      </view>

      <view class="form-card">
        <view class="section">
          <view class="section-label">
            <text class="label-text">游玩景点</text>
            <text class="label-sub">可多选</text>
          </view>
          <view class="chip-grid">
            <view
              v-for="spot in spotList"
              :key="spot"
              class="chip"
              :class="{ active: selectedSpots.includes(spot) }"
              @tap="toggleSpot(spot)"
            >
              {{ spot }}
            </view>
          </view>
        </view>

        <view class="section">
          <view class="section-label">
            <text class="label-text">写作风格</text>
          </view>
          <view class="style-list">
            <view
              v-for="s in styleList"
              :key="s"
              class="style-item"
              :class="{ active: selectedStyle === s }"
              @tap="selectedStyle = s"
            >
              <text>{{ s }}</text>
              <text v-if="selectedStyle === s" class="check">✓</text>
              <text v-else class="arrow">›</text>
            </view>
          </view>
        </view>

        <view class="section">
          <view class="section-label">
            <text class="label-text">游玩经历</text>
          </view>
          <textarea
            class="experience-input"
            v-model="experience"
            maxlength="500"
            placeholder="请输入您的游玩经历..."
            placeholder-class="ph"
          />
          <view class="char-count">{{ experience.length }}/500</view>
        </view>
      </view>

      <button class="submit-btn" :loading="loading" @tap="submit">
        <text v-if="!loading">生成游记</text>
        <text v-else>AI 创作中...</text>
      </button>
    </scroll-view>

    <scroll-view v-if="showResult" class="result-scroll" scroll-y>
      <view class="ai-chat">
        <view class="user-bubble">
          <view class="bubble-content">
            <view class="bubble-title">帮我制定一份旅行游记，要求如下：</view>
            <view class="bubble-item">游玩景点：{{ selectedSpots.join('、') || '未选择' }}</view>
            <view class="bubble-item">写作风格：{{ selectedStyle }}</view>
            <view class="bubble-item">游玩经历：{{ experience || '（未填写）' }}</view>
          </view>
        </view>

        <view v-if="loading" class="loading-section">
          <view class="loading-text">旅行游记正在努力思考等待</view>
          <view class="loading-dots">
            <view v-for="i in 5" :key="i" class="dot" :style="{ animationDelay: `${(i - 1) * 0.2}s` }" />
          </view>
        </view>

        <view v-else-if="result" class="result-section">
          <view class="result-card">
            <view class="result-title">{{ result.title }}</view>
            <view class="result-content">{{ result.content }}</view>
          </view>
          <view class="action-row">
            <view class="action-btn" @tap="copyResult">
              <text>复制游记</text>
            </view>
            <view class="action-btn primary" @tap="resetForm">
              <text>重新生成</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { generateTravelogue } from '@/api/ai';

const spotList = ['十里画廊', '漓江', '两江四湖', '龙脊梯田', '遇龙河', '阳朔西街', '银子岩', '象鼻山'];
const styleList = ['口语化', '文艺', '活泼', '正式'];

const selectedSpots = ref<string[]>(['十里画廊']);
const selectedStyle = ref('口语化');
const experience = ref('');
const loading = ref(false);
const showResult = ref(false);
const result = ref<{ title: string; content: string } | null>(null);

function toggleSpot(spot: string) {
  const idx = selectedSpots.value.indexOf(spot);
  if (idx >= 0) selectedSpots.value.splice(idx, 1);
  else selectedSpots.value.push(spot);
}

function goBack() {
  uni.navigateBack();
}

function cleanContent(raw: string) {
  let text = (raw || '').trim();
  text = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
  text = text.replace(/^\s*title[:：]\s*.*$/gm, '');
  text = text.replace(/^\s*content[:：]\s*$/gm, '');
  text = text.replace(/^\s*\{\s*$/gm, '').replace(/^\s*\}\s*$/gm, '');
  text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

async function submit() {
  if (!selectedSpots.value.length) {
    uni.showToast({ title: '请至少选择一个景点', icon: 'none' });
    return;
  }

  showResult.value = true;
  loading.value = true;
  result.value = null;

  try {
    const res = await generateTravelogue({
      spots: selectedSpots.value,
      style: selectedStyle.value,
      experience: experience.value,
    });
    result.value = {
      title: (res?.title as string) || `洛阳${selectedSpots.value.join('、')}之旅`,
      content: cleanContent((res?.content as string) || ''),
    };
  } catch (error: any) {
    uni.showToast({ title: error?.message || '生成失败，请重试', icon: 'none' });
    showResult.value = false;
  } finally {
    loading.value = false;
  }
}

function copyResult() {
  if (!result.value) return;
  uni.setClipboardData({
    data: `${result.value.title}\n\n${result.value.content}`,
    success: () => uni.showToast({ title: '已复制到剪贴板', icon: 'success' }),
  });
}

function resetForm() {
  showResult.value = false;
  result.value = null;
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.travelogue-page {
  min-height: 100vh;
  padding: 0;
  background:
    radial-gradient(circle at 12% 0%, rgba(212, 175, 55, 0.22), transparent 38%),
    radial-gradient(circle at 100% 18%, rgba(139, 30, 34, 0.1), transparent 40%),
    linear-gradient(180deg, #faf3e7 0%, #fdfaf3 35%, #ffffff 100%);
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 28rpx 20rpx;
  background: rgba(255, 252, 245, 0.82);
  backdrop-filter: blur(20rpx);
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 56rpx;
  color: $shendu-red;
  font-weight: 300;
}

.nav-title {
  color: $shendu-red;
  font-size: 36rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
}

.nav-placeholder {
  width: 64rpx;
}

.main-scroll {
  height: calc(100vh - 180rpx);
  padding: 0 28rpx;
}

.hero-banner {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 20rpx;
  padding: 32rpx 28rpx;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(255, 250, 240, 0.95), rgba(255, 244, 220, 0.85));
  box-shadow: 0 12rpx 32rpx rgba(139, 30, 34, 0.08);
}

.seal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  color: #fff8dc;
  font-size: 52rpx;
  font-weight: 900;
  background: linear-gradient(135deg, $shendu-red, #b33a2f);
  box-shadow: 0 8rpx 20rpx rgba(139, 30, 34, 0.35);
}

.hero-copy {
  flex: 1;
}

.hero-title {
  color: $shendu-red;
  font-size: 34rpx;
  font-weight: 900;
  letter-spacing: 3rpx;
}

.hero-desc {
  margin-top: 10rpx;
  color: $text-muted;
  font-size: 24rpx;
  line-height: 1.5;
}

.form-card {
  margin-top: 28rpx;
  padding: 32rpx 28rpx;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 24rpx;
  background: rgba(255, 252, 245, 0.92);
  box-shadow: 0 8rpx 28rpx rgba(139, 30, 34, 0.06);
}

.section {
  &:not(:first-child) {
    margin-top: 36rpx;
  }
}

.section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label-text {
  color: $shendu-red;
  font-size: 28rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.label-sub {
  color: $text-muted;
  font-size: 22rpx;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}

.chip {
  padding: 16rpx 26rpx;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 999rpx;
  color: $ink-body;
  font-size: 26rpx;
  background: #fffdf5;
  transition: all 0.18s ease;

  &.active {
    border-color: $shendu-red;
    color: #fff8dc;
    font-weight: 700;
    background: linear-gradient(135deg, $shendu-red, #b33a2f);
    box-shadow: 0 6rpx 16rpx rgba(139, 30, 34, 0.25);
  }
}

.style-list {
  margin-top: 20rpx;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16rpx;
  overflow: hidden;
  background: #fffdf5;
}

.style-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 28rpx;
  color: $ink-body;
  font-size: 28rpx;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);

  &:last-child {
    border-bottom: none;
  }

  &.active {
    color: $shendu-red;
    font-weight: 800;
    background: rgba(212, 175, 55, 0.1);
  }

  .check {
    color: $shendu-red;
    font-weight: 900;
  }

  .arrow {
    color: $tang-gold;
    font-size: 32rpx;
  }
}

.experience-input {
  width: 100%;
  min-height: 220rpx;
  margin-top: 20rpx;
  padding: 24rpx;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 16rpx;
  color: $ink-deep;
  font-size: 28rpx;
  line-height: 1.6;
  background: #fffdf5;
  box-sizing: border-box;
}

.ph {
  color: $text-muted;
  font-size: 26rpx;
}

.char-count {
  margin-top: 8rpx;
  text-align: right;
  color: $text-muted;
  font-size: 22rpx;
}

.submit-btn {
  @include pressable;
  position: relative;
  width: 100%;
  height: 96rpx;
  margin-top: 40rpx;
  border-radius: 999rpx;
  color: #fff8dc;
  font-size: 32rpx;
  font-weight: 900;
  letter-spacing: 8rpx;
  background: linear-gradient(135deg, $shendu-red 0%, #b33a2f 50%, $tang-gold 100%);
  box-shadow: 0 16rpx 32rpx rgba(139, 30, 34, 0.28);

  &::before {
    content: '';
    position: absolute;
    top: -40%;
    left: -35%;
    width: 32%;
    height: 180%;
    transform: rotate(22deg);
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    animation: shimmer 2.6s ease-in-out infinite;
  }
}

.result-scroll {
  height: calc(100vh - 180rpx);
  padding: 0 28rpx;
}

.ai-chat {
  padding-top: 20rpx;
}

.user-bubble {
  display: flex;
  justify-content: flex-end;
}

.bubble-content {
  max-width: 85%;
  padding: 24rpx 28rpx;
  border-radius: 24rpx 24rpx 8rpx 24rpx;
  background: linear-gradient(135deg, $shendu-red, #b33a2f);
  box-shadow: 0 10rpx 24rpx rgba(139, 30, 34, 0.22);
}

.bubble-title {
  color: rgba(255, 248, 220, 0.95);
  font-size: 26rpx;
  font-weight: 700;
}

.bubble-item {
  margin-top: 12rpx;
  color: rgba(255, 248, 220, 0.88);
  font-size: 24rpx;
  line-height: 1.5;
}

.loading-section {
  margin-top: 24rpx;
  padding: 32rpx;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 20rpx;
  background: rgba(255, 252, 245, 0.95);
}

.loading-text {
  color: $ink-body;
  font-size: 26rpx;
}

.loading-dots {
  display: flex;
  gap: 10rpx;
  margin-top: 16rpx;
}

.dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: $tang-gold;
  animation: dotPulse 1.4s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.result-section {
  margin-top: 24rpx;
}

.result-card {
  padding: 32rpx 28rpx;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(255, 252, 245, 0.98), rgba(255, 244, 220, 0.92));
  box-shadow: 0 12rpx 32rpx rgba(139, 30, 34, 0.08);
}

.result-title {
  color: $shendu-red;
  font-size: 32rpx;
  font-weight: 900;
  letter-spacing: 2rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.4);
}

.result-content {
  margin-top: 24rpx;
  color: $ink-deep;
  font-size: 28rpx;
  line-height: 1.85;
  white-space: pre-wrap;
}

.action-row {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.action-btn {
  @include pressable;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 999rpx;
  color: $shendu-red;
  font-size: 28rpx;
  font-weight: 700;
  background: #fffdf5;

  &.primary {
    color: #fff8dc;
    border-color: transparent;
    background: linear-gradient(135deg, $shendu-red, #b33a2f);
    box-shadow: 0 10rpx 24rpx rgba(139, 30, 34, 0.25);
  }
}
</style>
