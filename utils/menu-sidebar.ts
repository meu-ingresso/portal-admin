export const sidebar = [
  {
    icon: 'mdi-home-outline',
    iconActive: 'mdi-home',
    title: 'Página Inicial',
    to: '/',
    needPermissions: false,
  },
  {
    icon: 'mdi-briefcase-clock-outline',
    iconActive: 'mdi-briefcase-clock',
    title: 'Booking of Business',
    to: '/bobs',
    needPermissions: true,
  },

  {
    icon: 'mdi-account-multiple-outline',
    iconActive: 'mdi-account-multiple',
    title: 'CRM',
    to: '/crm',
    needPermissions: true,
  },
  {
    icon: 'mdi-lock-outline',
    iconActive: 'mdi-lock',
    title: 'Permissões',
    to: '/permissions',
    needPermissions: true,
  },
  {
    icon: 'mdi-cash-multiple',
    iconActive: 'mdi-cash',
    title: 'Tarifários',
    to: '/tariffs',
    needPermissions: true,
  },

  {
    icon: 'mdi-account-group-outline',
    iconActive: 'mdi-account-group',
    title: 'Usuários',
    to: '/users',
    needPermissions: true,
  },
];
