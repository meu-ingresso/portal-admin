export const monthlyMovementsSideBar = [
  {
    title: 'Movimentação Mensal',
    to: '/monthly-movement',
    needPermissions: false,
  },
  {
    title: 'Vendas Online - Pix',
    to: '/online-sales-pix',
    needPermissions: true,
  },
  {
    title: 'Vendas Online - Cŕedito',
    to: '/online-sales-credit',
    needPermissions: true,
  },
  {
    title: 'Vendas Online - Boleto',
    to: '/online-sales-billet',
    needPermissions: true,
  },
  {
    title: 'Vendas Online PDVs',
    to: '/online-sales-pdvs',
    needPermissions: true,
  },
  {
    icon: 'mdi-cog-outline',
    iconActive: 'mdi-cog',
    title: 'Configurações',
    to: '/settings',
    needPermissions: true,
  },
  {
    icon: 'mdi-card-account-phone-outline',
    iconActive: 'mdi-card-account-phone',
    title: 'Suporte',
    to: '/support',
    needPermissions: true,
  },
  {
    icon: 'mdi-help-circle-outline',
    iconActive: 'mdi-help-circle',
    title: 'Central de Ajuda',
    to: 'https://ajuda.meuingresso.com.br/',
    target: '_blank',
    needPermissions: true,
  },
];
