<template>
  <view class="page-shell home-page">
    <view class="hero">
      <view class="avatar" @tap="goUser">
        <image v-if="user.user?.avatarUrl" :src="user.user.avatarUrl" mode="aspectFill" />
        <text v-else>洛</text>
      </view>
      <view class="title-wrap">
        <view class="title">神都洛阳 AI文旅</view>
        <view class="subtitle">Divine Capital of Luoyang</view>
      </view>
      <view class="palace-shadow">明堂天堂</view>
    </view>

    <view class="ling-card tang-card" @tap="openDigitalGuide">
      <view class="ling-glow" />
      <view class="ling-person">
        <view class="hair" />
        <view class="face">洛</view>
        <view class="dress" />
        <view class="peony">牡丹</view>
      </view>
      <view class="ling-copy">
        <view class="ling-title">唐风数字人</view>
        <view class="ling-name">洛灵儿</view>
        <view class="ling-desc">陪你问路、讲景、买票</view>
      </view>
    </view>

    <view class="bento-grid">
      <view v-for="item in bentoItems" :key="item.title" class="bento-card tang-card" @tap="navigateFeature(item)">
        <view class="bento-icon">{{ item.icon }}</view>
        <view class="bento-title">{{ item.title }}</view>
        <view class="bento-desc">{{ item.desc }}</view>
      </view>
      <view v-for="n in (6 - bentoItems.length)" :key="'empty-' + n" class="bento-card empty-card">
      </view>
    </view>

    <view class="section-title">今日灵感</view>
    <view class="inspire-grid">
      <view v-for="guide in guides" :key="guide" class="guide-chip" @tap="sendGuide(guide)">{{ guide }}</view>
    </view>

    <ChatDock />
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ChatDock from '@/components/ChatDock.vue';
import { useChatStore } from '@/stores/chat';
import { useUserStore } from '@/stores/user';

const chat = useChatStore();
const user = useUserStore();

const tabBarPaths = [
  '/pages/home/index',
  '/pages/itinerary/index',
  '/pages/ticket/index',
  '/pages/user-center/index',
];

const bentoItems = [
  { title: 'AI伴游', desc: '实时定位智能导游', icon: '游', path: '/pages/companion/index' },
  { title: '行程定制', desc: '预算天数生成路线', icon: '程', path: '/pages/itinerary/index' },
  { title: '旅行游记', desc: 'AI 创作专属游记', icon: '记', path: '/pages/travelogue/index' },
  { title: '便捷购票', desc: '真实票种在线下单', icon: '票', path: '/pages/ticket/index' },
  { title: '城市地图', desc: '高德导航唤起', icon: '图', path: '/pages/city-map/index' },
  { title: '攻略推荐', desc: '8 篇精选深度游', icon: '略', path: '/pages/guide/list' },
];

const guides = [
  '帮我安排两天洛阳文化游',
  '我要买龙门石窟门票',
  '带我去适合拍照的地方',
  '白马寺有什么典故？',
];

onMounted(() => {
  user.fetchProfile().catch(() => undefined);
});

function goUser() {
  uni.switchTab({ url: '/pages/user-center/index' });
}

function navigateFeature(item: { title: string; path: string }) {
  if (item.path) {
    if (tabBarPaths.includes(item.path)) {
      uni.switchTab({ url: item.path });
    } else {
      uni.navigateTo({ url: item.path });
    }
    return;
  }
  chat.appendGuide(`我想了解${item.title}`);
}

function openDigitalGuide() {
  uni.navigateTo({ url: '/pages/live2d/index' });
}

function sendGuide(text: string) {
  chat.appendGuide(text);
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.home-page {
  padding-bottom: 220rpx;
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22rpx;
  height: 210rpx;
  padding-top: 58rpx;
  overflow: hidden;
}

.avatar {
  @include pressable;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84rpx;
  height: 84rpx;
  border: 2rpx solid rgba(212, 175, 55, 0.5);
  border-radius: 50%;
  color: #fff;
  font-size: 34rpx;
  font-weight: 900;
  background: linear-gradient(135deg, $shendu-red, $tang-gold);
  box-shadow: 0 12rpx 34rpx rgba(139, 30, 34, 0.18);

  image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.title-wrap {
  z-index: 1;
}

.title {
  color: $shendu-red;
  font-size: 38rpx;
  font-weight: 900;
  letter-spacing: 2rpx;
}

.subtitle {
  margin-top: 8rpx;
  color: rgba(212, 175, 55, 0.95);
  font-size: 20rpx;
  letter-spacing: 3rpx;
  text-transform: uppercase;
}

.palace-shadow {
  position: absolute;
  right: -8rpx;
  bottom: 24rpx;
  color: rgba(212, 175, 55, 0.12);
  font-size: 72rpx;
  font-weight: 900;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22rpx;
  margin-top: 20rpx;
}

.ling-card {
  position: relative;
  width: 100%;
  height: 360rpx;
  margin-top: 20rpx;
  padding: 26rpx;
  overflow: visible;
  background: linear-gradient(145deg, rgba(139, 30, 34, 0.92), rgba(250, 248, 245, 0.72));
}

.ling-glow {
  position: absolute;
  inset: 36rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(226,177,60,0.5), transparent 65%);
  filter: blur(10rpx);
}

.ling-person {
  position: absolute;
  right: -26rpx;
  top: -32rpx;
  width: 190rpx;
  height: 300rpx;
}

.hair {
  width: 112rpx;
  height: 82rpx;
  margin: 0 auto;
  border-radius: 60rpx 60rpx 22rpx 22rpx;
  background: #2d1515;
}

.face {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 94rpx;
  height: 94rpx;
  margin: -22rpx auto 0;
  border-radius: 50%;
  color: $shendu-red;
  font-weight: 900;
  background: #ffe9d6;
}

.dress {
  width: 150rpx;
  height: 170rpx;
  margin: -4rpx auto 0;
  border-radius: 80rpx 80rpx 28rpx 28rpx;
  background: linear-gradient(160deg, #ec4899, $shendu-red 58%, $tang-gold);
}

.peony {
  position: absolute;
  right: 2rpx;
  top: 148rpx;
  padding: 10rpx 12rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 20rpx;
  background: $peony;
}

.ling-copy {
  position: absolute;
  left: 28rpx;
  bottom: 28rpx;
  color: #fffaf0;
}

.ling-title {
  font-size: 24rpx;
  opacity: 0.82;
}

.ling-name {
  margin-top: 6rpx;
  font-size: 44rpx;
  font-weight: 900;
}

.ling-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  opacity: 0.86;
}

.bento-card {
  flex: 0 0 238rpx;
  height: 260rpx;
  padding: 26rpx;
}

.bento-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 22rpx;
  color: #fff;
  font-size: 26rpx;
  font-weight: 900;
  background: linear-gradient(135deg, $shendu-red, $tang-gold);
}

.bento-title {
  margin-top: 32rpx;
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
}

.bento-desc {
  margin-top: 12rpx;
  color: $text-muted;
  font-size: 23rpx;
  line-height: 1.5;
}

.section-title {
  margin: 30rpx 0 18rpx;
  color: $shendu-red;
  font-size: 34rpx;
  font-weight: 900;
}

.inspire-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.guide-chip {
  @include pressable;
  min-height: 112rpx;
  padding: 24rpx;
  border: 1px solid rgba(212, 175, 55, 0.24);
  border-radius: 24rpx;
  color: #4b3631;
  font-size: 25rpx;
  line-height: 1.45;
  background: rgba(255, 255, 255, 0.58);
}
</style>
