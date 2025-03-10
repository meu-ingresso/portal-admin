import Events from './events';
import Reports from './reports';
import LoginPage from '@/pages/LoginPage.vue';
import UserEditPage from '@/pages/user/edit/_id.vue';

export default [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/user/edit/:id',
    name: 'UserEdit',
    component: UserEditPage,
    meta: {
      requiresAuth: true
    }
  },
  ...Events,
  ...Reports,
];
