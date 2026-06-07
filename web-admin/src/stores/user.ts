import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi } from '@/api/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const userId = ref(localStorage.getItem('userId') || '');
  const username = ref(localStorage.getItem('username') || '');
  const role = ref(localStorage.getItem('role') || '');

  async function login(usernameInput: string, password: string) {
    const data = await loginApi(usernameInput, password) as any;
    userId.value = String(data.user.id);
    token.value = data.token;
    username.value = data.user.username;
    role.value = data.user.role;

    localStorage.setItem('userId', String(data.user.id));
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);
    localStorage.setItem('role', data.user.role);
  }

  function logout() {
    userId.value = '';
    token.value = '';
    username.value = '';
    role.value = '';
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }

  return { userId, token, username, role, login, logout };
});
