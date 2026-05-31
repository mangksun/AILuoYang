import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'Odometer' },
      },
      // 票务管理
      {
        path: 'ticket/groups',
        name: 'TicketGroups',
        component: () => import('@/views/ticket/group.vue'),
        meta: { title: '票种分组', icon: 'Folder' },
      },
      {
        path: 'ticket/types',
        name: 'TicketTypes',
        component: () => import('@/views/ticket/type.vue'),
        meta: { title: '票种管理', icon: 'Ticket' },
      },
      {
        path: 'ticket/projects',
        name: 'Projects',
        component: () => import('@/views/ticket/project.vue'),
        meta: { title: '项目管理', icon: 'Location' },
      },
      // 会员卡
      {
        path: 'member/card-types',
        name: 'MemberCardTypes',
        component: () => import('@/views/member/cardType.vue'),
        meta: { title: '会员卡类型', icon: 'CreditCard' },
      },
      {
        path: 'member/cards',
        name: 'MemberCards',
        component: () => import('@/views/member/card.vue'),
        meta: { title: '会员卡管理', icon: 'Postcard' },
      },
      // 订单管理
      {
        path: 'order/list',
        name: 'OrderList',
        component: () => import('@/views/order/list.vue'),
        meta: { title: '订单列表', icon: 'List' },
      },
      {
        path: 'order/refund',
        name: 'OrderRefund',
        component: () => import('@/views/order/refund.vue'),
        meta: { title: '退款管理', icon: 'Money' },
      },
      // 检票管理
      {
        path: 'check/records',
        name: 'CheckRecords',
        component: () => import('@/views/check/record.vue'),
        meta: { title: '检票记录', icon: 'Finished' },
      },
      {
        path: 'check/verifications',
        name: 'Verifications',
        component: () => import('@/views/check/verification.vue'),
        meta: { title: '核销记录', icon: 'CircleCheck' },
      },
      // OTA 对接
      {
        path: 'ota/channels',
        name: 'OtaChannels',
        component: () => import('@/views/ota/channel.vue'),
        meta: { title: 'OTA渠道', icon: 'Connection' },
      },
      {
        path: 'ota/mappings',
        name: 'OtaMappings',
        component: () => import('@/views/ota/mapping.vue'),
        meta: { title: '产品映射', icon: 'Link' },
      },
      {
        path: 'ota/reconciliation',
        name: 'OtaReconciliation',
        component: () => import('@/views/ota/reconciliation.vue'),
        meta: { title: 'OTA对账', icon: 'DataAnalysis' },
      },
      // 财务
      {
        path: 'finance/reconciliation',
        name: 'FinanceReconciliation',
        component: () => import('@/views/finance/reconciliation.vue'),
        meta: { title: '财务对账', icon: 'PieChart' },
      },
      // 系统设置
      {
        path: 'system/users',
        name: 'SystemUsers',
        component: () => import('@/views/system/user.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'system/merchants',
        name: 'Merchants',
        component: () => import('@/views/system/merchant.vue'),
        meta: { title: '商户配置', icon: 'Shop' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.public) {
    next();
  } else if (!token) {
    next('/login');
  } else {
    document.title = `${to.meta.title || '票务管理系统'} - 票务管理系统`;
    next();
  }
});

export default router;
