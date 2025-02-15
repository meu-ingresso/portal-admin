export const eventsSideBar = [
  {
    icon: 'mdi-calendar-month-outline',
    iconActive: 'mdi-calendar-month',
    title: 'Painel do Evento',
    to: '/events/:id',
    needPermissions: false,
  },
  {
    icon: 'mdi-ticket-outline',
    iconActive: 'mdi-ticket',
    title: 'Ingressos',
    to: '/events/:id/tickets',
    needPermissions: false,
  },
    {
    icon: 'mdi-ticket-outline',
    iconActive: 'mdi-ticket',
    title: 'Cupons',
    to: '/events/:id/coupons',
    needPermissions: false,
  },
  {
    icon: 'mdi-account-check-outline',
    iconActive: 'mdi-account-check',
    title: 'Check-in',
    to: '/events/:id/checkin',
    needPermissions: false,
  },
  {
    icon: 'mdi-account-group-outline',
    iconActive: 'mdi-account-group',
    title: 'Promoters',
    to: '/events/:id/promoters',
    needPermissions: false,
  },
];
