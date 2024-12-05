import Bob from '@/pages/bob/index.vue';
import Create from '@/pages/bob/create.vue';
import Edit from '@/pages/bob/edit.vue';

export default [
  {
    path: '/bobs',
    component: Bob,
    name: 'BOB | Book of Business',
    meta: {
      name: 'list',
      prefix: '/bobs',
      screenName: 'Listagem',
      isEdit: false,
    },
  },
  {
    path: '/bob/create',
    component: Create,
    name: 'Cadastro de BOB',
    meta: {
      name: 'create',
      prefix: '/bobs',
      screenName: 'Cadastro',
      isEdit: false,
    },
  },
  {
    path: '/bob/edit/:id',
    component: Edit,
    name: 'Edição',
    meta: {
      name: 'edit',
      prefix: '/bobs',
      screenName: 'Edição',
      isEdit: true,
    },
  },
];
