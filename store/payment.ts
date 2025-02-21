import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse } from '~/utils/responseHelpers';
import { PaymentApiResponse, CustomerTicketApiResponse } from '@/models/event';

interface OrderFilters {
  eventId: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
}

@Module({
  name: 'payment',
  stateFactory: true,
  namespaced: true,
})
export default class Payment extends VuexModule {
  private isLoading: boolean = false;
  private isLoadingOrders: boolean = false;
  private payment: PaymentApiResponse | null = null;
  private relatedTickets: CustomerTicketApiResponse[] = [];
  private orders: PaymentApiResponse[] = [];
  private ordersMeta = {
    total: 0,
    page: 1,
    limit: 10,
  };

  public get $isLoading() {
    return this.isLoading;
  }

  public get $isLoadingOrders() {
    return this.isLoadingOrders;
  }

  public get $payment() {
    return this.payment;
  }

  public get $relatedTickets() {
    return this.relatedTickets;
  }

  public get $orders() {
    return this.orders;
  }

  public get $ordersMeta() {
    return this.ordersMeta;
  }

  @Mutation
  private SET_LOADING(loading: boolean) {
    this.isLoading = loading;
  }

  @Mutation
  private SET_LOADING_ORDERS(loading: boolean) {
    this.isLoadingOrders = loading;
  }

  @Mutation
  private SET_PAYMENT(payment: PaymentApiResponse | null) {
    this.payment = payment;
  }

  @Mutation
  private SET_RELATED_TICKETS(tickets: CustomerTicketApiResponse[]) {
    this.relatedTickets = tickets;
  }

  @Mutation
  private SET_ORDERS(orders: PaymentApiResponse[]) {
    this.orders = orders;
  }

  @Mutation
  private SET_ORDERS_META(meta: any) {
    this.ordersMeta = meta;
  }

  @Action
  public async fetchPaymentDetails(paymentId: string): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);
      const response = await $axios.$get(`/payments?where[id][v]=${paymentId}&preloads[]=status&preloads[]=user:people`);
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
  public async fetchEventOrders(params: OrderFilters): Promise<void> {
    try {
      this.context.commit('SET_LOADING_ORDERS', true);

      const queryParams: any = {
        'preloads': [
          'payment:user:people',
          'payment:status',
          'ticket:event'
        ],
        'whereHas[ticket][event_id][v]': params.eventId,
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || '-created_at',
      };

      // Adiciona busca por nome/email do comprador
      if (params.search) {
        queryParams['whereHas[payment][user][people][or][first_name][ilike]'] = `%${params.search}%`;
        queryParams['whereHas[payment][user][people][or][last_name][ilike]'] = `%${params.search}%`;
        queryParams['whereHas[payment][user][or][email][ilike]'] = `%${params.search}%`;
      }

      // Adiciona filtro por data
      if (params.startDate) {
        queryParams['whereHas[payment][created_at][gte]'] = params.startDate;
      }
      if (params.endDate) {
        queryParams['whereHas[payment][created_at][lte]'] = params.endDate;
      }

      // Adiciona filtro por status
      if (params.status) {
        queryParams['whereHas[payment][status][name][v]'] = params.status;
      }

      // Adiciona filtro por método de pagamento
      if (params.paymentMethod) {
        queryParams['whereHas[payment][payment_method][v]'] = params.paymentMethod;
      }

      const response = await $axios.$get('/customer-tickets', { params: queryParams });
      const { data, meta } = handleGetResponse(response, 'Pedidos não encontrados');

      // Agrupa os tickets por payment_id
      const groupedOrders = data.reduce((acc: any, ticket: any) => {
        if (!acc[ticket.payment_id]) {
          acc[ticket.payment_id] = {
            ...ticket.payment,
            tickets: [],
          };
        }
        acc[ticket.payment_id].tickets.push(ticket);
        return acc;
      }, {});

      this.context.commit('SET_ORDERS', Object.values(groupedOrders));
      this.context.commit('SET_ORDERS_META', meta);
    } catch (error) {
      console.error('Erro ao buscar pedidos do evento:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING_ORDERS', false);
    }
  }

  @Action
  public resetPaymentDetails(): void {
    this.context.commit('SET_PAYMENT', null);
    this.context.commit('SET_RELATED_TICKETS', []);
  }
}
