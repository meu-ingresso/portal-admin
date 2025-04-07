import Events from './events';
import Reports from './reports';
import LoginPage from '@/pages/LoginPage.vue';
import PaymentDetailsPage from '@/pages/payment/details/_orderId.vue';
import MyPage from '@/pages/my-page.vue';
import UserProfilePage from '@/pages/user/profile/_id.vue';

export default [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/my-page',
    name: 'MyPage',
    component: MyPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/user/profile/:id',
    name: 'UserProfile',
    component: UserProfilePage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/payment/details/:orderId',
    name: 'PaymentDetails',
    component: PaymentDetailsPage,
    meta: {
      requiresAuth: true
    }
  },
  ...Events,
  ...Reports,
];
