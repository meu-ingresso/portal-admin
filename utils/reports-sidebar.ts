export const reportsSideBar = [
  {
    icon: 'mdi-view-dashboard-outline',
    iconActive: 'mdi-view-dashboard',
    title: 'Visão Geral',
    to: '/reports',
    template: 'overview',
    needPermissions: false,
  },
  {
    icon: 'mdi-cash-register',
    iconActive: 'mdi-cash-register',
    title: 'Vendas',
    to: '/reports/sales',
    template: 'sales',
    needPermissions: false,
  },
  {
    icon: 'mdi-ticket-outline',
    iconActive: 'mdi-ticket',
    title: 'Ingressos',
    to: '/reports/tickets',
    template: 'tickets',
    needPermissions: false,
  },
  {
    icon: 'mdi-account-group-outline',
    iconActive: 'mdi-account-group',
    title: 'Presença',
    to: '/reports/attendance',
    template: 'attendance',
    needPermissions: false,
  },
]; 