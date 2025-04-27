import { EVENT_PERMISSIONS, PRODUCER_PERMISSIONS, requirePermissions } from './permissions-config';

export const TopBar = [
  {
    icon: 'mdi-calendar-multiselect-outline',
    iconActive: 'mdi-calendar-multiselect',
    title: 'Eventos',
    to: '/',
    permissions: requirePermissions(EVENT_PERMISSIONS.VIEW),
  },
  {
    icon: 'mdi-home-outline',
    iconActive: 'mdi-home',
    title: 'Minha página',
    to: '/my-page',
    permissions: requirePermissions(PRODUCER_PERMISSIONS.VIEW),
  },
  {
    icon: 'mdi-account-outline',
    iconActive: 'mdi-account',
    title: 'Relatórios',
    to: '/reports',
    permissions: requirePermissions(EVENT_PERMISSIONS.EXPORT),
  },
  {
    icon: 'mdi-help-circle-outline',
    iconActive: 'mdi-help-circle',
    title: 'Central de Ajuda',
    to: 'https://ajuda.meuingresso.com.br/',
    target: '_blank',
    permissions: [],
  },
];
