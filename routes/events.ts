import Home from '@/pages/home.vue';
import EventsPage from '~/pages/events/EventsPage.vue';
import EventDetailsPage from '~/pages/events/EventDetailsPage.vue';

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
      prefix: 'eventsDetails',
      screenName: 'eventsDetails',
      isEdit: false,
    },
  },
  {
    path: '/events/:id/tickets',
    component: EventDetailsPage,
    name: 'Ingressos do Eventos',
    meta: {
      name: 'eventsDetailsTickets',
      prefix: 'eventsDetailsTickets',
      screenName: 'eventsDetailsTickets',
      isEdit: false,
    },
  },
];
