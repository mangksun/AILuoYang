import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi } from '@/api/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');
  const role = ref(localStorage.getItem('role') || '');

  async function login(usernameInput: string, password: string) {
    const data = await loginApi(usernameInput, password) as any;
    token.value = data.token;
    username.value = data.user.username;
    role.value = data.user.role;

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);
    localStorage.setItem('role', data.user.role);
  }

  function logout() {
    token.value = '';
    username.value = '';
    role.value = '';
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }

  return { token, username, role, login, logout };
});
