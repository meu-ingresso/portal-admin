import Home from '@/pages/home.vue';
import EventsPage from '@/pages/EventsPage.vue';
import EventDetailsPage from '@/pages/EventDetailsPage.vue';

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
      prefix: '/events',
      screenName: 'events',
      isEdit: false,
    },
  },
  {
    path: '/events/:id',
    component: EventDetailsPage,
    name: 'Detalhe de Eventos',
    meta: {
      name: 'eventsDetails',
      prefix: '/events/:id',
      screenName: 'eventsDetails',
      isEdit: false,
    },
  },
];
