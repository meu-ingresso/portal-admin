import User from '@/pages/user/index.vue';
import Create from '@/pages/user/create.vue';
import Edit from '@/pages/user/edit.vue';

export default [
  {
    path: '/users',
    component: User,
    name: 'Usuários',
    meta: {
      name: 'users',
      prefix: '/users',
      screenName: 'Usuários',
      isEdit: false,
    },
  },
  {
    path: '/user/create',
    component: Create,
    name: 'Cadastrar Usuário',
    meta: {
      name: 'create',
      prefix: '/users',
      screenName: 'Cadastro',
      isEdit: false,
    },
  },
  {
    path: '/user/edit/:id',
    component: Edit,
    name: 'Edição de Usuário',
    meta: {
      name: 'edit',
      prefix: '/users',
      screenName: 'Edição',
      isEdit: true,
    },
  },
];
