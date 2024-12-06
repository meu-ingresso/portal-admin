import Home from '@/pages/home.vue';
import EventsPage from '@/pages/EventsPage.vue';

export default [
  {
    path: '/',
    component: Home,
    name: 'Eventos',
    meta: {
      name: 'home',
      prefix: '/',
      screenName: 'home',
      isEdit: false,
    },
  },
  {
    path: '/events',
    component: EventsPage,
    name: 'Lista de Eventos',
    meta: {
      name: 'events',
      prefix: '/',
      screenName: 'events',
      isEdit: false,
    },
  },
];
