<template>
  <view class="page-shell itinerary-page">
    <view class="nav-title">AI 行程定制</view>
    <view class="hero-card tang-card">
      <view class="hero-title">让洛灵儿为你排一条盛唐路线</view>
      <view class="hero-desc">选择区县、日期、人数与偏好，后端将生成结构化 day/items 行程。</view>
    </view>

    <view class="form-block tang-card">
      <view class="label">城市区县</view>
      <view class="pill-grid">
        <button v-for="district in districts" :key="district" class="pill" :class="{ active: selectedDistricts.includes(district) }" @tap="toggle(selectedDistricts, district)">
          {{ district }}
        </button>
      </view>

      <view class="label with-top">计划出发时间</view>
      <view class="date-row">
        <picker mode="date" :value="startDate" @change="startDate = String($event.detail.value)">
          <view class="date-box">{{ startDate || '开始日期' }}</view>
        </picker>
        <text class="date-split">至</text>
        <picker mode="date" :value="endDate" @change="endDate = String($event.detail.value)">
          <view class="date-box">{{ endDate || '结束日期' }}</view>
        </picker>
      </view>

      <view class="label with-top">旅游人数</view>
      <view class="stepper">
        <button @tap="peopleCount = Math.max(1, peopleCount - 1)">-</button>
        <text>{{ peopleCount }}</text>
        <button @tap="peopleCount += 1">+</button>
      </view>

      <view class="label with-top">旅游偏好</view>
      <view class="pref-grid">
        <button v-for="pref in preferences" :key="pref" class="pref" :class="{ active: selectedPreferences.includes(pref) }" @tap="toggle(selectedPreferences, pref)">
          {{ pref }}
        </button>
      </view>

      <button class="gold-button submit" :loading="itinerary.loading" @tap="submit">去定制</button>
    </view>

    <view v-if="itinerary.currentPlan" class="result">
      <view class="result-summary tang-card">
        <view class="summary-title">{{ itinerary.currentPlan.summary || '你的专属行程已生成' }}</view>
        <view v-if="itinerary.currentPlan.estimatedCost" class="summary-cost">预估 ¥{{ itinerary.currentPlan.estimatedCost }}</view>
      </view>
      <TimelineCard v-for="day in itinerary.currentPlan.days" :key="day.day" :day="day" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TimelineCard from '@/components/TimelineCard.vue';
import { useItineraryStore } from '@/stores/itinerary';

const itinerary = useItineraryStore();
const districts = ['洛龙区', '老城区', '西工区', '涧西区', '瀍河区', '洛宁县', '栾川县', '嵩县', '宜阳县', '新安县', '孟津区'];
const preferences = ['非遗体验', '历史文化', '人文景点', '购物消费', '自然风光', '运动户外', '拍照摄影', '红色旅游', '科普研学', '民风民俗', '休闲度假'];
const selectedDistricts = ref<string[]>(['洛龙区', '老城区']);
const selectedPreferences = ref<string[]>(['历史文化', '拍照摄影']);
const startDate = ref('');
const endDate = ref('');
const peopleCount = ref(2);

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
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.itinerary-page {
  padding-top: 72rpx;
  padding-bottom: 80rpx;
}

.nav-title {
  color: $shendu-red;
  font-size: 42rpx;
  font-weight: 900;
}

.hero-card {
  margin-top: 26rpx;
  padding: 34rpx;
  background: linear-gradient(135deg, rgba(139,30,34,0.92), rgba(212,175,55,0.52));
}

.hero-title {
  color: #fffaf0;
  font-size: 36rpx;
  font-weight: 900;
}

.hero-desc {
  margin-top: 14rpx;
  color: rgba(255, 250, 240, 0.82);
  font-size: 25rpx;
  line-height: 1.55;
}

.form-block {
  margin-top: 26rpx;
  padding: 30rpx;
}

.label {
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;

  &.with-top {
    margin-top: 36rpx;
  }
}

.pill-grid,
.pref-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}

.pill,
.pref {
  @include pressable;
  padding: 18rpx 24rpx;
  border: 1px solid rgba(212,175,55,0.22);
  border-radius: 999rpx;
  color: #6f5f57;
  font-size: 24rpx;
  background: rgba(255,255,255,0.65);

  &.active {
    border-color: rgba(212,175,55,0.82);
    color: #fffaf0;
    background: linear-gradient(135deg, $shendu-red, #a8322c);
  }
}

.pref {
  width: calc((100% - 32rpx) / 3);
  padding: 20rpx 8rpx;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
}

.date-box {
  min-width: 220rpx;
  padding: 22rpx 26rpx;
  border-radius: 20rpx;
  color: $shendu-red;
  font-size: 26rpx;
  background: rgba(255,255,255,0.72);
}

.date-split {
  color: $tang-gold;
  font-weight: 800;
}

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 34rpx;
  margin-top: 20rpx;
  padding: 12rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,0.72);

  button {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    color: #fff;
    font-size: 34rpx;
    background: $shendu-red;
  }

  text {
    min-width: 44rpx;
    text-align: center;
    color: $text-main;
    font-size: 34rpx;
    font-weight: 900;
  }
}

.submit {
  width: 100%;
  margin-top: 42rpx;
}

.result {
  margin-top: 28rpx;
}

.result-summary {
  padding: 28rpx;
}

.summary-title {
  color: $shendu-red;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.5;
}

.summary-cost {
  margin-top: 12rpx;
  color: $amber;
  font-size: 26rpx;
  font-weight: 800;
}
</style>
