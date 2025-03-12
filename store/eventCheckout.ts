import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse } from '~/utils/responseHelpers';
import { CustomFieldOptionApiResponse, CustomFieldTicketApiResponse } from '~/models/event';

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

      return resultCheckoutFieldOptions.data;

    } catch (error) {
      console.error('Erro ao buscar opções de campo:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  /**
 * Cria o payload para salvar os tickets customizados
 * @param {Array} ticketFormGroups - Grupos de formulários de tickets
 * @param {string} paymentId - ID do pagamento
 * @param {string} ownerId - ID do proprietário
 * @param {string} statusId - ID do status
 * @returns {Object} - Payload para criar os tickets customizados
   */
  @Action
  public prepareCustomTicketsPayload(payload: {
    ticketFormGroups: any[],
    paymentId: string,
    ownerId: string,
    statusId: string
  }): any {
    const customerTickets = [];
    
    for (const group of payload.ticketFormGroups) {
      const ticketId = group.ticketId;
      
    for (const instance of group.instances) {
      customerTickets.push({
        ticket_id: ticketId,
        current_owner_id: payload.ownerId,
        payment_id: payload.paymentId,
        status_id: payload.statusId,
        custom_fields: instance.fields
      });
      }
    }
    
    return { data: customerTickets };
  }
}