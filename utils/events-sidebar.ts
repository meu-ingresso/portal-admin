import { requirePermissions, EVENT_PERMISSIONS } from "./permissions-config";

export const eventsSideBar = [
  {
    icon: 'mdi-calendar-month-outline',
    iconActive: 'mdi-calendar-month',
    title: 'Painel',
    to: '/events/:id',
    permissions: requirePermissions(EVENT_PERMISSIONS.VIEW),
  },
  {
    icon: 'mdi-account-check-outline',
    iconActive: 'mdi-account-check',
    title: 'Check-in',
    to: '/events/:id/checkin',
    permissions: requirePermissions(EVENT_PERMISSIONS.MANAGE_CHECKIN),
  },
  {
    icon: 'mdi-home-outline',
    iconActive: 'mdi-home',
    title: 'Colaboradores',
    to: '/events/:id/collaborators',
    permissions: requirePermissions(EVENT_PERMISSIONS.MANAGE_COLLABORATORS),
  },
  {
    icon: 'mdi-account-group-outline',
    iconActive: 'mdi-account-group',
    title: 'Convidados',
    to: '/events/:id/guestlists',
    permissions: requirePermissions(EVENT_PERMISSIONS.MANAGE_GUESTLIST),
  },

  {
    icon: 'mdi-tag-outline',
    iconActive: 'mdi-tag-multiple',
    title: 'Cupons',
    to: '/events/:id/coupons',
    permissions: requirePermissions(EVENT_PERMISSIONS.MANAGE_COUPONS),
  },
  {
    icon: 'mdi-ticket-outline',
    iconActive: 'mdi-ticket',
    title: 'Ingressos',
    to: '/events/:id/tickets',
    permissions: requirePermissions(EVENT_PERMISSIONS.MANAGE_TICKETS),
  },
  {
    icon: 'mdi-cart-outline',
    iconActive: 'mdi-cart',
    title: 'Pedidos',
    to: '/events/:id/orders',
    permissions: requirePermissions(EVENT_PERMISSIONS.VIEW_ORDERS, EVENT_PERMISSIONS.MANAGE_ORDERS_PDV),
  },
  {
    icon: 'mdi-store-outline',
    iconActive: 'mdi-store',
    title: 'PDV',
    to: '/events/:id/pdv',
    permissions: requirePermissions(EVENT_PERMISSIONS.MANAGE_PDV),
  },
];
