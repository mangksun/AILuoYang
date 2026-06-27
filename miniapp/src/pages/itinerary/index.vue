<template>
  <view class="page-shell itinerary-page">
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="nav-title">行程定制</view>
      <view class="nav-placeholder" />
    </view>

    <scroll-view class="main-scroll" scroll-y v-if="!showResult">
      <view class="form-card">
        <view class="section">
          <view class="section-label">请选择地点</view>
          <view class="pill-grid">
            <button v-for="district in districts" :key="district" class="pill" :class="{ active: selectedDistricts.includes(district) }" @tap="toggle(selectedDistricts, district)">
              {{ district }}
            </button>
          </view>
        </view>

        <view class="section">
          <view class="section-label">计划出发时间</view>
          <view class="date-row">
            <picker mode="date" :value="startDate" @change="startDate = String($event.detail.value)">
              <view class="date-box">{{ startDate || '选择日期' }}</view>
            </picker>
            <text class="date-split">至</text>
            <picker mode="date" :value="endDate" @change="endDate = String($event.detail.value)">
              <view class="date-box">{{ endDate || '选择日期' }}</view>
            </picker>
          </view>
        </view>

        <view class="section">
          <view class="section-label">旅游人数</view>
          <view class="stepper">
            <button class="stepper-btn minus" @tap="peopleCount = Math.max(1, peopleCount - 1)">-</button>
            <text class="stepper-value">{{ peopleCount }}</text>
            <button class="stepper-btn plus" @tap="peopleCount += 1">+</button>
          </view>
        </view>

        <view class="section">
          <view class="section-label">旅游偏好</view>
          <view class="pref-grid">
            <button v-for="pref in preferences" :key="pref" class="pref" :class="{ active: selectedPreferences.includes(pref) }" @tap="toggle(selectedPreferences, pref)">
              {{ pref }}
            </button>
          </view>
        </view>
      </view>

      <button class="submit-btn" :loading="itinerary.loading" @tap="submit">
        <text v-if="!itinerary.loading">去定制</text>
        <text v-else>生成中...</text>
      </button>
    </scroll-view>

    <scroll-view v-if="showResult" class="result-scroll" scroll-y>
      <view class="ai-chat">
        <view class="user-bubble">
          <view class="bubble-content">
            <view class="bubble-title">帮我制定一份旅游攻略，要求如下：</view>
            <view class="bubble-item">行程天数：{{ calcDays() }}天{{ calcDays() - 1 }}晚</view>
            <view class="bubble-item">出行人数：{{ peopleCount }}人</view>
            <view class="bubble-item">旅游偏好：{{ selectedPreferences.join('、') }}</view>
          </view>
        </view>

        <view v-if="itinerary.loading" class="loading-section">
          <view class="loading-text">分析中...</view>
          <view class="loading-dots">
            <view class="dot" />
            <view class="dot" />
            <view class="dot" />
            <view class="dot" />
            <view class="dot" />
          </view>
        </view>

        <view v-else-if="itinerary.currentPlan" class="result-section">
          <view class="result-summary">
            <view class="summary-title">{{ itinerary.currentPlan.summary || '你的专属行程已生成' }}</view>
            <view v-if="itinerary.currentPlan.estimatedCost" class="summary-cost">预估 ¥{{ itinerary.currentPlan.estimatedCost }}</view>
          </view>
          <TimelineCard v-for="day in itinerary.currentPlan.days" :key="day.day" :day="day" />
        </view>
      </view>
    </scroll-view>

    <view class="action-bar">
      <view class="input-wrap">
        <input class="chat-input" placeholder="有问题尽管问我..." confirm-type="send" @confirm="sendMessage" />
      </view>
      <button class="send-btn" @tap="sendMessage">
        <text class="send-icon">›</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TimelineCard from '@/components/TimelineCard.vue';
import { useItineraryStore } from '@/stores/itinerary';
import { useChatStore } from '@/stores/chat';

const itinerary = useItineraryStore();
const chat = useChatStore();

const districts = ['洛龙区', '老城区', '西工区', '涧西区', '瀍河区', '洛宁县', '栾川县', '嵩县', '宜阳县', '新安县', '孟津区'];
const preferences = ['非遗体验', '历史文化', '人文景点', '购物消费', '自然风光', '运动户外', '拍照摄影', '红色旅游', '科普研学', '民风民俗', '休闲度假'];
const selectedDistricts = ref<string[]>(['洛龙区', '老城区']);
const selectedPreferences = ref<string[]>(['历史文化', '拍照摄影']);
const startDate = ref('');
const endDate = ref('');
const peopleCount = ref(2);

const showResult = ref(false);

function toggle(list: string[], value: string) {
  const index = list.indexOf(value);
  if (index >= 0) list.splice(index, 1);
  else list.push(value);
}

function calcDays() {
  if (!startDate.value || !endDate.value) return 1;
  const start = new Date(startDate.value).getTime();
  const end = new Date(endDate.value).getTime();
  return Math.max(1, Math.ceil((end - start) / 86400000) + 1);
}

async function submit() {
  if (!selectedDistricts.value.length) {
    uni.showToast({ title: '请选择区县', icon: 'none' });
    return;
  }
  if (!startDate.value || !endDate.value) {
    uni.showToast({ title: '请选择完整出发日期', icon: 'none' });
    return;
  }
  if (new Date(endDate.value).getTime() < new Date(startDate.value).getTime()) {
    uni.showToast({ title: '结束日期不能早于开始日期', icon: 'none' });
    return;
  }
  if (peopleCount.value < 1) {
    uni.showToast({ title: '出行人数至少 1 人', icon: 'none' });
    return;
  }
  if (!selectedPreferences.value.length) {
    uni.showToast({ title: '请选择旅游偏好', icon: 'none' });
    return;
  }

  showResult.value = true;

  try {
    await itinerary.generate({
      districts: selectedDistricts.value,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      peopleCount: peopleCount.value,
      preferences: selectedPreferences.value,
      days: calcDays(),
    });
  } catch (error: any) {
    uni.showToast({ title: error.message || '生成失败', icon: 'none' });
  }
}

function goBack() {
  if (showResult.value) {
    showResult.value = false;
    return;
  }
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.switchTab({ url: '/pages/home/index' });
  }
}

async function sendMessage() {
  const input = (uni as any).getStorageSync('itinerary_input');
  if (input) {
    await chat.send(input);
    uni.removeStorageSync('itinerary_input');
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.itinerary-page {
  min-height: 100vh;
  padding: 0;
  background: linear-gradient(180deg, #e8f4f8 0%, #f5f9fc 40%, #ffffff 100%);
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 28rpx 20rpx;
  background: rgba(255, 255, 255, 0.9);
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
  color: $text-main;
  font-weight: 300;
}

.nav-title {
  color: $text-main;
  font-size: 36rpx;
  font-weight: 800;
}

.nav-placeholder {
  width: 64rpx;
}

.main-scroll {
  height: calc(100vh - 220rpx);
  padding: 0 28rpx;
}

.form-card {
  margin-top: 20rpx;
  padding: 30rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.04);
}

.section {
  &:not(:first-child) {
    margin-top: 36rpx;
  }
}

.section-label {
  color: $text-main;
  font-size: 28rpx;
  font-weight: 700;
}

.pill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}

.pill {
  padding: 16rpx 24rpx;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 999rpx;
  color: $text-muted;
  font-size: 24rpx;
  background: rgba(255, 255, 255, 0.8);

  &.active {
    border-color: $shendu-red;
    color: #fff;
    background: $shendu-red;
  }
}

.date-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
}

.date-box {
  flex: 1;
  padding: 22rpx 26rpx;
  border-radius: 16rpx;
  color: $text-main;
  font-size: 26rpx;
  text-align: center;
  background: rgba(245, 247, 249, 0.8);
}

.date-split {
  color: $text-muted;
  font-weight: 500;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 40rpx;
  margin-top: 20rpx;
}

.stepper-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 36rpx;
  background: $shendu-red;

  &.minus {
    font-size: 44rpx;
    line-height: 1;
  }
}

.stepper-value {
  min-width: 60rpx;
  text-align: center;
  color: $text-main;
  font-size: 36rpx;
  font-weight: 700;
}

.pref-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 20rpx;
}

.pref {
  padding: 20rpx 12rpx;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12rpx;
  color: $text-muted;
  font-size: 24rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);

  &.active {
    border-color: $shendu-red;
    color: #fff;
    background: $shendu-red;
  }
}

.submit-btn {
  width: 100%;
  margin-top: 36rpx;
  height: 96rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  background: linear-gradient(135deg, $shendu-red, #a8322c);
  box-shadow: 0 12rpx 24rpx rgba(139, 30, 34, 0.25);
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
  background: linear-gradient(135deg, $shendu-red, #a8322c);
}

.bubble-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  font-weight: 600;
}

.bubble-item {
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.85);
  font-size: 24rpx;
  line-height: 1.5;
}

.loading-section {
  margin-top: 24rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
}

.loading-text {
  color: $text-muted;
  font-size: 26rpx;
}

.loading-dots {
  display: flex;
  gap: 8rpx;
  margin-top: 16rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $tang-gold;
  animation: dotPulse 1.4s ease-in-out infinite;

  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
  &:nth-child(4) { animation-delay: 0.6s; }
  &:nth-child(5) { animation-delay: 0.8s; }
}

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.result-section {
  margin-top: 24rpx;
}

.result-summary {
  padding: 28rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
}

.summary-title {
  color: $text-main;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.5;
}

.summary-cost {
  margin-top: 12rpx;
  color: $amber;
  font-size: 26rpx;
  font-weight: 700;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 28rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.input-wrap {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: rgba(245, 247, 249, 0.9);
  display: flex;
  align-items: center;
}

.chat-input {
  flex: 1;
  height: 100%;
  font-size: 26rpx;
  color: $text-main;
}

.send-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $shendu-red;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-icon {
  font-size: 40rpx;
  color: #fff;
  font-weight: 300;
}
</style>
