export const eventsSideBar = [
  {
    icon: 'mdi-calendar-month-outline',
    iconActive: 'mdi-calendar-month',
    title: 'Painel',
    to: '/events/:id',
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
    icon: 'mdi-home-outline',
    iconActive: 'mdi-home',
    title: 'Colaboradores',
    to: '/events/:id/collaborators',
    needPermissions: false,
  },
  {
    icon: 'mdi-account-group-outline',
    iconActive: 'mdi-account-group',
    title: 'Convidados',
    to: '/events/:id/guestlists',
    needPermissions: false,
  },

  {
    icon: 'mdi-tag-outline',
    iconActive: 'mdi-tag-multiple',
    title: 'Cupons',
    to: '/events/:id/coupons',
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
    icon: 'mdi-cart-outline',
    iconActive: 'mdi-cart',
    title: 'Pedidos',
    to: '/events/:id/orders',
    needPermissions: false,
  },
  {
    icon: 'mdi-store-outline',
    iconActive: 'mdi-store',
    title: 'PDV',
    to: '/events/:id/pdv',
    needPermissions: false,
  },
];
