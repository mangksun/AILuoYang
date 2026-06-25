<template>
  <view class="page-shell detail-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon" />
      </view>
      <view class="nav-title">{{ food?.name || '美食详情' }}</view>
      <view class="nav-actions">
        <view class="action-dot">&#183;&#183;&#183;</view>
        <view class="action-circle" />
      </view>
    </view>

    <view v-if="food" class="detail-content">
      <!-- 轮播图 -->
      <swiper class="image-swiper" indicator-dots circular>
        <swiper-item v-for="(img, idx) in food.images || []" :key="idx">
          <image class="swiper-img" :src="img" mode="aspectFill" />
        </swiper-item>
      </swiper>

      <!-- 基本信息 -->
      <view class="info-card tang-card">
        <view class="info-title">{{ food.name }}</view>
        <view class="info-tag">{{ getCategoryLabel(food.category) }}</view>
        <view class="info-desc">{{ food.description }}</view>
      </view>

      <!-- 详细信息 -->
      <view class="info-card tang-card">
        <view class="info-row">
          <text class="info-label">营业时间</text>
          <text class="info-value">{{ food.businessHours }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">地址</text>
          <text class="info-value">{{ food.address }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">电话</text>
          <text class="info-value phone" @tap="makePhoneCall">{{ food.phone }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">人均消费</text>
          <text class="info-value price">{{ food.averagePrice }}</text>
        </view>
      </view>

      <!-- 导航按钮 -->
      <view class="navigate-btn" @tap="openNavigation">
        <text class="navigate-icon">&#9874;</text>
        <text>导航到这儿</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getFoodDetail } from '@/api/cityMap';

const foodCategories = [
  { key: 'soup', label: '汤类' },
  { key: 'dish', label: '菜品' },
  { key: 'noodle', label: '面食' },
  { key: 'pastry', label: '糕点' },
  { key: 'snack', label: '小吃' },
];

const food = ref<any>(null);

onMounted(() => {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1];
  const id = (current as any).options?.id;
  if (id) {
    loadFood(id);
  }
});

async function loadFood(id: string) {
  try {
    food.value = await getFoodDetail(id);
  } catch (e: any) {
    uni.showToast({ title: e.message || '加载失败', icon: 'none' });
  }
}

function goBack() {
  uni.navigateBack();
}

function getCategoryLabel(key: string) {
  return foodCategories.find((c) => c.key === key)?.label || key;
}

function makePhoneCall() {
  if (food.value?.phone) {
    uni.makePhoneCall({
      phoneNumber: food.value.phone,
    });
  }
}

function openNavigation() {
  if (!food.value) return;
  uni.getLocation({
    type: 'gcj02',
    success: () => {
      uni.openLocation({
        latitude: food.value.latitude,
        longitude: food.value.longitude,
        name: food.value.name,
        address: food.value.address,
      });
    },
    fail: () => {
      uni.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' });
    },
  });
}
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

/* 信息卡片 */
.info-card {
  padding: 28rpx;
  margin-top: 24rpx;
}

.info-title {
  font-size: 34rpx;
  font-weight: 800;
  color: $text-main;
}

.info-tag {
  display: inline-block;
  margin-top: 12rpx;
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #d97706;
  background: rgba(217, 119, 6, 0.1);
}

.info-desc {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: $text-muted;
  line-height: 1.6;
}

.info-row {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(212, 175, 55, 0.1);

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  width: 160rpx;
  font-size: 28rpx;
  color: $text-muted;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: $text-main;
  word-break: break-all;

  &.phone {
    color: #3b82f6;
    font-weight: 700;
  }

  &.price {
    color: $shendu-red;
    font-weight: 700;
  }
}

/* 导航按钮 */
.navigate-btn {
  @include pressable;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 32rpx;
  padding: 28rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}

.navigate-icon {
  font-size: 32rpx;
}
</style>
