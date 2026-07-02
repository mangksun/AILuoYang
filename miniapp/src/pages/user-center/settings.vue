<template>
  <view class="page-shell settings-page">
    <view class="nav-row">
      <button class="back" @tap="goBack">‹</button>
      <view class="nav-title">设置</view>
    </view>

    <!-- 头像 -->
    <view class="section tang-card">
      <view class="row" @tap="chooseAvatar">
        <text class="label">头像</text>
        <view class="row-right">
          <image v-if="form.avatarUrl" :src="form.avatarUrl" mode="aspectFill" class="avatar-preview" />
          <text v-else class="placeholder">未设置</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="row">
        <text class="label">昵称</text>
        <input
          class="input"
          type="nickname"
          placeholder="请输入昵称"
          :value="form.nickname"
          @input="form.nickname = $event.detail.value"
        />
      </view>

      <!-- 手机号 -->
      <view class="row">
        <text class="label">手机号</text>
        <input
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          :value="form.phone"
          @input="form.phone = $event.detail.value"
        />
      </view>
    </view>

    <!-- 账号信息 -->
    <view class="section-title">账号信息</view>
    <view class="section tang-card">
      <view class="row">
        <text class="label">用户ID</text>
        <text class="value">{{ user.user?.id || '-' }}</text>
      </view>
      <view class="row">
        <text class="label">角色</text>
        <text class="value">{{ user.user?.role === 'staff' ? '工作人员' : '普通用户' }}</text>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="actions">
      <button class="gold-button" :disabled="saving" @tap="saveProfile">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';
import { uploadFile } from '@/api/request';

const user = useUserStore();
const saving = ref(false);

const form = reactive({
  nickname: '',
  avatarUrl: '',
  phone: '',
});

onLoad(() => {
  if (user.user) {
    form.nickname = user.user.nickname || '';
    form.avatarUrl = user.user.avatarUrl || '';
    form.phone = user.user.phone || '';
  }
});

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths[0];
      uni.showLoading({ title: '上传中...' });
      try {
        const result = await uploadFile(filePath, 'avatars');
        form.avatarUrl = result.url;
        uni.showToast({ title: '头像已更新', icon: 'success' });
      } catch (error: any) {
        uni.showToast({ title: error.message || '上传失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
  });
}

async function saveProfile() {
  if (saving.value) return;
  saving.value = true;
  try {
    await user.updateProfile({
      nickname: form.nickname || undefined,
      avatarUrl: form.avatarUrl || undefined,
      phone: form.phone || undefined,
    });
    uni.showToast({ title: '保存成功', icon: 'success' });
  } catch (error: any) {
    uni.showToast({ title: error.message || '保存失败', icon: 'none' });
  } finally {
    saving.value = false;
  }
}

function goBack() {
  uni.navigateBack({
    delta: 1,
    fail: () => uni.switchTab({ url: '/pages/user-center/index' }),
  });
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.settings-page {
  min-height: 100vh;
  padding-top: 72rpx;
  padding-bottom: 40rpx;
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

.section-title {
  margin-top: 32rpx;
  padding: 0 8rpx;
  color: $text-muted;
  font-size: 24rpx;
}

.section {
  margin-top: 16rpx;
  padding: 0 28rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  border-bottom: 1px solid rgba(236, 231, 225, 0.6);

  &:last-child {
    border-bottom: none;
  }
}

.label {
  color: $text-main;
  font-size: 28rpx;
  flex-shrink: 0;
  width: 140rpx;
}

.value {
  color: $text-muted;
  font-size: 26rpx;
}

.input {
  flex: 1;
  text-align: right;
  color: $text-main;
  font-size: 28rpx;
}

.placeholder {
  color: $text-muted;
  font-size: 26rpx;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.avatar-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.arrow {
  color: #c7bdb4;
  font-size: 36rpx;
}

.actions {
  padding: 48rpx 28rpx 0;
}
</style>
