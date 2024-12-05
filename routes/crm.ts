import Crm from '@/pages/crm/index.vue';

export default [
  {
    path: '/crm',
    component: Crm,
    name: 'CRM',
    meta: {
      name: 'list',
      prefix: '/crm',
      screenName: 'Listagem',
      isEdit: false,
    },
  },
];
