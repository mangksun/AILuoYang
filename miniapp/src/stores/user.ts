import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as userApi from '@/api/user';
import type { MiniappUser } from '@/api/user';

export const useUserStore = defineStore('miniappUser', () => {
  const token = ref<string>(uni.getStorageSync('token') || '');
  const user = ref<MiniappUser | null>(uni.getStorageSync('user') || null);

  function clearAuth() {
    token.value = '';
    user.value = null;
    uni.removeStorageSync('token');
    uni.removeStorageSync('user');
  }

  uni.$on('auth:expired', clearAuth);

  async function loginByWeixin(profile?: { nickname?: string; avatarUrl?: string }) {
    const loginResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject });
    });

    const data = await userApi.login({
      code: loginResult.code,
      nickname: profile?.nickname,
      avatarUrl: profile?.avatarUrl,
    });

    token.value = data.token;
    user.value = data.user;
    uni.setStorageSync('token', data.token);
    uni.setStorageSync('user', data.user);
    return data;
  }

  async function fetchProfile() {
    if (!token.value) return null;
    try {
      user.value = await userApi.getProfile();
      uni.setStorageSync('user', user.value);
      return user.value;
    } catch {
      clearAuth();
      return null;
    }
  }

  async function updateProfile(data: { nickname?: string; avatarUrl?: string }) {
    user.value = await userApi.updateProfile(data);
    uni.setStorageSync('user', user.value);
    return user.value;
  }

  function logout() {
    clearAuth();
    uni.showToast({ title: '已退出登录', icon: 'none' });
  }

  return { token, user, loginByWeixin, fetchProfile, updateProfile, logout };
});
