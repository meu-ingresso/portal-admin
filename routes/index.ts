import Events from './events';
import Reports from './reports';
import LoginPage from '@/pages/LoginPage.vue';
import UserEditPage from '@/pages/user/edit/_id.vue';
import PaymentDetailsPage from '@/pages/payment/details/_id.vue';
import CompletarCadastroPage from '@/pages/user/CompletarCadastro.vue';

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
  {
    path: '/payment/details/:id',
    name: 'PaymentDetails',
    component: PaymentDetailsPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/user/completar-cadastro',
    name: 'CompletarCadastro',
    component: CompletarCadastroPage,
    meta: {
      requiresAuth: true
    }
  },
  ...Events,
  ...Reports,
];
