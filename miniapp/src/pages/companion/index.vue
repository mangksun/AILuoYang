<template>
  <view class="companion-page">
    <!-- 顶部位置提示 -->
    <view class="location-bar">
      <text class="location-text">{{ locationName ? `当前在${locationName}，` : '' }}已为你开启本地智能旅游陪伴</text>
    </view>

    <!-- 预设按钮 -->
    <view class="preset-buttons">
      <view class="preset-btn" @tap="onPresetTap('rest')">
        <text class="preset-icon">😴</text>
        <text class="preset-label">累了，休息吧</text>
      </view>
      <view class="preset-btn" @tap="onPresetTap('food')">
        <text class="preset-icon">🍜</text>
        <text class="preset-label">饿了，快吃饭</text>
      </view>
      <view class="preset-btn" @tap="onPresetTap('shopping')">
        <text class="preset-icon">🛍️</text>
        <text class="preset-label">我想购物了</text>
      </view>
      <view class="preset-btn" @tap="onPresetTap('attraction')">
        <text class="preset-icon">🏛️</text>
        <text class="preset-label">附近景点</text>
      </view>
    </view>

    <!-- 对话区域 -->
    <scroll-view class="chat-area" scroll-y :scroll-into-view="scrollToId" scroll-with-animation>
      <!-- 欢迎消息 -->
      <view class="message-row ai">
        <view class="avatar ai-avatar">灵</view>
        <view class="message-content">
          <text class="message-text">你好！我是洛灵儿，你的AI伴游助手。有什么想了解的，随时问我哦～</text>
        </view>
      </view>

      <!-- 消息列表 -->
      <view
        v-for="(msg, index) in messages"
        :key="index"
        :id="'msg-' + index"
        class="message-row"
        :class="msg.role"
      >
        <view v-if="msg.role === 'ai'" class="avatar ai-avatar">灵</view>
        <view class="message-content" :class="msg.role">
          <text class="message-text">{{ msg.content }}</text>
        </view>
        <view v-if="msg.role === 'user'" class="avatar user-avatar">我</view>
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="message-row ai">
        <view class="avatar ai-avatar">灵</view>
        <view class="message-content">
          <text class="message-text loading-dots">思考中</text>
        </view>
      </view>

      <view id="chat-bottom" style="height: 20rpx;"></view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <input
        v-model="inputText"
        class="chat-input"
        placeholder="输入你想问的..."
        confirm-type="send"
        @confirm="sendMessage"
      />
      <view class="send-btn" :class="{ active: inputText.trim() }" @tap="sendMessage">
        <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { companionChat } from '../../api/companion'

const inputText = ref('')
const loading = ref(false)
const locationName = ref('')
const latitude = ref(0)
const longitude = ref(0)
const scrollToId = ref('')

interface Message {
  role: 'user' | 'ai'
  content: string
}

const messages = ref<Message[]>([])

onMounted(() => {
  getLocation()
})

// 获取位置
const getLocation = () => {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      latitude.value = res.latitude
      longitude.value = res.longitude
      // 使用 wx.request 直接调用高德逆地理编码API（避免SDK bug）
      uni.request({
        url: 'https://restapi.amap.com/v3/geocode/regeo',
        data: {
          key: '171676a3687c77f79c40bb81e17dca9e',
          location: `${res.longitude},${res.latitude}`,
          extensions: 'base',
        },
        success: (geoRes: any) => {
          if (geoRes.data?.status === '1' && geoRes.data?.regeocode) {
            const { district, city } = geoRes.data.regeocode.addressComponent || {}
            locationName.value = district || city || ''
          } else {
            locationName.value = ''
          }
        },
        fail: () => {
          locationName.value = ''
        },
      })
    },
    fail: () => {
      locationName.value = ''
    },
  })
}

// 发送消息
const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  // 添加用户消息
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()

  loading.value = true

  try {
    const chatHistory = messages.value.slice(0, -1).map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    }))

    const res = await companionChat({
      message: text,
      latitude: latitude.value,
      longitude: longitude.value,
      chat_history: chatHistory,
    })

    messages.value.push({ role: 'ai', content: res.reply })
  } catch (e) {
    messages.value.push({ role: 'ai', content: '网络异常，请检查网络后重试。' })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// 点击预设按钮
const onPresetTap = (type: string) => {
  uni.navigateTo({
    url: `/pages/companion/map?type=${type}&lat=${latitude.value}&lng=${longitude.value}`,
  })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    scrollToId.value = ''
    setTimeout(() => {
      scrollToId.value = 'chat-bottom'
    }, 50)
  })
}
</script>

<style scoped>
.companion-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.location-bar {
  background-color: #e8f5e9;
  padding: 16rpx 24rpx;
}

.location-text {
  font-size: 24rpx;
  color: #2e7d32;
}

.preset-buttons {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 16rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border-radius: 16rpx;
  background-color: #f8f8f8;
  width: 150rpx;
}

.preset-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.preset-label {
  font-size: 22rpx;
  color: #333;
  text-align: center;
}

.chat-area {
  flex: 1;
  padding: 20rpx;
}

.message-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.message-row.user {
  justify-content: flex-end;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
  flex-shrink: 0;
}

.ai-avatar {
  background-color: #8B1E22;
  margin-right: 16rpx;
}

.user-avatar {
  background-color: #666;
  margin-left: 16rpx;
}

.message-content {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  word-break: break-all;
}

.message-content.ai {
  background-color: #fff;
  border-top-left-radius: 4rpx;
}

.message-content.user {
  background-color: #8B1E22;
  border-top-right-radius: 4rpx;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.6;
}

.message-content.user .message-text {
  color: #fff;
}

.loading-dots::after {
  content: '...';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

.input-area {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
}

.chat-input {
  flex: 1;
  height: 72rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.send-btn {
  margin-left: 16rpx;
  padding: 16rpx 28rpx;
  background-color: #ccc;
  border-radius: 36rpx;
}

.send-btn.active {
  background-color: #8B1E22;
}

.send-btn text {
  font-size: 28rpx;
  color: #fff;
}
</style>
