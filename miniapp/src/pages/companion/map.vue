<template>
  <view class="map-page">
    <!-- 地图区域 -->
    <view class="map-container">
      <map
        v-if="latitude && longitude"
        class="poi-map"
        :latitude="centerLat"
        :longitude="centerLng"
        :markers="markers"
        :scale="14"
        show-location
      />
    </view>

    <!-- 地点列表 -->
    <view class="poi-list">
      <view class="list-header">
        <text class="list-title">{{ typeLabel }}</text>
        <text class="list-count">共{{ poiList.length }}个地点</text>
      </view>

      <scroll-view class="list-scroll" scroll-y>
        <view
          v-for="poi in poiList"
          :key="poi.id"
          class="poi-card"
          @tap="onPoiTap(poi)"
        >
          <view class="poi-info">
            <text class="poi-name">{{ poi.name }}</text>
            <text class="poi-address">{{ poi.address }}</text>
            <view class="poi-meta">
              <text class="poi-distance">{{ formatDistance(poi.distance) }}</text>
            </view>
          </view>
          <view class="nav-btn" @tap.stop="openNavigation(poi)">
            <text>导航</text>
          </view>
        </view>

        <view v-if="!loading && poiList.length === 0" class="empty-tip">
          <text>暂无附近{{ typeLabel }}数据</text>
        </view>

        <view style="height: 40rpx;"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface POI {
  id: string
  name: string
  address: string
  distance: string
  latitude: number
  longitude: number
  type: string
}

const type = ref('attraction')
const latitude = ref(0)
const longitude = ref(0)
const loading = ref(false)
const poiList = ref<POI[]>([])
const selectedId = ref('')

// 高德POI类型映射
const POI_TYPES: Record<string, string> = {
  attraction: '110000|110100|110200',
  food: '050000|050100|050200',
  rest: '100000|100100',
  shopping: '060000|070000',
}

const typeLabels: Record<string, string> = {
  attraction: '附近景点',
  food: '附近美食',
  rest: '休息场所',
  shopping: '购物场所',
}

const typeLabel = computed(() => typeLabels[type.value] || '附近地点')

const centerLat = computed(() => latitude.value)
const centerLng = computed(() => longitude.value)

// 地图标记点
const markers = computed(() => {
  return poiList.value.map((poi, index) => ({
    id: index,
    latitude: poi.latitude,
    longitude: poi.longitude,
    title: poi.name,
    width: 30,
    height: 30,
    callout: {
      content: poi.name,
      display: selectedId.value === poi.id ? 'ALWAYS' : 'BYCLICK',
      borderRadius: 8,
      padding: 8,
    },
  }))
})

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.$page?.options || currentPage.options || {}

  type.value = options.type || 'attraction'
  latitude.value = parseFloat(options.lat) || 0
  longitude.value = parseFloat(options.lng) || 0

  if (latitude.value && longitude.value) {
    loadPOI()
  } else {
    getLocation()
  }
})

// 获取位置
const getLocation = () => {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      latitude.value = res.latitude
      longitude.value = res.longitude
      loadPOI()
    },
    fail: () => {
      uni.showToast({ title: '获取位置失败', icon: 'none' })
    },
  })
}

// 加载POI数据 - 使用wx.request直接调用高德API
const loadPOI = () => {
  loading.value = true

  uni.request({
    url: 'https://restapi.amap.com/v3/place/around',
    data: {
      key: '171676a3687c77f79c40bb81e17dca9e',
      location: `${longitude.value},${latitude.value}`,
      types: POI_TYPES[type.value] || POI_TYPES.attraction,
      keywords: type.value === 'food' ? '美食' : type.value === 'shopping' ? '购物' : type.value === 'rest' ? '酒店' : '景点',
      radius: 3000,
      offset: 30,
      page: 1,
      extensions: 'base',
    },
    success: (res: any) => {
      if (res.data?.status === '1' && res.data?.pois) {
        poiList.value = res.data.pois.map((poi: any, index: number) => {
          const [lng, lat] = (poi.location || '0,0').split(',').map(Number)
          return {
            id: poi.id || String(index),
            name: poi.name || '',
            address: poi.address || '',
            distance: poi.distance || '',
            latitude: lat,
            longitude: lng,
            type: poi.type || '',
          }
        })
      } else {
        poiList.value = []
      }
      loading.value = false
    },
    fail: () => {
      poiList.value = []
      loading.value = false
      uni.showToast({ title: '获取POI失败', icon: 'none' })
    },
  })
}

// 格式化距离
const formatDistance = (distance: string): string => {
  const d = parseInt(distance)
  if (isNaN(d)) return distance
  if (d >= 1000) {
    return (d / 1000).toFixed(1) + 'km'
  }
  return d + 'm'
}

// 点击POI
const onPoiTap = (poi: POI) => {
  selectedId.value = poi.id
  // 打开导航
  uni.openLocation({
    latitude: poi.latitude,
    longitude: poi.longitude,
    name: poi.name,
    address: poi.address,
    scale: 16,
  })
}

// 点击地图标记
const onMarkerTap = (e: any) => {
  const markerId = e.detail.markerId
  const poi = poiList.value[markerId]
  if (poi) {
    selectedId.value = poi.id
  }
}

// 打开导航
const openNavigation = (poi: POI) => {
  uni.openLocation({
    latitude: poi.latitude,
    longitude: poi.longitude,
    name: poi.name,
    address: poi.address,
    scale: 16,
  })
}
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.map-container {
  width: 100%;
  height: 300px;
  background-color: #f0f0f0;
}

.poi-map {
  width: 100%;
  height: 100%;
}

.poi-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  margin-top: -20rpx;
  position: relative;
  z-index: 1;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.list-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.list-count {
  font-size: 24rpx;
  color: #999;
}

.list-scroll {
  flex: 1;
  padding: 0 20rpx;
}

.poi-card {
  display: flex;
  align-items: center;
  padding: 24rpx 10rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.poi-image {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background-color: #eee;
}

.poi-info {
  flex: 1;
  margin-left: 20rpx;
  overflow: hidden;
}

.poi-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poi-address {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poi-meta {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.poi-distance {
  font-size: 22rpx;
  color: #8B1E22;
  margin-right: 16rpx;
}

.poi-category {
  font-size: 22rpx;
  color: #666;
  background-color: #f5f5f5;
  padding: 2rpx 12rpx;
  border-radius: 4rpx;
}

.poi-desc {
  font-size: 22rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-btn {
  padding: 12rpx 24rpx;
  background-color: #8B1E22;
  border-radius: 24rpx;
  margin-left: 16rpx;
  flex-shrink: 0;
}

.nav-btn text {
  font-size: 24rpx;
  color: #fff;
}

.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
}

.empty-tip text {
  font-size: 28rpx;
  color: #999;
}
</style>
