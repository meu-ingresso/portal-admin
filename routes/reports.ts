import ReportsPage from '@/pages/reports/ReportsPage.vue';

export default [
  {
    path: '/reports',
    name: 'ReportsOverview',
    component: ReportsPage,
    meta: {
      template: 'overview',
    },
  },
  {
    path: '/reports/sales',
    name: 'ReportsSales',
    component: ReportsPage,
    meta: {
      template: 'sales',
    },
  },
  {
    path: '/reports/tickets',
    name: 'ReportsTickets',
    component: ReportsPage,
    meta: {
      template: 'tickets',
    },
  },
  {
    path: '/reports/attendance',
    name: 'ReportsAttendance',
    component: ReportsPage,
    meta: {
      template: 'attendance',
    },
  },
  {
    path: '/reports/users',
    name: 'ReportsUsers',
    component: ReportsPage,
    meta: {
      template: 'users',
    },
  },
]; 