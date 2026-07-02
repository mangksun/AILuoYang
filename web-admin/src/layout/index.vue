<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo" @click="router.push('/')">
        <el-icon size="24"><Ticket /></el-icon>
        <span v-show="!isCollapse" class="logo-text">票务管理系统</span>
      </div>

      <el-menu
        :default-active="currentRoute"
        :collapse="isCollapse"
        router
        background-color="#001529"
        text-color="#ffffffb3"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>工作台</span>
        </el-menu-item>

        <el-sub-menu index="ticket">
          <template #title>
            <el-icon><Ticket /></el-icon>
            <span>票务管理</span>
          </template>
          <el-menu-item index="/ticket/groups">票种分组</el-menu-item>
          <el-menu-item index="/ticket/types">票种管理</el-menu-item>
          <el-menu-item index="/ticket/projects">项目管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="member">
          <template #title>
            <el-icon><CreditCard /></el-icon>
            <span>会员卡</span>
          </template>
          <el-menu-item index="/member/card-types">会员卡类型</el-menu-item>
          <el-menu-item index="/member/cards">会员卡管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="order">
          <template #title>
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/order/list">订单列表</el-menu-item>
          <el-menu-item index="/order/refund">退款管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="check">
          <template #title>
            <el-icon><Finished /></el-icon>
            <span>检票管理</span>
          </template>
          <el-menu-item index="/check/records">检票记录</el-menu-item>
          <el-menu-item index="/check/verifications">核销记录</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="ota">
          <template #title>
            <el-icon><Connection /></el-icon>
            <span>OTA对接</span>
          </template>
          <el-menu-item index="/ota/channels">OTA渠道</el-menu-item>
          <el-menu-item index="/ota/mappings">产品映射</el-menu-item>
          <el-menu-item index="/ota/reconciliation">OTA对账</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/finance/reconciliation">
          <el-icon><PieChart /></el-icon>
          <span>财务对账</span>
        </el-menu-item>

        <el-menu-item index="/ai/admin">
          <el-icon><Monitor /></el-icon>
          <span>AI 后台</span>
        </el-menu-item>

        <el-sub-menu index="miniapp">
          <template #title>
            <el-icon><ChatDotRound /></el-icon>
            <span>小程序管理</span>
          </template>
          <el-menu-item index="/miniapp/users">小程序用户</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/system/users">用户管理</el-menu-item>
          <el-menu-item index="/system/merchants">商户配置</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const isCollapse = ref(false);
const username = ref(localStorage.getItem('username') || '管理员');

const currentRoute = computed(() => route.path);
const currentTitle = computed(() => route.meta.title as string);

function handleCommand(command: string) {
  if (command === 'logout') {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login');
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 1px solid #ffffff1a;

    .logo-text {
      white-space: nowrap;
    }
  }

  .el-menu {
    border-right: none;
  }
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: #333;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: #333;
    }
  }
}

.layout-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
