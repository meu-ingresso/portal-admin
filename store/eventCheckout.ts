import { $axios } from '@/utils/nuxt-instance';
import { handleCreateResponse, handleGetResponse, handleUpdateResponse } from '~/utils/responseHelpers';
import { CreateCustomerTicketPayload, CustomerTicketApiResponse, CustomFieldOptionApiResponse, CustomFieldTicketApiResponse, TicketFieldApiResponse } from '~/models/event';

interface EventCheckoutState {
  isLoading: boolean;
}

export const state = (): EventCheckoutState => ({
  isLoading: false,
});

export const getters = {
  $isLoading: (state: EventCheckoutState) => state.isLoading,
};

export const mutations = {
  SET_LOADING(state: EventCheckoutState, loading: boolean) {
    state.isLoading = loading;
  },
};

export const actions = {
  async fetchCheckoutFields({ commit }: any, eventId: string): Promise<CustomFieldTicketApiResponse[]> {
    try {
      commit('SET_LOADING', true);
      
      const response = await $axios.$get(`event-checkout-fields-tickets`,
        {
          params: {
            'preloads[]': ['eventCheckoutField', 'ticket'],
            'whereHas[eventCheckoutField][event_id][v]': eventId,
            'limit': 9999
          } 
        }
      );
      
      const resultCheckoutFields = handleGetResponse(response, 'Campos de checkout não encontrados', eventId, true);
    
      return resultCheckoutFields.data;
    } catch (error) {
      console.error('Erro ao buscar campos de checkout:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async getTicketFields(_: any, customerTicketId: string): Promise<TicketFieldApiResponse[]> {
    try {
      const response = await $axios.$get('/ticket-fields', {
        params: {
          'preloads[]': ['customerTicket', 'checkoutField'],
          'whereHas[customerTicket][id][v]': customerTicketId,
          'limit': 9999
        }
      });

      const resultTicketFields = handleGetResponse(response, 'Campos de ticket não encontrados', customerTicketId, true);
      
      return resultTicketFields.data;
    } catch (error) {
      console.error('Erro ao buscar campos do ingresso:', error);
      throw error;
    }
  },

  async fetchCheckoutFieldOptions({ commit }: any, fieldId: string): Promise<CustomFieldOptionApiResponse[]> {
    try {
      commit('SET_LOADING', true);
      const response = await $axios.$get(`event-checkout-field-options`,
        {
          params: {
          'preloads[]': ['eventCheckoutField'],
            'where[event_checkout_field_id][v]': fieldId
          }
        }
      );
    
      const resultCheckoutFieldOptions = handleGetResponse(response, 'Opções de campo não encontradas', null, true);

      return resultCheckoutFieldOptions.data;

    } catch (error) {
      console.error('Erro ao buscar opções de campo:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createCustomerTicket(_: any, customerTicketData: CreateCustomerTicketPayload): Promise<CustomerTicketApiResponse> {
    try {
      const response = await $axios.$post('/customer-ticket', customerTicketData);
      const data = handleCreateResponse(response, 'Erro ao criar ingresso');
      return data;
    } catch (error) {
      console.error('Erro ao criar ingresso:', error);
      throw error;
    }
  },

  async createTicketFields(_: any, payload: any): Promise<any> {
    try {
      const response = await $axios.$post(`/ticket-field`, payload);
      const data = handleCreateResponse(response, 'Erro ao criar valores de campos de ticket');
      return data;
  } catch (error) {
      console.error('Erro ao criar campos de ticket:', error);
      throw error;
    }
  },

  async updateTicketFields(_: any, payload: any): Promise<any> {
    try {
      const response = await $axios.$patch(`/ticket-field`, payload);
      const data = handleUpdateResponse(response, 'Erro ao atualizar valores de campos de ticket');
      return data;
  } catch (error) {
      console.error('Erro ao atualizar campos de ticket:', error);
      throw error;
    }
  },

  async updateEventTicketsTotalSold(_: any, payload: Array<{ticketId: string, total_sold: number}>): Promise<any> {
    try {
      const response = await $axios.$patch(`/ticket`, {
        data: payload.map(item => ({
          id: item.ticketId,
          total_sold: item.total_sold
        }))
      });
      const data = handleUpdateResponse(response, 'Erro ao atualizar quantidade de ingressos vendidos');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar quantidade de ingressos vendidos:', error);
      throw error;
    }
  },
};