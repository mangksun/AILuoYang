<template>
  <view class="page-shell guide-page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">‹</view>
      <view class="nav-title">攻略推荐</view>
      <view class="nav-subtitle">8 篇精选 · 洛阳深度游</view>
    </view>

    <view class="header-card">
      <view class="header-title">千年古都 · 一日千年</view>
      <view class="header-desc">精选 8 篇洛阳深度游玩攻略，涵盖历史文化、山水自然、非遗美食。点击卡片查看详细介绍。</view>
    </view>

    <view class="guide-list">
      <view
        v-for="(item, index) in guides"
        :key="item.id"
        class="guide-card tang-card"
        @tap="openDetail(item)"
      >
        <image class="guide-cover" :src="item.cover" mode="aspectFill" />
        <view class="guide-mask" />
        <view class="guide-rank">TOP {{ String(index + 1).padStart(2, '0') }}</view>
        <view class="guide-body">
          <view class="guide-title">{{ item.title }}</view>
          <view class="guide-subtitle">{{ item.subtitle }}</view>
          <view class="guide-tags">
            <view v-for="tag in item.tags" :key="tag" class="guide-tag">{{ tag }}</view>
          </view>
          <view class="guide-meta">
            <view class="meta-item">⏱ {{ item.duration }}</view>
            <view class="meta-item">🎟 {{ item.price }}</view>
            <view class="meta-item">👥 {{ item.audience }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface GuideItem {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  tags: string[];
  duration: string;
  price: string;
  audience: string;
}

const guides: GuideItem[] = [
  {
    id: 'g1',
    title: '龙门石窟一日深度游',
    subtitle: '世界文化遗产 · 石刻艺术巅峰',
    cover: '/static/imgs/longmen.jpg',
    tags: ['世界遗产', '石刻艺术', '必打卡'],
    duration: '约 4 小时',
    price: '门票 ¥90',
    audience: '历史文化爱好者',
  },
  {
    id: 'g2',
    title: '老君山两日登峰',
    subtitle: '道教名山 · 金顶云海',
    cover: '/static/imgs/laojun.jpg',
    tags: ['道教名山', '自然风光', '云海日出'],
    duration: '2 天 1 夜',
    price: '门票 ¥210',
    audience: '登山摄影爱好者',
  },
  {
    id: 'g3',
    title: '白马寺禅宗寻根',
    subtitle: '中国第一古刹 · 佛教祖庭',
    cover: '/static/imgs/baima.jpg',
    tags: ['佛教祖庭', '历史名刹', '文化打卡'],
    duration: '约 2 小时',
    price: '门票 ¥35',
    audience: '宗教文化爱好者',
  },
  {
    id: 'g4',
    title: '明堂天堂穿越游记',
    subtitle: '盛唐万象神宫 · 沉浸式演艺',
    cover: '/static/imgs/mingtang.jpg',
    tags: ['盛唐文化', '夜游必去', '演艺体验'],
    duration: '约 3 小时',
    price: '门票 ¥120',
    audience: '国风摄影爱好者',
  },
  {
    id: 'g5',
    title: '白云山避暑之旅',
    subtitle: '5A 级景区 · 森林氧吧',
    cover: '/static/imgs/baiyun.jpg',
    tags: ['避暑胜地', '森林氧吧', '亲子出游'],
    duration: '约 8 小时',
    price: '门票 ¥75',
    audience: '亲子 / 家庭游',
  },
  {
    id: 'g6',
    title: '关林庙会深度游',
    subtitle: '三国文化圣地 · 关帝信仰',
    cover: '/static/imgs/guanlin.jpg',
    tags: ['三国文化', '民俗庙会', '祈福打卡'],
    duration: '约 2 小时',
    price: '门票 ¥40',
    audience: '三国文化爱好者',
  },
  {
    id: 'g7',
    title: '洛邑古城汉服日',
    subtitle: '非遗汉服 · 穿越大唐',
    cover: '/static/imgs/luoyi.jpg',
    tags: ['汉服体验', '穿越打卡', '夜游必去'],
    duration: '约 4 小时',
    price: '免费',
    audience: '汉服 / 摄影爱好者',
  },
  {
    id: 'g8',
    title: '洛阳美食探店攻略',
    subtitle: '不翻汤 · 牛肉汤 · 水席',
    cover: '/static/imgs/food.jpg',
    tags: ['特色美食', '地方小吃', '吃货必看'],
    duration: '约 3 小时',
    price: '人均 ¥80',
    audience: '美食爱好者',
  },
];

function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/home/index' }) });
}

function openDetail(item: GuideItem) {
  uni.navigateTo({ url: `/pages/guide/detail?id=${item.id}` });
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.guide-page {
  padding-bottom: 60rpx;
  background: $paper-bg;
  min-height: 100vh;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx 18rpx;
  background: linear-gradient(180deg, $paper-bg 70%, rgba(250, 248, 245, 0));
}

.nav-back {
  position: absolute;
  left: 28rpx;
  top: 64rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: $shendu-red;
  background: rgba(255, 252, 246, 0.9);
  border-radius: 50%;
  box-shadow: 0 4rpx 14rpx rgba(139, 30, 34, 0.12);
}

.nav-title {
  font-size: 38rpx;
  font-weight: 800;
  color: $ink-deep;
  letter-spacing: 4rpx;
}

.nav-subtitle {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $ink-sub;
  letter-spacing: 2rpx;
}

.header-card {
  margin: 24rpx 32rpx 32rpx;
  padding: 36rpx 32rpx;
  background: linear-gradient(135deg, $shendu-red 0%, $gold-main 100%);
  color: #fff8ec;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(139, 30, 34, 0.18);
}

.header-title {
  font-size: 36rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
}

.header-desc {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  opacity: 0.92;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 0 32rpx;
}

.guide-card {
  position: relative;
  overflow: hidden;
  border-radius: 28rpx;
  background: #fffdf7;
  box-shadow: 0 6rpx 24rpx rgba(139, 30, 34, 0.08);
}

.guide-cover {
  width: 100%;
  height: 320rpx;
  display: block;
}

.guide-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 260rpx;
  height: 120rpx;
  background: linear-gradient(180deg, rgba(255, 253, 247, 0) 0%, #fffdf7 95%);
  pointer-events: none;
}

.guide-rank {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  padding: 8rpx 20rpx;
  background: $shendu-red;
  color: #fff8ec;
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  border-radius: 100rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 30, 34, 0.3);
}

.guide-body {
  padding: 20rpx 28rpx 28rpx;
}

.guide-title {
  font-size: 32rpx;
  font-weight: 800;
  color: $ink-deep;
  letter-spacing: 2rpx;
}

.guide-subtitle {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $ink-sub;
}

.guide-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.guide-tag {
  padding: 6rpx 18rpx;
  font-size: 20rpx;
  color: $shendu-red;
  background: rgba(139, 30, 34, 0.08);
  border: 1rpx solid rgba(139, 30, 34, 0.18);
  border-radius: 100rpx;
}

.guide-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  margin-top: 20rpx;
  font-size: 22rpx;
  color: $ink-sub;
}

.meta-item {
  font-size: 22rpx;
}
</style>
