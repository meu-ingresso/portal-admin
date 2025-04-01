import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { CustomerTicketApiResponse, ResultMeta } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse, handleUpdateResponse } from '~/utils/responseHelpers';
@Module({
  name: 'eventCustomerTickets',
  stateFactory: true,
  namespaced: true,
})
export default class EventCustomerTickets extends VuexModule {

  private isLoading: boolean = false;

  private customerTicketList: CustomerTicketApiResponse[] = [];

  private meta: ResultMeta = {
    total: 0,
    perPage: 50,
    currentPage: 1,
    lastPage: 1,
    firstPage: 1
  };

  private mockCustomerTicketList: CustomerTicketApiResponse[] = [
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

  constructor(module: VuexModule<ThisType<CustomerTicketApiResponse>, CustomerTicketApiResponse>) {
    super(module);
    this.customerTicketList = process.env.USE_MOCK_DATA === 'true' ? this.mockCustomerTicketList : this.customerTicketList;
  }

  public get $customerTickets() {
    return this.customerTicketList;
  }

  public get $meta() {
    return this.meta;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  @Mutation
  private SET_LOADING(loading: boolean) {
    this.isLoading = loading;
  }

  @Mutation
  private SET_META(meta: ResultMeta) {
    this.meta = meta;
  }

  @Mutation
  private SET_CUSTOMER_TICKETS(customerTickets: CustomerTicketApiResponse[]) {
    this.customerTicketList = customerTickets;
  }

  @Mutation
  private UPDATE_CUSTOMER_TICKET({ index, customerTicket }: { index: number; customerTicket: CustomerTicketApiResponse }) {
    const updatedList = [...this.customerTicketList];
    updatedList[index] = { ...customerTicket };
    this.customerTicketList = updatedList;
  }

  @Action
  public setCustomerTickets(customerTickets: CustomerTicketApiResponse[]) {
    this.context.commit('SET_CUSTOMER_TICKETS', customerTickets);
  }

  @Action
  public updateCustomerTicket(payload: { index: number; customerTicket: CustomerTicketApiResponse }) {
    this.context.commit('UPDATE_CUSTOMER_TICKET', payload);
  }

  @Action 
  public async bulkInvalidateCustomerTickets(customerTicketIds: string[]): Promise<CustomerTicketApiResponse[]> {
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
  }  
    

  @Action
  public async validateCustomerTicket(customerTicketId: string): Promise<void> {
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
      const ticketIndex = this.customerTicketList.findIndex(t => t.id === customerTicketId);
      if (ticketIndex !== -1) {
        const updatedTicket = {
          ...this.customerTicketList[ticketIndex],
          validated: true,
        };
        
        this.context.commit('UPDATE_CUSTOMER_TICKET', { 
          index: ticketIndex, 
          customerTicket: updatedTicket 
        });
      }
    } catch (error) {
      console.error('Erro ao validar customer ticket:', error);
      throw error;
    }
  }

  @Action
  public async invalidateCustomerTicket(customerTicketId: string): Promise<void> {
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
      const ticketIndex = this.customerTicketList.findIndex(t => t.id === customerTicketId);
      if (ticketIndex !== -1) {
        const updatedTicket = {
          ...this.customerTicketList[ticketIndex],
          validated: false,
        };
        
        this.context.commit('UPDATE_CUSTOMER_TICKET', { 
          index: ticketIndex, 
          customerTicket: updatedTicket 
        });
      }
    }  catch (error) {
      throw new Error('Erro ao desfazer validação do ingresso');
    }
  }

  @Action
  public async fetchAndPopulateByQuery(query: string): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);
      
      const response = await $axios.$get(`customer-tickets?${query}`);
      const result = handleGetResponse(response, 'Ingressos não encontrados', null, true);

      if (result.meta) {
        this.context.commit('SET_META', result.meta);
      }
      
      this.context.commit('SET_CUSTOMER_TICKETS', result.data || []);
    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

} 