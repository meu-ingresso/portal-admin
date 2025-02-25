
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { eventGeneralInfo, eventTickets, eventCustomFields, eventCoupons } from '@/utils/store-util';
import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload } from '~/models';
import { Event, ValidationResult } from '~/models/event';

@Module({
  name: 'eventPrincipal',
  stateFactory: true,
  namespaced: true,
})
export default class EventPrincipalModule extends VuexModule {

  private eventData: Event | null = null;
  private eventList: Event[] = [];
  private isLoading: boolean = false;
  private progressTitle: string = '';
  private isSaving: boolean = false;

  // Getters
  public get $event() {
    return this.eventData;
  }

  public get $eventList() {
    return this.eventList;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  public get $progressTitle() {
    return this.progressTitle;
  }

  public get $isSaving() {
    return this.isSaving;
  }

  // Mutations
  @Mutation
  private SET_EVENT(event: Event) {
    this.eventData = event;
  }

  @Mutation
  private SET_EVENT_LIST(events: Event[]) {
    this.eventList = events;
  }

  @Mutation
  private SET_LOADING(value: boolean) {
    this.isLoading = value;
  }

  @Mutation
  private SET_PROGRESS_TITLE(title: string) {
    this.progressTitle = title;
  }

  @Mutation
  private SET_SAVING(value: boolean) {
    this.isSaving = value;
  }


  // Actions - CRUD Operations
  @Action
  public async fetchEvents({
    page = 1,
    limit = 12,
    search,
    sortBy,
    sortDesc,
  }: SearchPayload) {

    try {

      this.context.commit('SET_LOADING', true);

      const preloads = [
        'rating',
        'tickets:status',
        'status',
        'address',
        'category',
        'attachments',
        'coupons',
        'collaborators',
      ];

      const params = new URLSearchParams();

      params.append('page', page.toString());
      params.append('limit', limit.toString());

      // Adiciona ordenação
      sortBy.forEach((field: string, index: number) => {
        const order = sortDesc[index] ? 'desc' : 'asc';
        params.append('orderBy[]', `${field}:${order}`);
      });

      // Adiciona busca
      if (search) {
        params.append('search[name][o]', '_LIKE_');
        params.append('search[name][v]', encodeURIComponent(String(search)));
      }

      // Adiciona preloads
      preloads.forEach((preload) => params.append('preloads[]', preload));

      const response = await $axios.$get(`events?${params.toString()}`);

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Falha ao buscar eventos');
      }

      this.context.commit('SET_EVENT_LIST', response.body.result.data);
      return response.body.result;

    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return {
        data: [],
        total: 0,
        code: 'FIND_NOTFOUND',
      };
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async getById(eventId: string) {
    try {

      this.context.commit('SET_LOADING', true);

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

      const response = await $axios.$get(
        `events?where[id][v]=${eventId}&${preloads
          .map((preload) => `preloads[]=${preload}`)
          .join('&')}`
      );

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Evento não encontrado');
      }

      const event = response.body.result.data[0];
      this.context.commit('SET_EVENT', event);
      return event;

    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async updateEvent(payload) {
    try {

      this.context.commit('SET_SAVING', true);

      const response = await $axios.$patch('event', payload);

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar o evento.');
      }
      return { success: true, data: response.body.result };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    } finally {
      this.context.commit('SET_SAVING', false);
    }
  }

  @Action
  public async deleteEvent(payload) {
    try {

      this.context.commit('SET_SAVING', true);

      const { eventId } = payload;

      const response = await $axios.$delete(`event/${eventId}`);

      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao atualizar o evento.');
      }

      return { success: true, data: response.body.result };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    } finally {
      this.context.commit('SET_SAVING', false);
    }
  }

  @Action
  public async validateAlias(alias: string): Promise<boolean> {
    try {
      this.context.commit('SET_LOADING', true);

      const response = await $axios.$get(`event/validate-alias/${alias}`);

      if (!response.body || response.body.code !== 'VALIDATE_SUCCESS') {
        throw new Error('Falha ao validar alias');
      }

      return response.body.result.isValid;
    } catch (error) {
      console.error('Erro ao validar alias:', error);
      return false;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  // Actions - Event Creation Flow
  @Action
  public async createEvent(): Promise<{ success: boolean; eventId?: string }> {
    try {
      this.context.commit('SET_SAVING', true);

      // 1. Validar todo o evento
      this.context.commit('SET_PROGRESS_TITLE', 'Validando evento...');
      const validation = await this.validateEvent();
      if (!validation.isValid) {
        throw new Error('Evento inválido: ' + validation.errors.join(', '));
      }

      // 2. Criar evento base
      this.context.commit('SET_PROGRESS_TITLE', 'Criando evento...');
      const { eventId } = await eventGeneralInfo.createEventBase();

      if (!eventId) {
        throw new Error('Falha ao criar evento base');
      }

      // 3. Processar banner e link online em paralelo
      this.context.commit('SET_PROGRESS_TITLE', 'Processando mídia e configurações...');
      await Promise.all([
        eventGeneralInfo.handleEventBanner(eventId),
        eventGeneralInfo.handleLinkOnline(eventId)
      ]);

      // 4. Criar ingressos
      this.context.commit('SET_PROGRESS_TITLE', 'Criando ingressos...');
      if (eventTickets.$tickets.length > 0) {
        await eventTickets.createTickets(eventId);
      }

      // 5. Criar campos personalizados
      this.context.commit('SET_PROGRESS_TITLE', 'Configurando campos personalizados...');
      if (eventCustomFields.$customFields.length > 0) {
        await eventCustomFields.createCustomFields(eventId);
      }

      // 6. Criar cupons
      this.context.commit('SET_PROGRESS_TITLE', 'Configurando cupons...');
      if (eventCoupons.$coupons.length > 0) {
        await eventCoupons.createCoupons(eventId);
      }

      // 7. Resetar todos os módulos após sucesso
      this.context.commit('SET_PROGRESS_TITLE', 'Finalizando...');
      this.resetAllModules();

      return { success: true, eventId };

    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    } finally {
      this.context.commit('SET_SAVING', false);
      this.context.commit('SET_PROGRESS_TITLE', '');
    }
  }

  @Action
  public async validateEvent(): Promise<ValidationResult> {

    try {
      const [
        generalInfoValidation,
        ticketsValidation,
        customFieldsValidation,
        couponsValidation
      ] = await Promise.all([
        eventGeneralInfo.validateGeneralInfo(),
        eventTickets.validateTickets(),
        eventCustomFields.validateCustomFields(),
        eventCoupons.validateCoupons()
      ]);

      const errors = [
        ...generalInfoValidation.errors,
        ...ticketsValidation.errors,
        ...customFieldsValidation.errors,
        ...couponsValidation.errors
      ];

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Erro ao validar evento:', error);
      throw error;
    }
  }

  @Action
  private resetAllModules() {
    eventGeneralInfo.reset();
    eventTickets.reset();
    eventCustomFields.reset();
    eventCoupons.reset();
    this.reset();
  }

  @Action
  public reset() {
    this.context.commit('SET_EVENT', null);
    this.context.commit('SET_EVENT_LIST', []);
    this.context.commit('SET_LOADING', false);
    this.context.commit('SET_PROGRESS_TITLE', '');
    this.context.commit('SET_SAVING', false);
  }

  @Action
  private async createEventCheckoutFieldTicketRelations(payload: { fieldTicketMap: Record<string, string[]>, ticketMap: Record<string, string> }) {
    try {
      const relations = Object.entries(payload.fieldTicketMap).flatMap(([ticketName, fieldIds]) => {
        const ticketId = payload.ticketMap[ticketName];
        if (!ticketId) {
          throw new Error(`Ingresso não encontrado: ${ticketName}`);
        }

        return (fieldIds as string[]).map((fieldId) => ({
          fieldId,
          ticketId,
          ticketName,
        }));
      }); 

      await Promise.all(
        relations.map(async ({ fieldId, ticketId, ticketName }) => {
          try {
            await this.createSingleFieldTicketRelation({ fieldId, ticketId } );
          } catch (error) {
            throw new Error(
              `Falha ao criar relação entre campo ${fieldId} e ingresso ${ticketName}: ${error.message}`
            );
          }
        })
      );
    } catch (error) {
      console.error('Erro ao criar relações entre campos e ingressos:', error);
      throw error;
    }
  }

  @Action
  private async createSingleFieldTicketRelation(payload: { fieldId: string, ticketId: string }) {
    const response = await $axios.$post('event-checkout-field-ticket', {
      event_checkout_field_id: payload.fieldId,
      ticket_id: payload.ticketId,
    });

    if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
      throw new Error(`Falha ao vincular campo ${payload.fieldId} ao ingresso ${payload.ticketId}`);
    }

    return response.body.result;
  }

  @Action
  private async createCouponTicketRelations(payload: { couponTicketMap: Record<string, string[]>, ticketMap: Record<string, string> }) {
    try {
      const relationsPromises = [];

      for (const [ticketName, couponIds] of Object.entries(payload.couponTicketMap)) {
        const ticketId = payload.ticketMap[ticketName];

        if (!ticketId) {
          throw new Error(`Ingresso não encontrado: ${ticketName}`);
        }

        (couponIds as any[]).forEach((couponId) => {
          relationsPromises.push(
            $axios.$post('coupon-ticket', {
              coupon_id: couponId,
              ticket_id: ticketId,
            })
          );
        });
      }

      await Promise.all(relationsPromises);
    } catch (error) {
      console.error('Error in createCouponTicketRelations:', error);
      throw new Error('Failed to create coupon-ticket relations.');
    }
  }
}
