import { $axios } from '@/utils/nuxt-instance';
import { handleCreateResponse, handleGetResponse } from '~/utils/responseHelpers';
import { PaymentApiResponse, CustomerTicketApiResponse } from '@/models/event';

interface OrderByEventFilters {
  eventId: string;
  peopleId?: string;
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
  peopleId: string;
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
  people_id: string;
  status_id: string;
  payment_method: string;
  gross_value: string;
  net_value: string;
  coupon_id?: string;
  paid_at?: string;
}

interface PaymentState {
  isLoading: boolean;
  isLoadingOrders: boolean;
  payment: PaymentApiResponse | null;
  relatedTickets: CustomerTicketApiResponse[];
  orders: PaymentApiResponse[];
  userOrders: PaymentApiResponse[];
  ordersMeta: {
    total: number;
    page: number;
    limit: number;
  };
  userOrdersMeta: {
    total: number;
    page: number;
    limit: number;
  };
}

export const state = (): PaymentState => ({
  isLoading: false,
  isLoadingOrders: false,
  payment: null,
  relatedTickets: [],
  orders: [],
  userOrders: [],
  ordersMeta: {
    total: 0,
    page: 1,
    limit: 10,
  },
  userOrdersMeta: {
    total: 0,
    page: 1,
    limit: 10,
  },
});

export const getters = {
  $isLoading: (state: PaymentState) => state.isLoading,
  $isLoadingOrders: (state: PaymentState) => state.isLoadingOrders,
  $payment: (state: PaymentState) => state.payment,
  $relatedTickets: (state: PaymentState) => state.relatedTickets,
  $orders: (state: PaymentState) => state.orders,
  $ordersMeta: (state: PaymentState) => state.ordersMeta,
  $userOrders: (state: PaymentState) => state.userOrders,
  $userOrdersMeta: (state: PaymentState) => state.userOrdersMeta,
};

export const mutations = {
  SET_USER_ORDERS(state: PaymentState, orders: PaymentApiResponse[]) {
    state.userOrders = orders;
  },

  SET_USER_ORDERS_META(state: PaymentState, meta: any) {
    state.userOrdersMeta = meta;
  },

  SET_LOADING(state: PaymentState, loading: boolean) {
    state.isLoading = loading;
  },

  SET_LOADING_ORDERS(state: PaymentState, loading: boolean) {
    state.isLoadingOrders = loading;
  },

  SET_PAYMENT(state: PaymentState, payment: PaymentApiResponse | null) {
    state.payment = payment;
  },

  SET_RELATED_TICKETS(state: PaymentState, tickets: CustomerTicketApiResponse[]) {
    state.relatedTickets = tickets;
  },

  SET_ORDERS(state: PaymentState, orders: PaymentApiResponse[]) {
    state.orders = orders;
  },

  SET_ORDERS_META(state: PaymentState, meta: any) {
    state.ordersMeta = meta;
  },
};

export const actions = {
  async fetchPaymentDetails({ commit, dispatch }: any, paymentId: string): Promise<void> {
    try {
      commit('SET_LOADING', true);

      const response = await $axios.$get(
        `/payments?where[id][v]=${paymentId}&preloads[]=status&preloads[]=people&preloads[]=event:fees`
      );
      const { data } = handleGetResponse(response, 'Pagamento não encontrado');

      commit('SET_PAYMENT', data[0]);
      await dispatch('fetchRelatedTickets', paymentId);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pagamento:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchRelatedTickets({ commit }: any, paymentId: string): Promise<void> {
    try {
      const response = await $axios.$get('/customer-tickets', {
        params: {
          'whereHas[paymentTickets][payment_id][v]': paymentId,
          'preloads[]': ['paymentTickets:ticket', 'paymentTickets:ticket:event:fees'],
          'limit': 9999,
        },
      });
      const { data } = handleGetResponse(response, 'Ingressos não encontrados');

      commit('SET_RELATED_TICKETS', data || []);
    } catch (error) {
      console.error('Erro ao buscar ingressos relacionados:', error);
      throw error;
    }
  },

  async fetchEventOrders({ commit }: any, params: OrderByEventFilters): Promise<void> {
    try {
      commit('SET_LOADING_ORDERS', true);

      const queryParams: any = {
        preloads: [
          'coupon',
          'people',
          'status',
          'event:fees',
        ],
        'where[event_id][v]': params.eventId,
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || '-created_at',
      };

      if (params.peopleId) {
        queryParams['where[people_id][v]'] = params.peopleId;
      }

      // Adiciona busca por nome/email do comprador
      if (params.search) {
        queryParams[
          'whereHas[people][or][first_name][ilike]'
        ] = `%${params.search}%`;
        queryParams[
          'whereHas[people][or][last_name][ilike]'
        ] = `%${params.search}%`;
        queryParams['whereHas[people][or][email][ilike]'] = `%${params.search}%`;
      }

      // Adiciona filtro por data
      if (params.startDate) {
        queryParams['where[created_at][gte]'] = params.startDate;
      }
      if (params.endDate) {
        queryParams['where[created_at][lte]'] = params.endDate;
      }

      // Adiciona filtro por status
      if (params.status) {
        queryParams['whereHas[status][name][v]'] = params.status;
      }

      // Adiciona filtro por método de pagamento
      if (params.paymentMethod) {
        queryParams['where[payment_method][v]'] = params.paymentMethod;
      }

      const response = await $axios.$get('/payments', { params: queryParams });
      const { data, meta } = handleGetResponse(response, 'Pedidos não encontrados');

      commit('SET_ORDERS', data);
      commit('SET_ORDERS_META', meta);
    } catch (error) {
      console.error('Erro ao buscar pedidos do evento:', error);
      throw error;
    } finally {
      commit('SET_LOADING_ORDERS', false);
    }
  },

  async fetchUserOrders({ commit }: any, params: OrderByUserFilters): Promise<void> {
    try {
      commit('SET_LOADING_ORDERS', true);

      const queryParams: any = {
        preloads: [
          'payment:coupon',
          'payment:people',
          'payment:status',
          'ticket:event:fees',
        ],
        'whereHas[payment][people_id]][v]': params.peopleId,
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
        queryParams['whereHas[payment][people][orWhere][first_name][operator][ilike]'] = `%${params.search}%`;
        queryParams['whereHas[payment][people][orWhere][last_name][operator][ilike]'] = `%${params.search}%`;
         queryParams['whereHas[payment][people][orWhere][email][operator][ilike]'] = `%${params.search}%`;
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

      commit('SET_USER_ORDERS', Object.values(groupedOrders));
      commit('SET_USER_ORDERS_META', meta);
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      throw error;
    } finally {
      commit('SET_LOADING_ORDERS', false);
    }
  },

  async createPayment(_: any, paymentData: CreatePaymentData[]): Promise<PaymentApiResponse> {
    try {
      const response = await $axios.$post('/payment', {
        data: paymentData
      });
      const data = handleCreateResponse(response, 'Erro ao criar pagamento');
      return data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  },

  resetPaymentDetails({ commit }: any): void {
    commit('SET_PAYMENT', null);
    commit('SET_RELATED_TICKETS', []);
  },
};
