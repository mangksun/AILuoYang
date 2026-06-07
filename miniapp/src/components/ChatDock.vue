<template>
  <view class="chat-mask" :class="{ expanded }" @tap="collapse" />
  <view class="chat-dock" :class="{ expanded }">
    <view class="sheet-handle" v-if="expanded" />
    <scroll-view v-if="expanded" class="messages" scroll-y="true">
      <view v-for="msg in chat.messages" :key="msg.id" class="message" :class="msg.role">
        <text>{{ msg.content }}</text>
        <view v-if="msg.actions?.length" class="actions">
          <button v-for="(action, index) in msg.actions" :key="index" class="action-btn" @tap="handleAction(action)">
            {{ action.type === 'amap_navigation' ? '开始导航' : action.ticketName || action.projectName || '查看' }}
          </button>
        </view>
      </view>
      <view v-if="chat.loading" class="message assistant"><text>洛灵儿正在思考...</text></view>
    </scroll-view>

    <view class="input-row">
      <button class="warehouse" @tap.stop="toggleWarehouse">智能仓</button>
      <input
        v-model="text"
        class="chat-input"
        confirm-type="send"
        placeholder="问我路线、购票或洛阳玩法"
        @focus="expanded = true"
        @confirm="send"
      />
      <button class="expand" @tap="expanded = !expanded">{{ expanded ? '收起' : '展开' }}</button>
      <button class="send" @tap="send">发送</button>
    </view>

    <view class="warehouse-sheet tang-card" :class="{ open: warehouseOpen }">
      <view class="warehouse-title">智能仓</view>
      <view class="warehouse-grid">
        <button v-for="item in tools" :key="item" class="tool" @tap="selectTool(item)">{{ item }}</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '@/stores/chat';
import type { AiAction } from '@/api/ai';

const chat = useChatStore();
const text = ref('');
const expanded = ref(false);
const warehouseOpen = ref(false);
const tools = ['AI伴游', '行程定制', '便捷购票', '城市地图', '攻略推荐'];

function collapse() {
  expanded.value = false;
  warehouseOpen.value = false;
}

function toggleWarehouse() {
  expanded.value = true;
  warehouseOpen.value = !warehouseOpen.value;
}

async function send() {
  const value = text.value;
  text.value = '';
  expanded.value = true;
  try {
    await chat.send(value);
  } catch (error: any) {
    uni.showToast({ title: error.message || '发送失败', icon: 'none' });
  }
}

function selectTool(item: string) {
  warehouseOpen.value = false;
  if (item === '行程定制') uni.switchTab({ url: '/pages/itinerary/index' });
  else if (item === '便捷购票') uni.switchTab({ url: '/pages/ticket/index' });
  else chat.appendGuide(`我想了解${item}`);
}

function handleAction(action: AiAction) {
  if (action.type === 'amap_navigation' && action.latitude && action.longitude) {
    uni.openLocation({
      latitude: action.latitude,
      longitude: action.longitude,
      name: action.name || '目的地',
      scale: 16,
    });
    return;
  }
  if (action.type === 'show_ticket' && action.ticketTypeId) {
    uni.navigateTo({ url: `/pages/ticket/detail?id=${action.ticketTypeId}&quantity=${action.ticketCount || 1}&date=${action.date || ''}` });
    return;
  }
  if (action.type === 'show_ticket') {
    uni.switchTab({ url: '/pages/ticket/index' });
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.chat-mask {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 20;
  opacity: 0;
  background: rgba(28, 18, 16, 0.42);
  backdrop-filter: blur(0);
  transition: opacity 420ms cubic-bezier(0.25, 1, 0.5, 1), backdrop-filter 420ms cubic-bezier(0.25, 1, 0.5, 1);

  &.expanded {
    pointer-events: auto;
    opacity: 1;
    backdrop-filter: blur(14px);
  }
}

.chat-dock {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 26rpx;
  z-index: 30;
  height: 40vh;
  min-height: 124rpx;
  max-height: 124rpx;
  padding: 16rpx;
  border: 1px solid rgba(212, 175, 55, 0.28);
  border-radius: 40rpx;
  background: rgba(255, 252, 248, 0.86);
  box-shadow: 0 22rpx 60rpx rgba(139, 30, 34, 0.16);
  backdrop-filter: blur(20px);
  transition: max-height 460ms cubic-bezier(0.25, 1, 0.5, 1), border-radius 460ms cubic-bezier(0.25, 1, 0.5, 1);

  &.expanded {
    max-height: 90vh;
    height: 90vh;
    border-radius: 36rpx;
  }
}

.sheet-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 8rpx auto 18rpx;
  border-radius: 999rpx;
  background: rgba(139, 30, 34, 0.2);
}

.messages {
  height: calc(90vh - 170rpx);
  padding: 8rpx 4rpx 20rpx;
}

.message {
  max-width: 78%;
  padding: 20rpx 24rpx;
  margin-bottom: 18rpx;
  border-radius: 26rpx;
  font-size: 26rpx;
  line-height: 1.6;

  &.user {
    margin-left: auto;
    color: #fff;
    background: linear-gradient(135deg, $shendu-red, #a8322c);
  }

  &.assistant {
    color: $text-main;
    background: rgba(250, 248, 245, 0.9);
    border: 1px solid rgba(212, 175, 55, 0.22);
  }
}

.actions {
  margin-top: 14rpx;
}

.action-btn {
  padding: 14rpx 20rpx;
  border-radius: 999rpx;
  color: $shendu-red;
  font-size: 23rpx;
  background: rgba(212, 175, 55, 0.16);
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.warehouse,
.expand,
.send {
  @include pressable;
  height: 76rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 24rpx;
  background: $shendu-red;
}

.warehouse,
.expand {
  color: $shendu-red;
  background: rgba(212, 175, 55, 0.18);
}

.chat-input {
  flex: 1;
  height: 76rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  background: rgba(255, 255, 255, 0.8);
}

.warehouse-sheet {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  bottom: 108rpx;
  padding: 28rpx;
  transform: translateY(28rpx) scale(0.98);
  opacity: 0;
  pointer-events: none;
  transition: all 360ms cubic-bezier(0.25, 1, 0.5, 1);

  &.open {
    transform: translateY(0) scale(1);
    opacity: 1;
    pointer-events: auto;
  }
}

.warehouse-title {
  color: $shendu-red;
  font-size: 30rpx;
  font-weight: 800;
}

.warehouse-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 22rpx;
}

.tool {
  padding: 20rpx 8rpx;
  border-radius: 20rpx;
  color: $text-main;
  font-size: 24rpx;
  background: rgba(255, 255, 255, 0.72);
}
</style>
