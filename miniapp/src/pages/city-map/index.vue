<template>
  <view class="page-shell city-map-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">&#xe;</text>
      </view>
      <view class="nav-title">城市地图</view>
      <view class="nav-actions">
        <view class="action-dot">&#183;&#183;&#183;</view>
        <view class="action-circle" />
      </view>
    </view>

    <!-- 三大Tab -->
    <view class="main-tabs">
      <view
        v-for="tab in mainTabs"
        :key="tab.key"
        class="main-tab"
        :class="{ active: currentMainTab === tab.key }"
        @tap="switchMainTab(tab.key)"
      >
        <text class="tab-icon">{{ tab.icon }}</text>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 景点内容 -->
    <view v-if="currentMainTab === 'attraction'" class="tab-content">
      <scroll-view class="sub-tabs" scroll-x show-scrollbar="false">
        <view class="sub-tabs-track">
          <view
            v-for="cat in attractionCategories"
            :key="cat.key"
            class="sub-tab"
            :class="{ active: currentAttractionCat === cat.key }"
            @tap="currentAttractionCat = cat.key"
          >
            {{ cat.label }}
          </view>
        </view>
      </scroll-view>
      <scroll-view class="list-scroll" scroll-y>
        <view v-if="attractionsLoading" class="loading-text">加载中...</view>
        <view
          v-for="item in filteredAttractions"
          :key="item.id"
          class="attraction-card"
          @tap="goAttractionDetail(item.id)"
        >
          <image class="card-img" :src="item.images?.[0] || ''" mode="aspectFill" />
          <view class="card-body">
            <view class="card-title-row">
              <text class="card-title">{{ item.name }}</text>
              <text v-if="item.level" class="card-level">{{ item.level }}</text>
            </view>
            <view class="card-tags">
              <text v-for="tag in item.tags || []" :key="tag" class="card-tag">{{ tag }}</text>
            </view>
            <view class="card-desc">{{ (item.description || '').slice(0, 40) }}...</view>
            <view class="card-info-row">
              <text class="card-address">地点 {{ item.address }}</text>
            </view>
            <view class="card-info-row">
              <text class="card-price-label">门票</text>
              <text class="card-price" :class="{ free: item.price === '免费' }">{{ item.price }}</text>
            </view>
          </view>
          <view
            v-if="item.latitude && item.longitude"
            class="nav-btn"
            @tap.stop="openNavigation({ latitude: Number(item.latitude), longitude: Number(item.longitude), name: item.name, address: item.address })"
          >
            <text>导航</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 美食内容 -->
    <view v-if="currentMainTab === 'food'" class="tab-content">
      <scroll-view class="sub-tabs" scroll-x show-scrollbar="false">
        <view class="sub-tabs-track">
          <view
            v-for="cat in foodCategories"
            :key="cat.key"
            class="sub-tab"
            :class="{ active: currentFoodCat === cat.key }"
            @tap="currentFoodCat = cat.key"
          >
            {{ cat.label }}
          </view>
        </view>
      </scroll-view>
      <scroll-view class="list-scroll" scroll-y>
        <view v-if="foodsLoading" class="loading-text">加载中...</view>
        <view
          v-for="item in filteredFoods"
          :key="item.id"
          class="food-card"
          @tap="goFoodDetail(item.id)"
        >
          <image class="card-img" :src="item.images?.[0] || ''" mode="aspectFill" />
          <view class="card-body">
            <view class="card-title-row">
              <text class="card-title">{{ item.name }}</text>
            </view>
            <text class="food-category-tag">{{ getFoodCategoryLabel(item.category) }}</text>
            <view class="food-info">
              <text class="food-info-line">营业时间 {{ item.businessHours }}</text>
              <text class="food-info-line">地点 {{ item.address }}</text>
              <text class="food-info-line">电话 {{ item.phone }}</text>
              <text class="food-info-line">人均 {{ item.averagePrice }}</text>
            </view>
          </view>
          <view class="food-nav-btn" @tap.stop="openNavigation(item)">
            <text>导航</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 非遗内容 -->
    <view v-if="currentMainTab === 'heritage'" class="tab-content">
      <scroll-view class="list-scroll" scroll-y>
        <view v-if="heritagesLoading" class="loading-text">加载中...</view>
        <view
          v-for="item in heritages"
          :key="item.id"
          class="heritage-card"
        >
          <image class="card-img" :src="item.images?.[0] || ''" mode="aspectFill" />
          <view class="card-body">
            <view class="card-title">{{ item.name }}</view>
            <view class="heritage-desc">{{ (item.description || '').slice(0, 50) }}...</view>
            <view class="heritage-address">地点 {{ item.address }}</view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
  getAttractions,
  getFoods,
  getHeritages,
} from '@/api/cityMap';

const mainTabs = [
  { key: 'attraction', label: '景点', icon: '\u{1F3D4}' },
  { key: 'food', label: '美食', icon: '\u{1F372}' },
  { key: 'heritage', label: '非遗', icon: '\u{1F3AD}' },
];

const attractionCategories = [
  { key: 'nature', label: '自然' },
  { key: 'culture', label: '人文' },
  { key: 'park', label: '公园' },
  { key: 'red', label: '红色' },
];

const foodCategories = [
  { key: 'soup', label: '汤类' },
  { key: 'dish', label: '菜品' },
  { key: 'noodle', label: '面食' },
  { key: 'pastry', label: '糕点' },
  { key: 'snack', label: '小吃' },
];

const currentMainTab = ref('attraction');
const currentAttractionCat = ref('nature');
const currentFoodCat = ref('soup');

const attractions = ref<any[]>([]);
const foods = ref<any[]>([]);
const heritages = ref<any[]>([]);
const attractionsLoading = ref(false);
const foodsLoading = ref(false);
const heritagesLoading = ref(false);

function switchMainTab(key: string) {
  currentMainTab.value = key;
}

async function loadAttractions() {
  attractionsLoading.value = true;
  try {
    attractions.value = await getAttractions(currentAttractionCat.value);
  } catch (e: any) {
    uni.showToast({ title: e.message || '加载景点失败', icon: 'none' });
  } finally {
    attractionsLoading.value = false;
  }
}

async function loadFoods() {
  foodsLoading.value = true;
  try {
    foods.value = await getFoods(currentFoodCat.value);
  } catch (e: any) {
    uni.showToast({ title: e.message || '加载美食失败', icon: 'none' });
  } finally {
    foodsLoading.value = false;
  }
}

async function loadHeritages() {
  heritagesLoading.value = true;
  try {
    heritages.value = await getHeritages();
  } catch (e: any) {
    uni.showToast({ title: e.message || '加载非遗失败', icon: 'none' });
  } finally {
    heritagesLoading.value = false;
  }
}

watch(currentAttractionCat, loadAttractions, { immediate: true });
watch(currentFoodCat, loadFoods, { immediate: true });

onMounted(() => {
  loadHeritages();
});

const filteredAttractions = computed(() => attractions.value);
const filteredFoods = computed(() => foods.value);

function getFoodCategoryLabel(key: string) {
  return foodCategories.find((c) => c.key === key)?.label || key;
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.switchTab({ url: '/pages/home/index', fail: () => uni.reLaunch({ url: '/pages/home/index' }) });
  }
}

function goAttractionDetail(id: string) {
  uni.navigateTo({ url: `/pages/city-map/attraction-detail?id=${id}` });
}

function goFoodDetail(id: string) {
  uni.navigateTo({ url: `/pages/city-map/food-detail?id=${id}` });
}

function openNavigation(item: { name: string; address: string; latitude: number; longitude: number }) {
  const doOpen = () => {
    uni.openLocation({
      latitude: item.latitude,
      longitude: item.longitude,
      name: item.name,
      address: item.address,
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
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.city-map-page {
  display: flex;
  flex-direction: column;
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
  font-size: 36rpx;
  color: $text-main;
}

.back-icon::before {
  content: '\2039';
  font-size: 48rpx;
  font-weight: 300;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
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

/* 三大Tab */
.main-tabs {
  display: flex;
  justify-content: center;
  gap: 60rpx;
  padding: 20rpx 28rpx 10rpx;
}

.main-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  opacity: 0.5;
  transition: opacity 200ms ease;

  &.active {
    opacity: 1;
  }
}

.tab-icon {
  font-size: 40rpx;
}

.tab-label {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-main;
}

/* 子分类Tab */
.sub-tabs {
  width: 100%;
  height: 80rpx;
  padding: 0 28rpx;
}

.sub-tabs-track {
  display: flex;
  align-items: center;
  gap: 32rpx;
  height: 100%;
}

.sub-tab {
  flex-shrink: 0;
  padding: 12rpx 0;
  font-size: 28rpx;
  color: $text-muted;
  border-bottom: 4rpx solid transparent;
  transition: all 200ms ease;

  &.active {
    color: $text-main;
    font-weight: 700;
    border-bottom-color: $shendu-red;
  }
}

/* 内容区域 */
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-scroll {
  flex: 1;
  padding: 0 28rpx;
}

.loading-text {
  text-align: center;
  padding: 40rpx;
  color: $text-muted;
  font-size: 28rpx;
}

/* 景点卡片 */
.attraction-card {
  @include pressable;
  @include tang-card;
  display: flex;
  gap: 22rpx;
  padding: 22rpx;
  margin-bottom: 22rpx;
  position: relative;
}

.attraction-card .nav-btn {
  position: absolute;
  right: 22rpx;
  bottom: 22rpx;
  padding: 10rpx 24rpx;
  border-radius: 12rpx;
  background: $shendu-red;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.card-img {
  flex-shrink: 0;
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background: $brick-gray;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 800;
  color: $text-main;
}

.card-level {
  font-size: 24rpx;
  color: #3b82f6;
  font-weight: 700;
}

.card-tags {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.card-tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #d97706;
  background: rgba(217, 119, 6, 0.1);
}

.card-desc {
  font-size: 24rpx;
  color: $text-muted;
  line-height: 1.4;
}

.card-info-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.card-address,
.card-price-label {
  font-size: 22rpx;
  color: $text-muted;
}

.card-price {
  font-size: 24rpx;
  color: $shendu-red;
  font-weight: 700;

  &.free {
    color: #10b981;
  }
}

/* 美食卡片 */
.food-card {
  @include pressable;
  @include tang-card;
  display: flex;
  gap: 22rpx;
  padding: 22rpx;
  margin-bottom: 22rpx;
  position: relative;
}

.food-category-tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #d97706;
  background: rgba(217, 119, 6, 0.1);
  align-self: flex-start;
}

.food-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.food-info-line {
  font-size: 22rpx;
  color: $text-muted;
  line-height: 1.4;
}

.food-nav-btn {
  position: absolute;
  right: 22rpx;
  bottom: 22rpx;
  padding: 10rpx 24rpx;
  border-radius: 12rpx;
  background: #3b82f6;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

/* 非遗卡片 */
.heritage-card {
  @include tang-card;
  display: flex;
  gap: 22rpx;
  padding: 22rpx;
  margin-bottom: 22rpx;
}

.heritage-desc {
  font-size: 24rpx;
  color: $text-muted;
  line-height: 1.4;
}

.heritage-address {
  font-size: 22rpx;
  color: $text-muted;
}
</style>
