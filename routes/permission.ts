import Permission from '@/pages/permission/index.vue';

export default [
  {
    path: '/permissions',
    component: Permission,
    name: 'Permissões',
    meta: {
      name: 'list',
      prefix: '/permissions',
      screenName: 'Permissões',
      isEdit: false,
    },
  },
];
