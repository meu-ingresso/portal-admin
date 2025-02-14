import Home from '@/pages/home.vue';
import EventsPage from '~/pages/events/EventsPage.vue';
import EventDetailsPage from '~/pages/events/EventDetailsPage.vue';
import CreateEventPage from '~/pages/events/CreateEventPage.vue';
import EventEditPage from '~/pages/events/EventEditPage.vue';

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
    path: '/events/create',
    component: CreateEventPage,
    name: 'Criação de Eventos',
    meta: {
      name: 'createEvent',
      prefix: '/events/create',
      screenName: 'createEvent',
      isEdit: false,
    },
  },
  {
    path: '/events/:id',
    component: EventDetailsPage,
    name: 'Detalhe de Eventos',
    meta: {
      name: 'eventsDetails',
      template: 'panel',
    },
    children: [
      {
        path: '',
        name: 'eventsDetails',
        meta: {
          name: 'eventsDetails',
          template: 'panel',
        },
      },
      {
        path: 'details',
        name: 'eventsDetailsInfo',
        meta: {
          name: 'eventsDetails',
          template: 'details',
        },
      },
      {
        path: 'tickets',
        name: 'eventsDetailsTickets',
        meta: {
          name: 'eventsDetails',
          template: 'tickets',
        },
        children: [
          {
            path: 'tickets/edit/:id',
            name: 'eventsDetailsTicketsEdit',
            meta: {
              name: 'eventsDetails',
              template: 'ticketEdit',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/events/:id/edit',
    component: EventEditPage,
    name: 'Editar Evento',
    meta: {
      name: 'eventEdit',
      template: 'panel',
    },
  },
];
