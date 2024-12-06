export const defaultTopBar = [
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
        title: 'Usuários do Site',
        to: '/users',
        needPermissions: true,
    },
    {
        icon: 'mdi-account-box-multiple-outline',
        iconActive: 'mdi-account-box-multiple',
        title: 'Organizadores',
        to: '/organizers',
        needPermissions: true,
    },
    {
        icon: 'mdi-account-cash-outline',
        iconActive: 'mdi-account-cash',
        title: 'Transferências',
        to: '/transfers',
        needPermissions: true,
    },
    {
        icon: 'mdi-home-outline',
        iconActive: 'mdi-home',
        title: 'Movimentação Mensal',
        to: '/monthly-movement',
        needPermissions: false,
    },

];
