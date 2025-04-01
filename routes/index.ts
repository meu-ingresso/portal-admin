import Events from './events';
import Reports from './reports';
import LoginPage from '@/pages/LoginPage.vue';
import PaymentDetailsPage from '@/pages/payment/details/_id.vue';
import MyPage from '@/pages/my-page.vue';
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
    path: '/payment/details/:id',
    name: 'PaymentDetails',
    component: PaymentDetailsPage,
    meta: {
      requiresAuth: true
    }
  },
  ...Events,
  ...Reports,
];
