import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload } from '~/models';
import { Event, ValidationResult } from '~/models/event';

interface EventPrincipalState {
  eventData: Event | null;
  eventList: Event[];
  isLoading: boolean;
  progressTitle: string;
  isSaving: boolean;
}

export const state = (): EventPrincipalState => ({
  eventData: null,
  eventList: [],
  isLoading: false,
  progressTitle: '',
  isSaving: false,
});

export const getters = {
  $event: (state: EventPrincipalState) => state.eventData,
  $eventList: (state: EventPrincipalState) => state.eventList,
  $isLoading: (state: EventPrincipalState) => state.isLoading,
  $progressTitle: (state: EventPrincipalState) => state.progressTitle,
  $isSaving: (state: EventPrincipalState) => state.isSaving,
};

export const mutations = {
  SET_EVENT(state: EventPrincipalState, event: Event) {
    state.eventData = event;
  },

  SET_EVENT_LIST(state: EventPrincipalState, events: Event[]) {
    state.eventList = events;
  },

  SET_LOADING(state: EventPrincipalState, value: boolean) {
    state.isLoading = value;
  },

  SET_PROGRESS_TITLE(state: EventPrincipalState, title: string) {
    state.progressTitle = title;
  },

  SET_SAVING(state: EventPrincipalState, value: boolean) {
    state.isSaving = value;
  },
};

export const actions = {
  async fetchEvents({ commit }: any, {
    page = 1,
    limit = 12,
    search,
    sortBy,
    sortDesc,
  }: SearchPayload) {
    try {
      commit('SET_LOADING', true);

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

      commit('SET_EVENT_LIST', response.body.result.data);
      return response.body.result;

    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return {
        data: [],
        total: 0,
        code: 'FIND_NOTFOUND',
      };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getById({ commit }: any, eventId: string) {
    try {
      commit('SET_LOADING', true);

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
      commit('SET_EVENT', event);
      return event;

    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateEvent({ commit }: any, payload: any) {
    try {
      commit('SET_SAVING', true);

      const response = await $axios.$patch('event', payload);

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar o evento.');
      }
      return { success: true, data: response.body.result };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    } finally {
      commit('SET_SAVING', false);
    }
  },

  async deleteEvent({ commit }: any, payload: any) {
    try {
      commit('SET_SAVING', true);

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
      commit('SET_SAVING', false);
    }
  },

  async validateAlias({ commit }: any, alias: string): Promise<boolean> {
    try {
      commit('SET_LOADING', true);

      const response = await $axios.$get(`event/validate-alias/${alias}`);

      if (!response.body || response.body.code !== 'VALIDATE_SUCCESS') {
        throw new Error('Falha ao validar alias');
      }

      return response.body.result.isValid;
    } catch (error) {
      console.error('Erro ao validar alias:', error);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createEvent({ commit, dispatch, rootGetters }: any): Promise<{ success: boolean; eventIds?: string[] }> {
    try {
      commit('SET_SAVING', true);

      // 1. Validar todo o evento
      commit('SET_PROGRESS_TITLE', 'Validando evento...');
      const validation = await dispatch('validateEvent');
      if (!validation.isValid) {
        throw new Error('Evento inválido: ' + validation.errors.join(', '));
      }

      // 2. Criar evento base
      commit('SET_PROGRESS_TITLE', 'Criando evento...');
      const responseEvents = await dispatch('eventGeneralInfo/createEventBase', null, { root: true });

      if (!responseEvents) {
        throw new Error('Falha ao criar evento base');
      }

      const eventIds = responseEvents.map((event: any) => event.id);

      // 3. Processar banner e link online em paralelo
      commit('SET_PROGRESS_TITLE', 'Processando mídia e configurações...');
      await Promise.all([
        dispatch('eventGeneralInfo/handleEventBanner', eventIds, { root: true }),
        dispatch('eventGeneralInfo/handleLinkOnline', eventIds, { root: true })
      ]);

      // 4. Criar ingressos
      commit('SET_PROGRESS_TITLE', 'Criando ingressos...');
      const ticketsCount = rootGetters['eventTickets/$tickets']?.length || 0;
      if (ticketsCount > 0) {
        await dispatch('eventTickets/createTickets', eventIds, { root: true });
      }

      // 5. Criar campos personalizados
      commit('SET_PROGRESS_TITLE', 'Configurando campos personalizados...');
      const customFieldsCount = rootGetters['eventCustomFields/$customFields']?.length || 0;
      if (customFieldsCount > 0) {
        await dispatch('eventCustomFields/createCustomFields', eventIds, { root: true });
      }

      // 6. Criar cupons
      commit('SET_PROGRESS_TITLE', 'Configurando cupons...');
      const couponsCount = rootGetters['eventCoupons/$coupons']?.length || 0;
      if (couponsCount > 0) {
        await dispatch('eventCoupons/createCoupons', eventIds, { root: true });
      }

      // 7. Resetar todos os módulos após sucesso
      commit('SET_PROGRESS_TITLE', 'Finalizando...');
      dispatch('resetAllModules');

      return { success: true, eventIds };

    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    } finally {
      commit('SET_SAVING', false);
      commit('SET_PROGRESS_TITLE', '');
    }
  },

  async validateEvent({ dispatch }: any): Promise<ValidationResult> {
    try {
      const [
        generalInfoValidation,
        ticketsValidation,
        customFieldsValidation,
        couponsValidation
      ] = await Promise.all([
        dispatch('eventGeneralInfo/validateGeneralInfo', null, { root: true }),
        dispatch('eventTickets/validateTickets', null, { root: true }),
        dispatch('eventCustomFields/validateCustomFields', null, { root: true }),
        dispatch('eventCoupons/validateCoupons', null, { root: true })
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
  },

  resetAllModules({ dispatch }: any) {
    dispatch('eventGeneralInfo/reset', null, { root: true });
    dispatch('eventTickets/reset', null, { root: true });
    dispatch('eventCustomFields/reset', null, { root: true });
    dispatch('eventCoupons/reset', null, { root: true });
    dispatch('reset');
  },

  reset({ commit }: any) {
    commit('SET_EVENT', null);
    commit('SET_EVENT_LIST', []);
    commit('SET_LOADING', false);
    commit('SET_PROGRESS_TITLE', '');
    commit('SET_SAVING', false);
  },

  async createEventCheckoutFieldTicketRelations({ dispatch }: any, payload: { fieldTicketMap: Record<string, string[]>, ticketMap: Record<string, string> }) {
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
            await dispatch('createSingleFieldTicketRelation', { fieldId, ticketId });
          } catch (error: any) {
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
  },

  async createSingleFieldTicketRelation(_: any, payload: { fieldId: string, ticketId: string }) {
    const response = await $axios.$post('event-checkout-field-ticket', {
      event_checkout_field_id: payload.fieldId,
      ticket_id: payload.ticketId,
    });

    if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
      throw new Error(`Falha ao vincular campo ${payload.fieldId} ao ingresso ${payload.ticketId}`);
    }

    return response.body.result;
  },

  async createCouponTicketRelations(_: any, payload: { couponTicketMap: Record<string, string[]>, ticketMap: Record<string, string> }) {
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
  },
};
