import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { handleCreateResponse, handleGetResponse } from '~/utils/responseHelpers';
import { CreateCustomerTicketPayload, CustomerTicketApiResponse, CustomFieldOptionApiResponse, CustomFieldTicketApiResponse } from '~/models/event';

@Module({
  name: 'eventCheckout',
  stateFactory: true,
  namespaced: true,
})
export default class EventCheckout extends VuexModule {

  private isLoading: boolean = false;

  public get $isLoading() {
    return this.isLoading;
  }

  @Mutation
  private SET_LOADING(loading: boolean) {
    this.isLoading = loading;
  }

  @Action
  public async fetchCheckoutFields(eventId: string): Promise<CustomFieldTicketApiResponse[]> {
    try {
      this.context.commit('SET_LOADING', true);
      
      const response = await $axios.$get(`event-checkout-fields-tickets`,
        {
          params: {
            'preloads[]': ['eventCheckoutField', 'ticket'],
            'whereHas[eventCheckoutField][event_id][v]': eventId
          } 
        }
      );

      console.log(response);
      
      const resultCheckoutFields = handleGetResponse(response, 'Campos de checkout não encontrados', eventId, true);
    
      return resultCheckoutFields.data;
    } catch (error) {
      console.error('Erro ao buscar campos de checkout:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchCheckoutFieldOptions(fieldId: string): Promise<CustomFieldOptionApiResponse[]> {
    try {
      this.context.commit('SET_LOADING', true);
      const response = await $axios.$get(`event-checkout-field-options`,
        {
          params: {
          'preloads[]': ['eventCheckoutField'],
            'where[event_checkout_field_id][v]': fieldId
          }
        }
      );
    
      const resultCheckoutFieldOptions = handleGetResponse(response, 'Opções de campo não encontradas', null, true);

      // Log para entender a estrutura
      console.log('Opções retornadas da API:', resultCheckoutFieldOptions.data);

      return resultCheckoutFieldOptions.data;

    } catch (error) {
      console.error('Erro ao buscar opções de campo:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async createCustomerTicket(customerTicketData: CreateCustomerTicketPayload): Promise<CustomerTicketApiResponse> {
    try {
      const response = await $axios.$post('/customer-ticket', customerTicketData);
      const data = handleCreateResponse(response, 'Erro ao criar ingresso');
      return data;
    } catch (error) {
      console.error('Erro ao criar ingresso:', error);
      throw error;
    }
  }

  @Action
  public async createTicketFields(payload: any): Promise<any> {
    try {
      const response = await $axios.$post(`${process.env.VUE_APP_API_URL}/ticket-field`, payload);
      return response.data.result;
  } catch (error) {
      console.error('Erro ao criar campos de ticket:', error);
      throw error;
    }
  }
}