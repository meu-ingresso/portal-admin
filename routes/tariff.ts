import Tariff from '@/pages/tariff/index.vue';

export default [
  {
    path: '/tariffs',
    component: Tariff,
    name: 'Tarifários',
    meta: {
      name: 'list',
      prefix: '/tariffs',
      screenName: 'Tarifários',
      isEdit: false,
    },
  },
];
