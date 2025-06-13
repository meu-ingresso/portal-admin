import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload } from '~/models';
import { formatRealValue } from '~/utils/formatters';
import { handleGetResponse } from '~/utils/responseHelpers';

// Extend SearchPayload interface to include status
interface EventSearchPayload extends SearchPayload {
  status?: string;
  promoterId?: string;
}

interface EventState {
  eventList: any[];
  isLoading: boolean;
  isLoadingAlias: boolean;
  isSaving: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  progressTitle: string;
  paginationMeta: any;
  event: any;
  copyEvent: any;
  defaultFields: any[];
}

const defaultFields = [
  {
    name: 'Nome Completo',
    type: { text: 'Texto', value: 'TEXTO' },
    is_default: true,
    options: [
      { text: 'Obrigatório', value: 'required' },
      { text: 'Visível no ingresso', value: 'visible_on_ticket' },
    ],
    person_types: [
      { text: 'Pessoa Física (PF)', value: 'PF' },
      { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
      { text: 'Estrangeiro', value: 'ESTRANGEIRO' },
    ],
    tickets: [],
  },
  {
    name: 'Email',
    type: { text: 'Email', value: 'EMAIL' },
    is_default: true,
    options: [
      { text: 'Obrigatório', value: 'required' },
      { text: 'Visível na Impressão', value: 'visible_on_ticket' },
    ],
    person_types: [
      { text: 'Pessoa Física (PF)', value: 'PF' },
      { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
      { text: 'Estrangeiro', value: 'ESTRANGEIRO' },
    ],
    tickets: [],
  },
];

const defaultEvent = {
  location_name: '',
  description: '',
  start_date: '',
  end_date: '',
  name: '',
  alias: '',
  event_type: '',
  rating: {
    value: '',
    text: '',
    img: '',
  },
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: '',
    cep: '',
  },
  is_featured: false,
  absorb_service_fee: false,
  tickets: [],
  coupons: [],
  collaborators: [],
  attachments: [],
  customFields: [...defaultFields],
  link_online: '',
  sale_type: 'Ingresso',
  availability: 'Público',
  promoter_id: null,
  status_id: '',
  rating_id: '',
  category_id: '',
  general_information: '',
};

const defaultCopyEvent = {
  location_name: '',
  description: 'teste',
  category_id: '',
  rating_id: '',
  start_date: '',
  end_date: '',
  name: '',
  event_type: '',
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: '',
    cep: '',
  },
};

export const state = (): EventState => ({
  eventList: [],
  isLoading: false,
  isLoadingAlias: false,
  isSaving: false,
  isEditing: false,
  isDeleting: false,
  progressTitle: '',
  paginationMeta: {
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  },
  event: { ...defaultEvent },
  copyEvent: { ...defaultCopyEvent },
  defaultFields,
});

export const getters = {
  $eventList: (state: EventState) => state.eventList || [],
  $paginationMeta: (state: EventState) => state.paginationMeta,
  $event: (state: EventState) => {
    if (!state.event) return null;

    return {
      ...state.event,
      location: state.event.address ? `${state.event.address.street}, ${state.event.address.number} - ${state.event.address.neighborhood}, ${state.event.address.city} - ${state.event.address.state}` : '',
    };
  },
  $isLoading: (state: EventState) => state.isLoading,
  $isLoadingAlias: (state: EventState) => state.isLoadingAlias,
  $isSaving: (state: EventState) => state.isSaving,
  $isEditing: (state: EventState) => state.isEditing,
  $isDeleting: (state: EventState) => state.isDeleting,
  $progressTitle: (state: EventState) => state.progressTitle,
};

export const mutations = {
  SET_EVENT_LIST(state: EventState, data: any) {
    state.eventList = data.map((event: any) => ({
      ...event,
      location: event.address ? `${event.address.street}, ${event.address.number} - ${event.address.neighborhood}, ${event.address.city} - ${event.address.state}` : '',
    }));
  },

  APPEND_TO_EVENT_LIST(state: EventState, data: any) {
    const mappedData = data.map((event: any) => ({
      ...event,
      location: event.address ? `${event.address.street}, ${event.address.number} - ${event.address.neighborhood}, ${event.address.city} - ${event.address.state}` : '',
    }));
    state.eventList = [...state.eventList, ...mappedData];
  },

  SET_EVENT(state: EventState, data: any) {

    if (!data) {
      state.event = { ...defaultEvent };
      state.copyEvent = { ...defaultCopyEvent };
      return;
    }

    const nonDeletedTickets = data.tickets.filter((ticket: any) => !ticket.deleted_at);

    const ticketsTypes = nonDeletedTickets.map((ticket: any) => ticket.name);

    const ticketSales = nonDeletedTickets.filter((ticket: any) => ticket.total_sold > 0);

    state.event = {
      ...data,
      title: data.name,
      statusText: data.status.name,
      date: data.start_date,
      statistics: [
        {
          title: 'Visualizações',
          value: `${
            data.totalizers.totalViews === 0 ? 'Nenhuma' : `${data.totalizers.totalViews}`
          }`,
        },
        { title: 'Visibilidade', value: data.availability },
        {
          title: 'Lista de ingressos',
          value: `${ticketsTypes.length === 0 ? 'Nenhum' : `${ticketsTypes.length}`}`,
        },
        {
          title: 'Cupons de Desconto',
          value: `${data.coupons.length === 0 ? 'Nenhum' : `${data.coupons.length}`}`,
        },
      ],
      sales: [
        { title: 'Ingressos Vendidos', value: ticketSales.length },
        {
          title: 'Vendas',
          value: formatRealValue(data.totalizers.totalSalesAmout),
        },
      ],
      collaborators: data.collaborators.length,
      tickets: nonDeletedTickets.map((ticket: any) => ({
        ...ticket,
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        total: ticket.total_quantity,
        status: ticket.status.name,
        hasSales: ticket.total_sold > 0,
        eventPromoter: data.promoter_id,
      })),
    };

    state.copyEvent = {
      ...state.event,
    };
  },

  UPDATE_EVENT_TICKETS(state: EventState, tickets: any[]) {
    if (state.event) {
      state.event = {
        ...state.event,
        tickets: tickets.map((ticket) => ({
          ...ticket,
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          total: ticket.total_quantity,
          status: ticket.status.name,
          hasSales: ticket.total_sold > 0,
          eventPromoter: state.event.promoter_id,
        })),
        statistics: state.event.statistics.map((stat: any) => {
          if (stat.title === 'Lista de ingressos') {
            return {
              ...stat,
              value: `${tickets.length === 0 ? 'Nenhum' : `${tickets.length}`}`,
            };
          }
          return stat;
        }),
        sales: state.event.sales.map((sale: any) => {
          if (sale.title === 'Ingressos Vendidos') {
            return {
              ...sale,
              value: tickets.filter((t) => t.hasSales).length,
            };
          }
          return sale;
        }),
      };
    }
  },

  SET_IS_LOADING(state: EventState, value: boolean) {
    state.isLoading = value;
  },

  SET_IS_LOADING_ALIAS(state: EventState, value: boolean) {
    state.isLoadingAlias = value;
  },

  SET_IS_SAVING(state: EventState, value: boolean) {
    state.isSaving = value;
  },

  SET_IS_EDITING(state: EventState, value: boolean) {
    state.isEditing = value;
  },

  SET_IS_DELETING(state: EventState, value: boolean) {
    state.isDeleting = value;
  },

  SET_PROGRESS_TITLE(state: EventState, value: string) {
    state.progressTitle = value;
  },

  SET_PAGINATION_META(state: EventState, meta: any) {
    state.paginationMeta = meta || {
      current_page: 1,
      last_page: 1,
      per_page: 12,
      total: 0
    };
  },

  RESET(state: EventState) {
    state.event = {
      id: undefined,
      location_name: '',
      description: '',
      category_id: '',
      rating_id: '',
      start_date: '',
      end_date: '',
      name: '',
      event_type: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
        cep: '',
      },
      availability: '',
      sale_type: '',
      promoter_id: '',
      is_featured: false,
      absorb_service_fee: false,
    };
    state.copyEvent = { ...state.event };
  },
};

export const actions = {
  setLoading({ commit }: any, value: boolean) {
    commit('SET_IS_LOADING', value);
  },

  setEditing({ commit }: any, value: boolean) {
    commit('SET_IS_EDITING', value);
  },

  setDeleting({ commit }: any, value: boolean) {
    commit('SET_IS_DELETING', value);
  },

  setProgressTitle({ commit }: any, value: string) {
    commit('SET_PROGRESS_TITLE', value);
  },

  setSaving({ commit }: any, value: boolean) {
    commit('SET_IS_SAVING', value);
  },

  setLoadingAlias({ commit }: any, value: boolean) {
    commit('SET_IS_LOADING_ALIAS', value);
  },

  setEvent({ commit }: any, data: any) {
    commit('SET_EVENT', data);
  },

  async fetchEvents({ commit, dispatch }: any, {
    page = 1,
    limit = 12,
    search,
    sortBy,
    sortDesc,
    status,
    append = false,
    filterDeleted = false,
    promoterId,
  }: EventSearchPayload & { append?: boolean, filterDeleted?: boolean, promoterId?: string }) {
    dispatch('setLoading', true);

    const preloads = [
      'rating',
      'tickets:status',
      'status',
      'address',
      'category',
      'attachments',
      'coupons',
      'collaborators:role',
      'groups'
    ];

    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    sortBy.forEach((field: string, index: number) => {
      const order = sortDesc[index] ? 'desc' : 'asc';
      params.append('orderBy[]', `${field}:${order}`);
    });

    if (search) {
      params.append('search[name][o]', '_LIKE_');
      params.append('search[name][v]', encodeURIComponent(String(search)));
    }

    if (status && status !== 'Todos') {
      params.append('whereHas[status][name]', status);
    }

    if (promoterId) {
      params.append('where[promoter_id][v]', promoterId);
    }

    preloads.forEach((preload) => params.append('preloads[]', preload));

    const response = await $axios.$get(`events?${params.toString()}`);

    const { data: events, meta } = handleGetResponse(response, 'Eventos não encontrados', null, filterDeleted);

    dispatch('setLoading', false);
    
    if (append) {
      commit('APPEND_TO_EVENT_LIST', events);
    } else {
      commit('SET_EVENT_LIST', events);
    }
    
    commit('SET_PAGINATION_META', meta);

    return { events, meta };
  },

  async getById({ commit, dispatch }: any, eventId: string) {
    dispatch('setLoading', true);

    const preloads = [
      'rating',
      'tickets:status',
      'status',
      'address',
      'category',
      'attachments',
      'collaborators',
      'coupons',
    ];

    return await $axios
      .$get(
        `events?where[id][v]=${eventId}&${preloads
          .map((preload) => `preloads[]=${preload}`)
          .join('&')}`
      )
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        dispatch('setLoading', false);

        commit('SET_EVENT', response.body.result.data[0]);
        return response;
      })
      .catch(() => {
        dispatch('setLoading', false);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  },

  async validateAlias({ dispatch }: any, alias: string) {
    dispatch('setLoadingAlias', true);

    return await $axios
      .$get(`event/validate-alias/${alias}`)
      .then((response) => {
        if (response.body && response.body.code !== 'VALIDATE_SUCCESS')
          throw new Error(response);

        dispatch('setLoadingAlias', false);

        return response.body.result;
      })
      .catch(() => {
        dispatch('setLoadingAlias', false);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  },

  async fetchEventStatuses(_: any, payload: any) {
    try {
      const { status } = payload;

      const response = await $axios.$get(
        `statuses?where[name][v]=${status}&where[module][v]=event`,
        payload
      );

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Falha ao buscar lista de status de eventos.');
      }

      return { success: true, data: response.body.result.data[0] };
    } catch (error) {
      console.error('Error fetching event statuses:', error);
      throw error;
    }
  },

  async updateEvent(_: any, payload: any[]) {
    try {
      const response = await $axios.$patch('event', {
        data: payload
      });

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar o evento.');
      }
      return { success: true, data: response.body.result };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  async deleteEvent({ dispatch }: any, payload: any) {
    try {
      const { eventId } = payload;

      // Buscar status de exclusão diretamente
      const statusResponse = await $axios.$get(`statuses?where[module][v]=event&where[name][v]=Excluído`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Status de exclusão não encontrado.');
      }

      const deleteStatus = statusResponse.body.result.data[0];

      const updateEventStatus = await dispatch('updateEvent', [
        { id: eventId, status_id: deleteStatus.id },
      ]);

      if (!updateEventStatus.success) {
        throw new Error('Falha ao atualizar o status do evento.');
      }

      const response = await $axios.$delete(`event/${eventId}`);

      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao atualizar o evento.');
      }

      return { success: true, data: response.body.result };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  reset({ commit }: any) {
    commit('RESET');
  },

  async fetchEventTickets({ commit, state }: any, eventId: string) {
    try {
      const response = await $axios.$get(
        `tickets?where[event_id][v]=${eventId}&preloads[]=status`
      );

      const result = handleGetResponse(
        response,
        'Falha ao buscar ingressos do evento.',
        eventId,
        true
      );

      const tickets = result.data.map((ticket: any) => ({
        ...ticket,
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        total: ticket.total_quantity,
        status: ticket.status,
        hasSales: ticket.total_sold > 0,
        eventPromoter: state.event.promoter_id,
      }));

      // Atualiza os tickets no evento atual
      commit('UPDATE_EVENT_TICKETS', tickets);

      return tickets;
    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      throw error;
    } finally {
      commit('SET_IS_LOADING', false);
    }
  },

  async fetchEventsByPromoterId(_: any, payload: { promoterId: string, limit?: number, preloads?: string[] }) {
    try {
      const preloads = payload.preloads?.map((preload) => `preloads[]=${preload}`).join('&') || '';

      const response = await $axios.$get(`events?where[promoter_id][v]=${payload.promoterId}&${preloads}&limit=${payload.limit || 9999}`);

      const events = handleGetResponse(response, 'Falha ao buscar eventos do promotor.', null, true);

      return events.data;

    } catch (error) {
      console.error('Erro ao buscar status de eventos:', error);
      throw error;
    }
  },

  async updatePromoterEventsFromStatusToStatus({ dispatch }: any, payload: { userId: string, fromStatus: string, toStatus: string }) {
    try {
      const response = await $axios.$get(`events?preloads[]=status&where[promoter_id][v]=${payload.userId}&whereHas[status][name]=${payload.fromStatus}&limit=9999`);

      const events = handleGetResponse(response, `Falha ao buscar eventos do promotor com status ${payload.fromStatus}.`, null, true);

      if (!events.data.length) {
        return;
      }

      // Buscar status diretamente
      const statusResponse = await $axios.$get(`statuses?where[module][v]=event&where[name][v]=${payload.toStatus}`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error(`Status ${payload.toStatus} não encontrado.`);
      }

      const updateStatus = statusResponse.body.result.data[0];

      const eventsToUpdate = events.data.map((event: any) => ({
        id: event.id,
        status_id: updateStatus.id,
      }));

      const updateEvents = await dispatch('updateEvent', eventsToUpdate);

      if (!updateEvents.success) {
        throw new Error(`Falha ao atualizar o status dos eventos para ${payload.toStatus}.`);
      }

      return { success: true, data: updateEvents.data };

    } catch (error) {
      console.error(`Erro ao buscar eventos do promotor ${payload.userId} com status ${payload.fromStatus}:`, error);
      throw error;
    }
  },
};
