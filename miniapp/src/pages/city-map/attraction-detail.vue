<template>
  <view class="page-shell detail-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon" />
      </view>
      <view class="nav-title">{{ attraction?.name || '景点详情' }}</view>
      <view class="nav-actions">
        <view class="action-dot">&#183;&#183;&#183;</view>
        <view class="action-circle" />
      </view>
    </view>

    <view v-if="attraction" class="detail-content">
      <!-- 轮播图 -->
      <swiper class="image-swiper" indicator-dots circular>
        <swiper-item v-for="(img, idx) in attraction.images || []" :key="idx">
          <image class="swiper-img" :src="img" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view class="image-counter">1/{{ (attraction.images || []).length }}</view>

      <!-- 详情Tab -->
      <view class="detail-tabs">
        <view
          v-for="tab in detailTabs"
          :key="tab.key"
          class="detail-tab"
          :class="{ active: currentDetailTab === tab.key }"
          @tap="currentDetailTab = tab.key"
        >
          {{ tab.label }}
        </view>
      </view>

      <!-- 介绍 -->
      <view v-if="currentDetailTab === 'intro'" class="detail-section">
        <view class="section-title">景点介绍</view>
        <view class="section-body">{{ attraction.description }}</view>
      </view>

      <!-- 联系电话 -->
      <view v-if="currentDetailTab === 'phone'" class="detail-section">
        <view class="section-title">联系电话</view>
        <view class="phone-number" @tap="makePhoneCall">{{ attraction.phone }}</view>
      </view>

      <!-- 天气 -->
      <view v-if="currentDetailTab === 'weather'" class="detail-section">
        <view class="section-title">实时天气</view>
        <view v-if="weatherLoading" class="loading-text">加载天气中...</view>
        <view v-else-if="weatherError" class="weather-error-box">
          <view class="loading-text">{{ weatherError }}</view>
          <view class="retry-btn" @tap="loadWeather">重新获取</view>
        </view>
        <view v-else-if="weather" class="weather-list">
          <view class="weather-item today">
            <view class="weather-icon">{{ weatherIconByIcon(weather.current.icon) }}</view>
            <view class="weather-info">
              <view class="weather-temp-main">{{ weather.current.temp }}</view>
              <view class="weather-desc">{{ weather.current.label }}</view>
            </view>
          </view>
          <view class="weather-forecast">
            <view class="forecast-title">未来3天</view>
            <view class="forecast-list">
              <view v-for="(day, idx) in weather.forecast" :key="idx" class="forecast-item">
                <text class="forecast-date">{{ day.label }}</text>
                <text class="forecast-icon">{{ weatherIconByIcon(day.icon) }}</text>
                <text class="forecast-temp">{{ day.temp }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 服务设施 -->
      <view v-if="currentDetailTab === 'facilities'" class="detail-section">
        <view class="section-title">服务设施</view>
        <view class="facility-list">
          <view v-for="f in attraction.facilities || []" :key="f" class="facility-item">
            <text class="facility-check">&#10003;</text>
            <text>{{ f }}</text>
          </view>
        </view>
      </view>

      <!-- 交通信息 -->
      <view v-if="currentDetailTab === 'traffic'" class="detail-section">
        <view class="section-title">交通信息</view>
        <view class="traffic-content">
          <view class="traffic-block">
            <view class="traffic-label">交通概况</view>
            <view class="traffic-text">{{ attraction.traffic?.summary }}</view>
          </view>
          <view v-if="(attraction.traffic?.busRoutes || []).length" class="traffic-block">
            <view class="traffic-label">公交线路</view>
            <view class="traffic-tags">
              <text v-for="route in attraction.traffic.busRoutes" :key="route" class="traffic-tag">{{ route }}</text>
            </view>
          </view>
          <view v-if="(attraction.traffic?.metroStations || []).length" class="traffic-block">
            <view class="traffic-label">地铁站点</view>
            <view class="traffic-tags">
              <text v-for="station in attraction.traffic.metroStations" :key="station" class="traffic-tag metro">{{ station }}</text>
            </view>
          </view>
          <view class="traffic-block">
            <view class="traffic-label">停车信息</view>
            <view class="traffic-text">{{ attraction.traffic?.parking }}</view>
          </view>
        </view>
        <view class="navigate-btn" @tap="openNavigation">
          <text class="navigate-icon">&#9874;</text>
          <text>到这儿去</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getAttractionDetail, getWeather } from '@/api/cityMap';

const detailTabs = [
  { key: 'intro', label: '介绍' },
  { key: 'phone', label: '联系电话' },
  { key: 'weather', label: '天气' },
  { key: 'facilities', label: '服务设施' },
  { key: 'traffic', label: '交通信息' },
];

const currentDetailTab = ref('intro');
const attraction = ref<any>(null);
const weather = ref<any>(null);
const weatherLoading = ref(false);
const weatherError = ref('');

onMounted(() => {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1];
  const id = (current as any).options?.id;
  if (id) {
    loadAttraction(id);
  }
});

async function loadAttraction(id: string) {
  try {
    attraction.value = await getAttractionDetail(id);
  } catch (e: any) {
    uni.showToast({ title: e.message || '加载失败', icon: 'none' });
  }
}

async function loadWeather() {
  if (!attraction.value) return;
  if (weatherLoading.value) return;
  weatherLoading.value = true;
  weatherError.value = '';
  try {
    const lat = Number(attraction.value.latitude);
    const lon = Number(attraction.value.longitude);
    if (!lat || !lon) {
      throw new Error('坐标数据异常');
    }
    weather.value = await getWeather(lat, lon);
  } catch (e: any) {
    const msg = e?.errMsg || e?.message || '';
    const fallback = buildFallbackWeather();
    if (fallback) {
      weather.value = fallback;
      weatherError.value = '天气接口暂不可用，显示参考数据';
    } else if (msg.includes('localhost') || msg.includes('fail')) {
      weatherError.value = '网络连接失败，请确认后端服务已启动';
    } else {
      weatherError.value = msg || '获取天气失败，请稍后再试';
    }
  } finally {
    weatherLoading.value = false;
  }
}

function buildFallbackWeather() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const dayAfter = new Date(today.getTime() + 86400000 * 2);
  const labels = ['今天', '明天', '后天'];
  const dates = [today, tomorrow, dayAfter].map((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  return {
    current: { temp: '--°C', label: '参考数据', icon: 'sun' },
    forecast: dates.slice(0, 3).map((date, idx) => ({
      date,
      label: labels[idx],
      icon: 'cloud',
      temp: '参考温度 --~--°C',
    })),
  };
}

function weatherIconByIcon(icon: string) {
  if (icon === 'sun') return '\u2600';
  if (icon === 'cloud') return '\u2601';
  if (icon === 'rain') return '\u2614';
  if (icon === 'snow') return '\u2744';
  if (icon === 'storm') return '\u26C8';
  return '\u2600';
}

function weatherDesc(code: number) {
  if (code === 0) return '晴朗';
  if (code >= 1 && code <= 3) return '多云';
  if (code >= 45 && code <= 48) return '雾';
  if (code >= 51 && code <= 67) return '下雨';
  if (code >= 71 && code <= 77) return '下雪';
  if (code >= 80 && code <= 82) return '阵雨';
  if (code >= 85 && code <= 86) return '阵雪';
  if (code >= 95 && code <= 99) return '雷暴';
  return '未知';
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.switchTab({ url: '/pages/home/index', fail: () => uni.reLaunch({ url: '/pages/home/index' }) });
  }
}

function makePhoneCall() {
  if (attraction.value?.phone) {
    uni.makePhoneCall({
      phoneNumber: attraction.value.phone,
    });
  }
}

function openNavigation() {
  if (!attraction.value) return;
  const doOpen = () => {
    uni.openLocation({
      latitude: Number(attraction.value.latitude),
      longitude: Number(attraction.value.longitude),
      name: attraction.value.name,
      address: attraction.value.address || '',
      fail: () => {
        uni.showToast({ title: '打开地图失败', icon: 'none' });
      },
    });
  };
  uni.getLocation({
    type: 'gcj02',
    success: () => doOpen(),
    fail: () => {
      uni.showModal({
        title: '提示',
        content: '需要定位权限才能使用导航，是否继续直接打开地图？',
        success: (res) => {
          if (res.confirm) doOpen();
        },
      });
    },
  });
}

watch([currentDetailTab, attraction], ([tab, attr]) => {
  if (tab === 'weather' && attr && !weather.value && !weatherLoading.value) {
    loadWeather();
  }
});

</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.detail-page {
  padding: 0;
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 28rpx;
  padding-top: 40rpx;
}

.back-btn {
  @include pressable;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.back-icon::before {
  content: '\2039';
  font-size: 48rpx;
  font-weight: 300;
  color: $text-main;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 800;
  color: $text-main;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.action-dot {
  font-size: 28rpx;
  color: $text-main;
  letter-spacing: 2rpx;
}

.action-circle {
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid $text-main;
  border-radius: 50%;
}

.detail-content {
  padding: 0 28rpx;
}

/* 轮播图 */
.image-swiper {
  width: 100%;
  height: 420rpx;
  border-radius: 24rpx;
  overflow: hidden;
  margin-top: 10rpx;
}

.swiper-img {
  width: 100%;
  height: 100%;
}

.image-counter {
  position: absolute;
  right: 48rpx;
  top: 480rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 22rpx;
}

/* 详情Tab */
.detail-tabs {
  display: flex;
  gap: 32rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(212, 175, 55, 0.15);
}

.detail-tab {
  padding: 8rpx 0;
  font-size: 28rpx;
  color: $text-muted;
  transition: color 200ms ease;

  &.active {
    color: $text-main;
    font-weight: 700;
  }
}

/* 详情区块 */
.detail-section {
  @include tang-card;
  padding: 28rpx;
  margin-top: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 800;
  color: $text-main;
  margin-bottom: 16rpx;
}

.section-body {
  font-size: 28rpx;
  color: $text-muted;
  line-height: 1.6;
}

.loading-text {
  text-align: center;
  padding: 40rpx;
  color: $text-muted;
  font-size: 28rpx;
}

.weather-error-box {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  align-items: center;
}

.retry-btn {
  padding: 16rpx 48rpx;
  border-radius: 999rpx;
  background: $shendu-red;
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
}

/* 电话 */
.phone-number {
  font-size: 32rpx;
  color: #3b82f6;
  font-weight: 700;
  padding: 16rpx 0;
}

/* 天气 */
.weather-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.weather-item.today {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.6);
}

.weather-icon {
  font-size: 60rpx;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.weather-temp-main {
  font-size: 48rpx;
  font-weight: 800;
  color: $text-main;
}

.weather-desc {
  font-size: 26rpx;
  color: $text-muted;
}

.weather-forecast {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.forecast-title {
  font-size: 26rpx;
  font-weight: 700;
  color: $text-main;
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.forecast-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.4);
}

.forecast-date {
  flex: 1;
  font-size: 26rpx;
  color: $text-main;
}

.forecast-icon {
  font-size: 36rpx;
}

.forecast-temp {
  font-size: 24rpx;
  color: $text-muted;
}

/* 设施 */
.facility-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.5);
  font-size: 26rpx;
  color: $text-main;
}

.facility-check {
  color: #10b981;
  font-weight: 700;
}

/* 交通 */
.traffic-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.traffic-block {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.traffic-label {
  font-size: 26rpx;
  font-weight: 700;
  color: $text-main;
}

.traffic-text {
  font-size: 26rpx;
  color: $text-muted;
  line-height: 1.5;
}

.traffic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.traffic-tag {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #d97706;
  background: rgba(217, 119, 6, 0.1);

  &.metro {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }
}

.navigate-btn {
  @include pressable;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 32rpx;
  padding: 28rpx;
  border-radius: 16rpx;
  background: $shendu-red;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}

.navigate-icon {
  font-size: 32rpx;
}
</style>
