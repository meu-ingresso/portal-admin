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
      },
      {
        path: 'coupons',
        name: 'eventsDetailsCoupons',
        meta: {
          name: 'eventsDetails',
          template: 'coupons',
        },
      },
      {
        path: 'checkin',
        name: 'eventsDetailsCheckin',
        meta: {
          name: 'eventsDetails',
          template: 'checkin',
        },
      },
      {
        path: 'orders',
        name: 'eventsDetailsOrders',
        meta: {
          name: 'eventsDetails',
          template: 'orders',
        },
      },
      {
        path: 'guestlists',
        name: 'eventsDetailsGuestlists',
        meta: {
          name: 'eventsDetails',
          template: 'guestlists',
          view: 'lists',
        },
      },
      {
        path: 'guestlists/:listId',
        name: 'eventsDetailsGuestlistsMembers',
        meta: {
          name: 'eventsDetails',
          template: 'guestlists',
          view: 'members',
        },
      },
      {
        path: 'collaborators',
        name: 'eventsDetailsCollaborators',
        meta: {
          name: 'eventsDetails',
          template: 'collaborators',
        },
      },
      {
        path: 'pdv',
        name: 'eventsDetailsPdv',
        meta: {
          name: 'eventsDetails',
          template: 'pdv',
        },
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
