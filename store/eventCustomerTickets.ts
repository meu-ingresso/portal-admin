import { CustomerTicketApiResponse, ResultMeta } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse, handleUpdateResponse } from '~/utils/responseHelpers';

interface EventCustomerTicketsState {
  isLoading: boolean;
  customerTicketList: CustomerTicketApiResponse[];
  meta: ResultMeta;
}

const mockCustomerTicketList: CustomerTicketApiResponse[] = [
  {
    id: '123456',
    ticket_id: '123456',
    current_owner_id: '123456',
    previous_owner_id: '123456',
    status_id: '123456',
    payment_id: '123456',
    ticket_identifier: '123456',
    validated: false,
    validated_by: '123456',
    validated_at: '2025-02-01',
    created_at: '2025-02-01',
    updated_at: '2025-02-01',
    deleted_at: '2025-02-01',
  },
];

export const state = (): EventCustomerTicketsState => ({
  isLoading: false,
  customerTicketList: process.env.USE_MOCK_DATA === 'true' ? mockCustomerTicketList : [],
  meta: {
    total: 0,
    perPage: 50,
    currentPage: 1,
    lastPage: 1,
    firstPage: 1
  },
});

export const getters = {
  $customerTickets: (state: EventCustomerTicketsState) => state.customerTicketList,
  $meta: (state: EventCustomerTicketsState) => state.meta,
  $isLoading: (state: EventCustomerTicketsState) => state.isLoading,
};

export const mutations = {
  SET_LOADING(state: EventCustomerTicketsState, loading: boolean) {
    state.isLoading = loading;
  },

  SET_META(state: EventCustomerTicketsState, meta: ResultMeta) {
    state.meta = meta;
  },

  SET_CUSTOMER_TICKETS(state: EventCustomerTicketsState, customerTickets: CustomerTicketApiResponse[]) {
    state.customerTicketList = customerTickets;
  },

  UPDATE_CUSTOMER_TICKET(state: EventCustomerTicketsState, { index, customerTicket }: { index: number; customerTicket: CustomerTicketApiResponse }) {
    const updatedList = [...state.customerTicketList];
    updatedList[index] = { ...customerTicket };
    state.customerTicketList = updatedList;
  },
};

export const actions = {
  setCustomerTickets({ commit }: any, customerTickets: CustomerTicketApiResponse[]) {
    commit('SET_CUSTOMER_TICKETS', customerTickets);
  },

  updateCustomerTicket({ commit }: any, payload: { index: number; customerTicket: CustomerTicketApiResponse }) {
    commit('UPDATE_CUSTOMER_TICKET', payload);
  },

  async bulkInvalidateCustomerTickets(_: any, customerTicketIds: string[]): Promise<CustomerTicketApiResponse[]> {
    try {
      const response = await $axios.$patch(`customer-ticket`, {
        data: customerTicketIds.map(id => ({ id, validated: false }))
      });

      const result = handleUpdateResponse(response, 'Erro ao invalidar ingressos', null);

      return result;

    } catch (error) {
      console.error('Erro ao invalidar ingressos:', error);
      throw error;
    }
  },

  async validateCustomerTicket({ commit, state }: any, customerTicketId: string): Promise<void> {
    try {
      const response = await $axios.$patch(`customer-ticket`, {
        data: [
          {
            id: customerTicketId,
            validated: true,
          }
        ]
      });

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao validar ingresso');
      }

      // Atualiza o ticket na lista local
      const ticketIndex = state.customerTicketList.findIndex((t: CustomerTicketApiResponse) => t.id === customerTicketId);
      if (ticketIndex !== -1) {
        const updatedTicket = {
          ...state.customerTicketList[ticketIndex],
          validated: true,
        };
        
        commit('UPDATE_CUSTOMER_TICKET', { 
          index: ticketIndex, 
          customerTicket: updatedTicket 
        });
      }
    } catch (error) {
      console.error('Erro ao validar customer ticket:', error);
      throw error;
    }
  },

  async invalidateCustomerTicket({ commit, state }: any, customerTicketId: string): Promise<void> {
    try {
      const response = await $axios.$patch(`customer-ticket`, {
        data: [
          {
            id: customerTicketId,
            validated: false,
          }
        ]
      });

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao desfazer validação do ingresso');
      }
    
      // Atualiza o ticket na lista local
      const ticketIndex = state.customerTicketList.findIndex((t: CustomerTicketApiResponse) => t.id === customerTicketId);
      if (ticketIndex !== -1) {
        const updatedTicket = {
          ...state.customerTicketList[ticketIndex],
          validated: false,
        };
        
        commit('UPDATE_CUSTOMER_TICKET', { 
          index: ticketIndex, 
          customerTicket: updatedTicket 
        });
      }
    }  catch (error) {
      throw new Error('Erro ao desfazer validação do ingresso');
    }
  },

  async fetchAndPopulateByQuery({ commit }: any, query: string): Promise<void> {
    try {
      commit('SET_LOADING', true);
      
      const response = await $axios.$get(`customer-tickets?${query}`);
      const result = handleGetResponse(response, 'Ingressos não encontrados', null, true);

      if (result.meta) {
        commit('SET_META', result.meta);
      }
      
      commit('SET_CUSTOMER_TICKETS', result.data || []);
    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
}; 