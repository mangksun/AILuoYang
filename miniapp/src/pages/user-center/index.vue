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
      <button v-if="!user.token" class="login-btn" @tap="login">登录</button>
    </view>

    <view class="menu-card tang-card">
      <view v-for="item in menus" :key="item" class="menu-item">
        <text>{{ item }}</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="order-card tang-card">
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
import { onMounted } from 'vue';
import { useTicketStore } from '@/stores/ticket';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
const ticket = useTicketStore();
const menus = ['我的收藏', '我的问题', '我的攻略', '旅记写作', '设置'];

onMounted(() => {
  user.fetchProfile().catch(() => undefined);
  ticket.fetchTickets({ page: 1, pageSize: 100 }).catch(() => undefined);
  loadOrders();
});

async function login() {
  try {
    await user.loginByWeixin();
    await loadOrders();
  } catch (error: any) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' });
  }
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
