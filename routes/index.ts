import Events from './events';
import Reports from './reports';
import LoginPage from '@/pages/LoginPage.vue';

export default [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  ...Events,
  ...Reports,
];
