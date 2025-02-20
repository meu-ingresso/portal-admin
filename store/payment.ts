import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse } from '~/utils/responseHelpers';
import { PaymentApiResponse, CustomerTicketApiResponse } from '@/models/event';
@Module({
  name: 'payment',
  stateFactory: true,
  namespaced: true,
})
export default class Payment extends VuexModule {
  private isLoading: boolean = false;
  private payment: PaymentApiResponse | null = null;
  private relatedTickets: CustomerTicketApiResponse[] = [];

  public get $isLoading() {
    return this.isLoading;
  }

  public get $payment() {
    return this.payment;
  }

  public get $relatedTickets() {
    return this.relatedTickets;
  }

  @Mutation
  private SET_LOADING(loading: boolean) {
    this.isLoading = loading;
  }

  @Mutation
  private SET_PAYMENT(payment: PaymentApiResponse | null) {
    this.payment = payment;
  }

  @Mutation
  private SET_RELATED_TICKETS(tickets: CustomerTicketApiResponse[]) {
    this.relatedTickets = tickets;
  }

  @Action
  public async fetchPaymentDetails(paymentId: string): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);
      const response = await $axios.$get(`/payments`, {
        params: {
          'where[id][v]': paymentId,
          'preloads[]': 'status',
        },
      });
      const {data} = handleGetResponse(response, 'Pagamento não encontrado');
      
      this.context.commit('SET_PAYMENT', data[0]);
      await this.context.dispatch('fetchRelatedTickets', paymentId);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pagamento:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchRelatedTickets(paymentId: string): Promise<void> {
    try {
      const response = await $axios.$get('/customer-tickets', {
        params: {
          'where[payment_id][v]': paymentId,
          'preloads[]=': 'ticket',
        },
      });
      const {data} = handleGetResponse(response, 'Ingressos não encontrados');
      
      this.context.commit('SET_RELATED_TICKETS', data || []);
    } catch (error) {
      console.error('Erro ao buscar ingressos relacionados:', error);
      throw error;
    }
  }

  @Action
  public resetPaymentDetails(): void {
    this.context.commit('SET_PAYMENT', null);
    this.context.commit('SET_RELATED_TICKETS', []);
  }
}
