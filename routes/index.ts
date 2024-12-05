import User from './user';
import Bob from './bob';
import Crm from './crm';
import Permission from './permission';
import Tariff from './tariff';
import HomePage from '~/pages/home.vue';
import Login from '~/pages/login.vue';

export default [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/login',
    component: Login,
  },
  ...Tariff,
  ...User,
  ...Bob,
  ...Permission,
  ...Crm,
];
