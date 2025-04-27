import EventsPage from '~/pages/events/EventsPage.vue';
import EventDetailsPage from '~/pages/events/EventDetailsPage.vue';
import CreateEventPage from '~/pages/events/CreateEventPage.vue';
import EventEditPage from '~/pages/events/EventEditPage.vue';
import { EVENT_PERMISSIONS, requirePermissions } from '~/utils/permissions-config';

export default [
  {
    path: '/',
    component: EventsPage,
    name: 'Lista de Eventos',
    meta: {
      name: 'Home',
      prefix: '/',
      screenName: 'home',
      isEdit: false,
      permissions: requirePermissions(EVENT_PERMISSIONS.VIEW),
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
      permissions: requirePermissions(EVENT_PERMISSIONS.CREATE),
    },
  },
  {
    path: '/events/:id',
    component: EventDetailsPage,
    name: 'Detalhe de Eventos',
    meta: {
      name: 'eventsDetails',
      template: 'panel',
      permissions: requirePermissions(EVENT_PERMISSIONS.VIEW),
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
          permissions: requirePermissions(EVENT_PERMISSIONS.VIEW_TICKETS),
        },
      },
      {
        path: 'coupons',
        name: 'eventsDetailsCoupons',
        meta: {
          name: 'eventsDetails',
          template: 'coupons',
          permissions: requirePermissions(EVENT_PERMISSIONS.VIEW_COUPONS),
        },
      },
      {
        path: 'checkin',
        name: 'eventsDetailsCheckin',
        meta: {
          name: 'eventsDetails',
          template: 'checkin',
          permissions: requirePermissions(EVENT_PERMISSIONS.VIEW_CHECKIN),
        },
      },
      {
        path: 'orders',
        name: 'eventsDetailsOrders',
        meta: {
          name: 'eventsDetails',
          template: 'orders',
          permissions: requirePermissions(EVENT_PERMISSIONS.VIEW_ORDERS),
        },
      },
      {
        path: 'guestlists',
        name: 'eventsDetailsGuestlists',
        meta: {
          name: 'eventsDetails',
          template: 'guestlists',
          view: 'lists',
          permissions: requirePermissions(EVENT_PERMISSIONS.VIEW_GUESTLIST),
        },
      },
      {
        path: 'guestlists/:listId',
        name: 'eventsDetailsGuestlistsMembers',
        meta: {
          name: 'eventsDetails',
          template: 'guestlists',
          view: 'members',
          permissions: requirePermissions(EVENT_PERMISSIONS.VIEW_GUESTLIST),
        },
      },
      {
        path: 'collaborators',
        name: 'eventsDetailsCollaborators',
        meta: {
          name: 'eventsDetails',
          template: 'collaborators',
          permissions: requirePermissions(EVENT_PERMISSIONS.VIEW_COLLABORATORS),
        },
      },
      {
        path: 'pdv',
        name: 'eventsDetailsPdv',
        meta: {
          name: 'eventsDetails',
          template: 'pdv',
          permissions: requirePermissions(EVENT_PERMISSIONS.VIEW_PDV),
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
      isEdit: true,
      permissions: requirePermissions(EVENT_PERMISSIONS.EDIT),
    },
  },
];
