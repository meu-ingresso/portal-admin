export const TopBar = [
  {
    icon: 'mdi-calendar-multiselect-outline',
    iconActive: 'mdi-calendar-multiselect',
    title: 'Eventos',
    to: '/',
    needPermissions: false,
  },
  {
    icon: 'mdi-home-outline',
    iconActive: 'mdi-home',
    title: 'Minha página',
    to: '/my-page',
    needPermissions: true,
  },
  {
    icon: 'mdi-account-outline',
    iconActive: 'mdi-account',
    title: 'Relatórios',
    to: '/reports',
    needPermissions: true,
  },
  // {
  //     icon: 'mdi-cog-outline',
  //     iconActive: 'mdi-cog',
  //     title: 'Configurações',
  //     to: '/settings',
  //     needPermissions: true,
  // },
  {
    icon: 'mdi-help-circle-outline',
    iconActive: 'mdi-help-circle',
    title: 'Central de Ajuda',
    to: 'https://ajuda.meuingresso.com.br/',
    target: '_blank',
    needPermissions: true,
  },
];
