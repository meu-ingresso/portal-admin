import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { status } from '@/utils/store-util';
import { SearchPayload } from '~/models';
import { formatRealValue } from '~/utils/formatters';
import { handleGetResponse } from '~/utils/responseHelpers';

// Extend SearchPayload interface to include status
interface EventSearchPayload extends SearchPayload {
  status?: string;
  promoterId?: string;
}

@Module({
  name: 'event',
  stateFactory: true,
  namespaced: true,
})
export default class Event extends VuexModule {
  private eventList = [];
  private isLoading: boolean = false;
  private isLoadingAlias: boolean = false;
  private isSaving: boolean = false;
  private isEditing: boolean = false;
  private isDeleting: boolean = false;
  private progressTitle: string = '';
  private paginationMeta: any = {
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  };

  public get $eventList() {
    return this.eventList || [];
  }

  public get $paginationMeta() {
    return this.paginationMeta;
  }

  private defaultFields = [
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

  private event: any = {
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
    customFields: [...this.defaultFields],
    link_online: '',
    sale_type: 'Ingresso',
    availability: 'Público',
    promoter_id: null,
    status_id: '',
    rating_id: '',
    category_id: '',
    general_information: '',
  };

  private copyEvent: any = {
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

  public get $event() {
    if (!this.event) return null;

    return {
      ...this.event,
      location: this.event.address ? `${this.event.address.street}, ${this.event.address.number} - ${this.event.address.neighborhood}, ${this.event.address.city} - ${this.event.address.state}` : '',
    };
  }

  public get $isLoading() {
    return this.isLoading;
  }

  public get $isLoadingAlias() {
    return this.isLoadingAlias;
  }

  public get $isSaving() {
    return this.isSaving;
  }

  public get $isEditing() {
    return this.isEditing;
  }

  public get $isDeleting() {
    return this.isDeleting;
  }

  public get $progressTitle() {
    return this.progressTitle;
  }

  @Mutation
  private SET_EVENT_LIST(data: any) {
    this.eventList = data.map((event: any) => ({
      ...event,
      location: event.address ? `${event.address.street}, ${event.address.number} - ${event.address.neighborhood}, ${event.address.city} - ${event.address.state}` : '',
    }));
  }

  @Mutation
  private APPEND_TO_EVENT_LIST(data: any) {
    const mappedData = data.map((event: any) => ({
      ...event,
      location: event.address ? `${event.address.street}, ${event.address.number} - ${event.address.neighborhood}, ${event.address.city} - ${event.address.state}` : '',
    }));
    this.eventList = [...this.eventList, ...mappedData];
  }

  @Mutation
  private SET_EVENT(data: any) {
    const nonDeletedTickets = data.tickets.filter((ticket) => !ticket.deleted_at);

    const ticketsTypes = nonDeletedTickets.map((ticket) => ticket.name);

    const ticketSales = nonDeletedTickets.filter((ticket) => ticket.total_sold > 0);

    this.event = {
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
      tickets: nonDeletedTickets.map((ticket) => ({
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

    this.copyEvent = {
      ...this.event,
    };
  }

  @Mutation
  private UPDATE_EVENT_TICKETS(tickets: any[]) {
    if (this.event) {
      this.event = {
        ...this.event,
        tickets: tickets.map((ticket) => ({
          ...ticket,
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          total: ticket.total_quantity,
          status: ticket.status.name,
          hasSales: ticket.total_sold > 0,
          eventPromoter: this.event.promoter_id,
        })),
        statistics: this.event.statistics.map((stat) => {
          if (stat.title === 'Lista de ingressos') {
            return {
              ...stat,
              value: `${tickets.length === 0 ? 'Nenhum' : `${tickets.length}`}`,
            };
          }
          return stat;
        }),
        sales: this.event.sales.map((sale) => {
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
  }

  @Mutation
  private SET_IS_LOADING(value: boolean) {
    this.isLoading = value;
  }

  @Mutation
  private SET_IS_LOADING_ALIAS(value: boolean) {
    this.isLoadingAlias = value;
  }

  @Mutation
  private SET_IS_SAVING(value: boolean) {
    this.isSaving = value;
  }

  @Mutation
  private SET_IS_EDITING(value: boolean) {
    this.isEditing = value;
  }

  @Mutation
  private SET_IS_DELETING(value: boolean) {
    this.isDeleting = value;
  }

  @Mutation
  private SET_PROGRESS_TITLE(value: string) {
    this.progressTitle = value;
  }

  @Mutation
  private SET_PAGINATION_META(meta: any) {
    this.paginationMeta = meta || {
      current_page: 1,
      last_page: 1,
      per_page: 12,
      total: 0
    };
  }

  @Action
  public setLoading(value: boolean) {
    this.context.commit('SET_IS_LOADING', value);
  }

  @Action
  public setEditing(value: boolean) {
    this.isEditing = value;
  }

  @Action
  public setDeleting(value: boolean) {
    this.isDeleting = value;
  }

  @Action
  public setProgressTitle(value: string) {
    this.context.commit('SET_PROGRESS_TITLE', value);
  }

  @Action
  public setSaving(value: boolean) {
    this.context.commit('SET_IS_SAVING', value);
  }

  @Action
  public setLoadingAlias(value: boolean) {
    this.context.commit('SET_IS_LOADING_ALIAS', value);
  }

  @Mutation
  private RESET() {
    this.event = {
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
    this.copyEvent = { ...this.event };
  }

  @Action
  public setEvent(data: any) {
    this.context.commit('SET_EVENT', data);
  }

  @Action
  public async fetchEvents({
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
    this.setLoading(true);

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

    this.setLoading(false);
    
    if (append) {
      this.context.commit('APPEND_TO_EVENT_LIST', events);
    } else {
      this.context.commit('SET_EVENT_LIST', events);
    }
    
    this.context.commit('SET_PAGINATION_META', meta);

    return { events, meta };
  }

  @Action
  public async getById(eventId: string) {
    this.setLoading(true);

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

        this.setLoading(false);

        this.context.commit('SET_EVENT', response.body.result.data[0]);
        return response;
      })
      .catch(() => {
        this.setLoading(false);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async validateAlias(alias: string) {
    this.setLoadingAlias(true);

    return await $axios
      .$get(`event/validate-alias/${alias}`)
      .then((response) => {
        if (response.body && response.body.code !== 'VALIDATE_SUCCESS')
          throw new Error(response);

        this.setLoadingAlias(false);

        return response.body.result;
      })
      .catch(() => {
        this.setLoadingAlias(false);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async fetchEventStatuses(payload) {
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
  }

  @Action
  public async updateEvent(payload: any[]) {
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
  }

  @Action
  public async deleteEvent(payload) {
    try {
      const { eventId } = payload;

      const deleteStatus = await status.fetchStatusByModuleAndName({ module: 'event', name: 'Excluído' });

      if (!deleteStatus) {
        throw new Error('Status de exclusão não encontrado.');
      }

      const updateEventStatus = await this.updateEvent([
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
  }

  @Action
  public reset() {
    this.context.commit('RESET');
  }

  @Action
  public async fetchEventTickets(eventId: string) {
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
        eventPromoter: this.event.promoter_id,
      }));

      // Atualiza os tickets no evento atual
      this.context.commit('UPDATE_EVENT_TICKETS', tickets);

      return tickets;
    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      throw error;
    } finally {
      this.context.commit('SET_IS_LOADING', false);
    }
  }

  @Action
  public async fetchEventsByPromoterId(payload: { promoterId: string, limit?: number, preloads?: string[] }) {
    try {


      const preloads = payload.preloads?.map((preload) => `preloads[]=${preload}`).join('&') || '';

      const response = await $axios.$get(`events?where[promoter_id][v]=${payload.promoterId}&${preloads}&limit=${payload.limit || 9999}`);

      const events = handleGetResponse(response, 'Falha ao buscar eventos do promotor.', null, true);

      return events.data;

    } catch (error) {
      console.error('Erro ao buscar status de eventos:', error);
      throw error;
    }
  }


  @Action
  public async updatePromoterEventsFromStatusToStatus(payload: { userId: string, fromStatus: string, toStatus: string }) {

    try {
      const response = await $axios.$get(`events?preloads[]=status&where[promoter_id][v]=${payload.userId}&whereHas[status][name]=${payload.fromStatus}&limit=9999`);

      const events = handleGetResponse(response, `Falha ao buscar eventos do promotor com status ${payload.fromStatus}.`, null, true);

      if (!events.data.length) {
        return;
      }

      const updateStatus = await status.fetchStatusByModuleAndName({ module: 'event', name: payload.toStatus });

      if (!updateStatus) {
        throw new Error(`Status ${payload.toStatus} não encontrado.`);
      }

      const eventsToUpdate = events.data.map((event: any) => ({
        id: event.id,
        status_id: updateStatus.id,
      }));

      const updateEvents = await this.updateEvent(eventsToUpdate);

      if (!updateEvents.success) {
        throw new Error(`Falha ao atualizar o status dos eventos para ${payload.toStatus}.`);
      }

      return { success: true, data: updateEvents.data };

    } catch (error) {
      console.error(`Erro ao buscar eventos do promotor ${payload.userId} com status ${payload.fromStatus}:`, error);
      throw error;
    }
  }
}
