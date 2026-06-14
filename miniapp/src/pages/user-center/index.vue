<template>
  <view class="page-shell user-page">
    <view class="profile-card">
      <view class="avatar">
        <image v-if="user.user?.avatarUrl" :src="user.user.avatarUrl" mode="aspectFill" />
        <text v-else>洛</text>
      </view>
      <view class="profile-main">
        <view class="nickname">{{ user.user?.nickname || '神都旅人' }}</view>
        <view class="phone">{{ user.user?.phone || '暂未绑定手机号' }}</view>
      </view>
      <button v-if="!user.token" class="login-btn" @tap="login">微信一键登录</button>
    </view>

    <!-- 登录后完善资料 -->
    <view v-if="user.token && showProfileSetup" class="profile-setup tang-card">
      <view class="setup-title">完善个人信息</view>
      <view class="setup-row">
        <text class="setup-label">头像</text>
        <button class="setup-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image v-if="pendingAvatar" :src="pendingAvatar" mode="aspectFill" class="setup-avatar-img" />
          <text v-else class="setup-avatar-text">点击选择</text>
        </button>
      </view>
      <view class="setup-row">
        <text class="setup-label">昵称</text>
        <input
          type="text"
          class="setup-nickname-input"
          placeholder="请输入昵称"
          :value="pendingNickname"
          @input="onNicknameInput"
          @blur="onNicknameBlur"
        />
      </view>
      <view class="setup-actions">
        <button class="setup-confirm gold-button" @tap="confirmProfile">确认</button>
        <view class="setup-skip" @tap="skipProfile">暂时跳过</view>
      </view>
    </view>

    <view v-if="user.token" class="menu-card tang-card">
      <view v-for="item in menus" :key="item" class="menu-item">
        <text>{{ item }}</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view v-if="user.token" class="order-card tang-card">
      <view class="order-head">
        <text>我的订单</text>
        <button @tap="loadOrders">刷新</button>
      </view>
      <view v-if="!ticket.orders.length" class="empty">暂无订单</view>
      <view v-for="order in ticket.orders" :key="order.id" class="order-item">
        <view>
          <view class="order-no">{{ order.orderNo }}</view>
          <view class="order-meta">{{ ticketName(order.ticketTypeId) }} · {{ visitorLabel(order.visitorCategory) }}</view>
          <view class="order-meta">预约 {{ order.visitDate ? order.visitDate.slice(0, 10) : '未选择' }} · {{ order.status }}</view>
        </view>
        <view class="order-price">¥{{ Number(order.payAmount).toFixed(2) }}</view>
      </view>
    </view>

    <button v-if="user.token" class="logout" @tap="logout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTicketStore } from '@/stores/ticket';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
const ticket = useTicketStore();
const menus = ['我的收藏', '我的问题', '我的攻略', '旅记写作', '设置'];

const showProfileSetup = ref(false);
const pendingNickname = ref('');
const pendingAvatar = ref('');

onMounted(() => {
  user.fetchProfile().catch(() => undefined);
  ticket.fetchTickets({ page: 1, pageSize: 100 }).catch(() => undefined);
  loadOrders();
});

async function login() {
  try {
    await user.loginByWeixin();
    await loadOrders();
    if (!user.user?.nickname || !user.user?.avatarUrl) {
      pendingNickname.value = user.user?.nickname || '';
      pendingAvatar.value = user.user?.avatarUrl || '';
      showProfileSetup.value = true;
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' });
  }
}

function onChooseAvatar(e: any) {
  if (e.detail.avatarUrl) {
    pendingAvatar.value = e.detail.avatarUrl;
  }
}

function onNicknameInput(e: any) {
  pendingNickname.value = e.detail.value;
}

function onNicknameBlur(e: any) {
  pendingNickname.value = e.detail.value;
}

async function confirmProfile() {
  try {
    await user.updateProfile({
      nickname: pendingNickname.value || undefined,
      avatarUrl: pendingAvatar.value || undefined,
    });
    showProfileSetup.value = false;
    uni.showToast({ title: '资料已更新', icon: 'success' });
  } catch (error: any) {
    uni.showToast({ title: error.message || '更新失败', icon: 'none' });
  }
}

function skipProfile() {
  showProfileSetup.value = false;
}

async function loadOrders() {
  if (!user.token) return;
  try {
    await ticket.fetchOrders();
  } catch (error: any) {
    uni.showToast({ title: error.message || '订单加载失败', icon: 'none' });
  }
}

function logout() {
  user.logout();
}

function ticketName(ticketTypeId: number) {
  return ticket.tickets.find((item) => item.id === ticketTypeId)?.name || `票种 ${ticketTypeId}`;
}

function visitorLabel(category?: string) {
  const labels: Record<string, string> = {
    adult: '成人票',
    child: '儿童票',
    senior: '老人票',
    student: '学生票',
  };
  return labels[category || 'adult'] || '成人票';
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.user-page {
  min-height: 100vh;
  padding-top: 92rpx;
  background: #ffffff;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 20rpx 4rpx 38rpx;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 116rpx;
  height: 116rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 42rpx;
  font-weight: 900;
  background: linear-gradient(135deg, $shendu-red, $tang-gold);

  image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.profile-main {
  flex: 1;
}

.nickname {
  color: $text-main;
  font-size: 38rpx;
  font-weight: 900;
}

.phone {
  margin-top: 10rpx;
  color: $text-muted;
  font-size: 25rpx;
}

.login-btn {
  padding: 18rpx 30rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 25rpx;
  background: $shendu-red;
}

/* 完善资料 */
.profile-setup {
  padding: 36rpx 28rpx;
  margin-bottom: 24rpx;
}

.setup-title {
  color: $text-main;
  font-size: 32rpx;
  font-weight: 900;
  margin-bottom: 24rpx;
}

.setup-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid rgba(236,231,225,0.6);
}

.setup-label {
  width: 100rpx;
  color: $text-muted;
  font-size: 28rpx;
}

.setup-avatar-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  line-height: 1;
}

.setup-avatar-btn::after {
  border: 0;
}

.setup-avatar-img {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.setup-avatar-text {
  color: $shendu-red;
  font-size: 28rpx;
}

.setup-nickname-input {
  flex: 1;
  text-align: right;
  color: $text-main;
  font-size: 28rpx;
}

.setup-actions {
  margin-top: 32rpx;
}

.setup-confirm {
  width: 100%;
}

.setup-skip {
  margin-top: 20rpx;
  color: $text-muted;
  font-size: 24rpx;
  text-align: center;
}

.menu-card,
.order-card {
  padding: 8rpx 28rpx;
  margin-top: 24rpx;
  background: rgba(255,255,255,0.92);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
  border-bottom: 1px solid rgba(236,231,225,0.8);
  color: $text-main;
  font-size: 28rpx;

  &:last-child {
    border-bottom: 0;
  }
}

.arrow {
  color: #c7bdb4;
  font-size: 42rpx;
}

.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;

  button {
    color: $amber;
    font-size: 24rpx;
  }
}

.empty {
  padding: 26rpx 0 36rpx;
  color: $text-muted;
  font-size: 25rpx;
  text-align: center;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 0;
  border-top: 1px solid rgba(236,231,225,0.8);
}

.order-no {
  color: $text-main;
  font-size: 26rpx;
  font-weight: 800;
}

.order-meta {
  margin-top: 8rpx;
  color: $text-muted;
  font-size: 22rpx;
}

.order-price {
  color: $shendu-red;
  font-size: 28rpx;
  font-weight: 900;
}

.logout {
  width: 100%;
  margin-top: 56rpx;
  color: #9b928c;
  font-size: 28rpx;
  background: transparent;
}
</style>
