import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { handleCreateResponse, handleGetResponse } from '~/utils/responseHelpers';
import { PaymentApiResponse, CustomerTicketApiResponse } from '@/models/event';

interface OrderByEventFilters {
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

interface OrderByUserFilters {
  userId: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
}

interface CreatePaymentData {
  user_id: string;
  status_id: string;
  payment_method: string;
  gross_value: string;
  net_value: string;
  coupon_id?: string;
  paid_at?: string;
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
  private userOrders: PaymentApiResponse[] = [];
  
  private ordersMeta = {
    total: 0,
    page: 1,
    limit: 10,
  };

  private userOrdersMeta = {
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

  public get $userOrders() {
    return this.userOrders;
  }

  public get $userOrdersMeta() {
    return this.userOrdersMeta;
  }

  @Mutation
  private SET_USER_ORDERS(orders: PaymentApiResponse[]) {
    this.userOrders = orders;
  }

  @Mutation
  private SET_USER_ORDERS_META(meta: any) {
    this.userOrdersMeta = meta;
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
      const response = await $axios.$get(
        `/payments?where[id][v]=${paymentId}&preloads[]=status&preloads[]=user:people&limit=9999`
      );
      const { data } = handleGetResponse(response, 'Pagamento não encontrado');

      this.context.commit('SET_PAYMENT', data[0]);
      await this.context.dispatch('fetchRelatedTickets', paymentId);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pagamento:', error);
      throw error;
    }
  }

  @Action
  public async fetchRelatedTickets(paymentId: string): Promise<void> {
    try {
      const response = await $axios.$get('/customer-tickets', {
        params: {
          'where[payment_id][v]': paymentId,
          'preloads[]': ['ticket', 'ticket:event:fees'],
          'limit': 9999,
        },
      });
      const { data } = handleGetResponse(response, 'Ingressos não encontrados');

      this.context.commit('SET_RELATED_TICKETS', data || []);
    } catch (error) {
      console.error('Erro ao buscar ingressos relacionados:', error);
      throw error;
    }
  }

  @Action
  public async fetchEventOrders(params: OrderByEventFilters): Promise<void> {
    try {
      this.context.commit('SET_LOADING_ORDERS', true);

      const queryParams: any = {
        preloads: [
          'payment:coupon',
          'payment:user:people',
          'payment:status',
          'ticket:event:fees',
        ],
        'whereHas[ticket][event_id][v]': params.eventId,
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || '-created_at',
      };

      // Adiciona busca por nome/email do comprador
      if (params.search) {
        queryParams[
          'whereHas[payment][user][people][or][first_name][ilike]'
        ] = `%${params.search}%`;
        queryParams[
          'whereHas[payment][user][people][or][last_name][ilike]'
        ] = `%${params.search}%`;
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
  public async fetchUserOrders(params: OrderByUserFilters): Promise<void> {
    try {
      this.context.commit('SET_LOADING_ORDERS', true);

      const queryParams: any = {
        preloads: [
          'payment:coupon',
          'payment:user:people',
          'payment:status',
          'ticket:event:fees',
        ],
        'whereHas[payment][user][id][v]': params.userId,
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || '-created_at',
      };

      // Adiciona filtro por status
      if (params.status) {
        queryParams['whereHas[payment][status][name][v]'] = params.status;
      }

      // Adiciona filtro por método de pagamento
      if (params.paymentMethod) {
        queryParams['whereHas[payment][payment_method][v]'] = params.paymentMethod;
      }

      // Adiciona filtro de busca
      if (params.search) {
        queryParams['whereHas[payment][user][people][orWhere][first_name][operator][ilike]'] = `%${params.search}%`;
        queryParams['whereHas[payment][user][people][orWhere][last_name][operator][ilike]'] = `%${params.search}%`;
        queryParams['whereHas[payment][user][orWhere][email][operator][ilike]'] = `%${params.search}%`;
      }

      // Adiciona filtro por data inicial
      if (params.startDate) {
        queryParams['where[created_at][operator][>=]'] = params.startDate;
      }

      // Adiciona filtro por data final
      if (params.endDate) {
        queryParams['where[created_at][operator][<=]'] = params.endDate;
      }

      const response = await $axios.$get('/customer-tickets', { params: queryParams });
      const { data, meta } = handleGetResponse(response, 'Pedidos não encontrados');

      // Agrupar pedidos pelo ID do pagamento
      const groupedOrders: Record<string, any> = {};
      if (data) {
        data.forEach((ticket: any) => {
          const paymentId = ticket.payment_id;
          if (paymentId) {
            if (!groupedOrders[paymentId]) {
              groupedOrders[paymentId] = { ...ticket };
            }
          }
        });
      }

      this.context.commit('SET_USER_ORDERS', Object.values(groupedOrders));
      this.context.commit('SET_USER_ORDERS_META', meta);
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING_ORDERS', false);
    }
  }

  @Action
  public async createPayment(paymentData: CreatePaymentData): Promise<PaymentApiResponse> {
    try {
      const response = await $axios.$post('/payment', paymentData);
      const data = handleCreateResponse(response, 'Erro ao criar pagamento');
      return data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  @Action
  public resetPaymentDetails(): void {
    this.context.commit('SET_PAYMENT', null);
    this.context.commit('SET_RELATED_TICKETS', []);
  }
}
