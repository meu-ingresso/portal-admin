export const eventsSideBar = [
  {
    icon: 'mdi-calendar-month-outline',
    iconActive: 'mdi-calendar-month',
    title: 'Painel do Evento',
    to: '/event/:id/dashboard',
    needPermissions: false,
  },
  {
    icon: 'mdi-account-check-outline',
    iconActive: 'mdi-account-check',
    title: 'Lineup',
    to: '/event/:id/lineup',
    needPermissions: false,
  },
  {
    icon: 'mdi-ticket-outline',
    iconActive: 'mdi-ticket',
    title: 'Ingressos',
    to: '/event/:id/tickets',
    needPermissions: false,
  },
  {
    icon: 'mdi-account-check-outline',
    iconActive: 'mdi-account-check',
    title: 'Check-in',
    to: '/event/:id/checkin',
    needPermissions: false,
  },
  {
    icon: 'mdi-account-group-outline',
    iconActive: 'mdi-account-group',
    title: 'Promoters',
    to: '/event/:id/promoters',
    needPermissions: false,
  },
  {
    icon: 'mdi-hand-coin-outline',
    iconActive: 'mdi-hand-coin',
    title: 'Promover',
    to: '/event/:id/promote',
    needPermissions: false,
  },
];
