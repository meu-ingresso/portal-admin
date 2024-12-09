export const TopBar = [
    {
        icon: 'mdi-calendar-multiselect-outline',
        iconActive: 'mdi-calendar-multiselect',
        title: 'Eventos',
        to: '/events',
        needPermissions: false,
    },
    {
        icon: 'mdi-cart-outline',
        iconActive: 'mdi-cart',
        title: 'Vendas',
        to: '/sales',
        needPermissions: true,
    },
    {
        icon: 'mdi-account-outline',
        iconActive: 'mdi-account',
        title: 'Relatórios',
        to: '/reports',
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
        to: '/help-center',
        needPermissions: true,
    },
];
