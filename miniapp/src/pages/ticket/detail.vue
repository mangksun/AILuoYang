<template>
  <view class="page-shell detail-page">
    <view class="nav-row">
      <button class="back" @tap="goBack">‹</button>
      <view class="nav-title">门票详情</view>
    </view>

    <view v-if="ticket" class="hero tang-card">
      <view class="tag">{{ ticket.group?.name || '神都精选' }}</view>
      <view class="title">{{ ticket.name }}</view>
      <view class="desc">{{ ticket.description || '洛阳精选文旅票种，适合当日游览与 AI 推荐行程。' }}</view>
      <view class="price-row">
        <text class="price">¥{{ formatMoney(ticket.price) }}</text>
        <text class="stock">库存 {{ stockText }}</text>
      </view>
    </view>

    <view v-if="ticket" class="panel tang-card">
      <view class="section-title">票类</view>
      <view class="segment">
        <button
          v-for="item in visitorCategories"
          :key="item.value"
          :class="{ active: visitorCategory === item.value }"
          @tap="visitorCategory = item.value"
        >
          {{ item.label }}
        </button>
      </view>

      <view class="form-row">
        <text>数量</text>
        <view class="stepper">
          <button @tap="changeQuantity(-1)">-</button>
          <text>{{ quantity }}</text>
          <button @tap="changeQuantity(1)">+</button>
        </view>
      </view>

      <view class="form-row">
        <text>预约日期</text>
        <picker mode="date" :value="visitDate" @change="visitDate = String($event.detail.value)">
          <view class="picker-value">{{ visitDate || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-row">
        <text>联系人</text>
        <input v-model="contactName" placeholder="默认使用微信用户" />
      </view>

      <view class="form-row">
        <text>手机号</text>
        <input v-model="contactPhone" type="number" placeholder="选填" />
      </view>
    </view>

    <view v-if="ticket" class="bottom-bar">
      <view>
        <view class="sum-label">合计</view>
        <view class="sum-price">¥{{ totalPrice }}</view>
      </view>
      <button :disabled="submitting" @tap="submitOrder">{{ submitting ? '提交中' : '立即下单' }}</button>
    </view>

    <view v-if="!ticket && !loading" class="empty tang-card">票种不存在或已下架</view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as ticketApi from '@/api/ticket';
import type { TicketType } from '@/api/ticket';
import { useTicketStore } from '@/stores/ticket';
import { useUserStore } from '@/stores/user';

const ticketStore = useTicketStore();
const user = useUserStore();

const ticket = ref<TicketType | null>(null);
const loading = ref(false);
const submitting = ref(false);
const quantity = ref(1);
const visitDate = ref('');
const visitorCategory = ref<'adult' | 'child' | 'senior' | 'student'>('adult');
const contactName = ref('');
const contactPhone = ref('');

const visitorCategories = [
  { label: '成人票', value: 'adult' },
  { label: '儿童票', value: 'child' },
  { label: '老人票', value: 'senior' },
  { label: '学生票', value: 'student' },
] as const;

const stockText = computed(() => {
  if (!ticket.value?.totalStock) return '充足';
  return Math.max(0, ticket.value.totalStock - (ticket.value.soldStock || 0));
});

const totalPrice = computed(() => (Number(ticket.value?.price || 0) * quantity.value).toFixed(2));

onLoad(async (options) => {
  quantity.value = Math.max(1, Number(options?.quantity) || 1);
  visitDate.value = String(options?.date || '');
  await loadTicket(Number(options?.id));
});

async function loadTicket(id: number) {
  if (!id) return;
  loading.value = true;
  try {
    ticket.value = await ticketApi.getTicket(id);
  } catch (error: any) {
    uni.showToast({ title: error.message || '票种加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function formatMoney(value: string | number) {
  return Number(value || 0).toFixed(2);
}

function changeQuantity(delta: number) {
  const limit = ticket.value?.purchaseLimit || 20;
  quantity.value = Math.min(limit, Math.max(1, quantity.value + delta));
}

async function ensureLogin() {
  if (user.token) return true;
  try {
    await user.loginByWeixin({ nickname: '神都旅人' });
    return true;
  } catch (error: any) {
    uni.showToast({ title: error.message || '请先登录', icon: 'none' });
    return false;
  }
}

async function submitOrder() {
  if (!ticket.value || submitting.value) return;
  if (!visitDate.value) {
    uni.showToast({ title: '请选择预约日期', icon: 'none' });
    return;
  }
  if (!(await ensureLogin())) return;

  submitting.value = true;
  try {
    await ticketStore.createTicketOrder(ticket.value.id, quantity.value, {
      visitDate: visitDate.value,
      visitorCategory: visitorCategory.value,
      contactName: contactName.value || user.user?.nickname || '神都旅人',
      contactPhone: contactPhone.value,
    });
    uni.showToast({ title: '下单成功', icon: 'success' });
    uni.switchTab({ url: '/pages/user-center/index' });
  } catch (error: any) {
    uni.showToast({ title: error.message || '下单失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  uni.navigateBack({ delta: 1, fail: () => uni.switchTab({ url: '/pages/ticket/index' }) });
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.detail-page {
  min-height: 100vh;
  padding-top: 72rpx;
  padding-bottom: 180rpx;
}

.nav-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.back {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  color: $shendu-red;
  font-size: 46rpx;
  background: rgba(212, 175, 55, 0.16);
}

.nav-title {
  color: $shendu-red;
  font-size: 40rpx;
  font-weight: 900;
}

.hero,
.panel {
  padding: 30rpx;
  margin-top: 26rpx;
}

.tag {
  display: inline-flex;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  color: $amber;
  font-size: 23rpx;
  background: rgba(212, 175, 55, 0.14);
}

.title {
  margin-top: 24rpx;
  color: $text-main;
  font-size: 40rpx;
  font-weight: 900;
}

.desc {
  margin-top: 14rpx;
  color: $text-muted;
  font-size: 26rpx;
  line-height: 1.6;
}

.price-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 24rpx;
}

.price {
  color: $shendu-red;
  font-size: 46rpx;
  font-weight: 900;
}

.stock {
  color: $text-muted;
  font-size: 24rpx;
}

.section-title {
  color: $text-main;
  font-size: 30rpx;
  font-weight: 900;
}

.segment {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  margin-top: 18rpx;

  button {
    height: 70rpx;
    border-radius: 18rpx;
    color: $text-main;
    font-size: 24rpx;
    background: rgba(255, 255, 255, 0.78);

    &.active {
      color: #fff;
      background: $shendu-red;
    }
  }
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  border-top: 1px solid rgba(236, 231, 225, 0.82);
  color: $text-main;
  font-size: 28rpx;

  &:first-of-type {
    margin-top: 24rpx;
  }

  input,
  .picker-value {
    width: 360rpx;
    color: $text-main;
    font-size: 26rpx;
    text-align: right;
  }
}

.stepper {
  display: flex;
  align-items: center;
  gap: 24rpx;

  button {
    width: 58rpx;
    height: 58rpx;
    border-radius: 50%;
    color: $shendu-red;
    font-size: 32rpx;
    background: rgba(212, 175, 55, 0.18);
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 28rpx 36rpx;
  background: rgba(255, 252, 248, 0.96);
  box-shadow: 0 -16rpx 48rpx rgba(139, 30, 34, 0.12);
}

.sum-label {
  color: $text-muted;
  font-size: 22rpx;
}

.sum-price {
  color: $shendu-red;
  font-size: 38rpx;
  font-weight: 900;
}

.bottom-bar button {
  width: 320rpx;
  height: 84rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 900;
  background: $shendu-red;
}

.empty {
  padding: 44rpx;
  margin-top: 30rpx;
  color: $text-muted;
  text-align: center;
}
</style>
