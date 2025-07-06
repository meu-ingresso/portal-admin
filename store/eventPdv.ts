import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse } from '~/utils/responseHelpers';
import { PDVApiResponse, StatusApiResponse } from '~/models/event';

interface EventPdvState {
  pdvList: PDVApiResponse[];
  isLoading: boolean;
  selectedPdv: PDVApiResponse | null;
  statusDefault: any;
  statuses: StatusApiResponse[];
}

export const state = (): EventPdvState => ({
  pdvList: [],
  isLoading: false,
  selectedPdv: null,
  statusDefault: null,
  statuses: [],
});

export const getters = {
  $pdvs: (state: EventPdvState) => state.pdvList,
  $isLoading: (state: EventPdvState) => state.isLoading,
  $selectedPdv: (state: EventPdvState) => state.selectedPdv,
  $statusDefault: (state: EventPdvState) => state.statusDefault,
  $statuses: (state: EventPdvState) => state.statuses,
};

export const mutations = {
  SET_PDVS(state: EventPdvState, pdvs: PDVApiResponse[]) {
    state.pdvList = pdvs;
  },

  SET_SELECTED_PDV(state: EventPdvState, pdv: PDVApiResponse | null) {
    state.selectedPdv = pdv;
  },

  SET_IS_LOADING(state: EventPdvState, value: boolean) {
    state.isLoading = value;
  },

  SET_STATUS_DEFAULT(state: EventPdvState, statusData: any) {
    state.statusDefault = statusData;
  },

  SET_STATUSES(state: EventPdvState, statuses: StatusApiResponse[]) {
    state.statuses = statuses;
  },

  ADD_PDV(state: EventPdvState, pdv: PDVApiResponse) {
    state.pdvList = [...state.pdvList, pdv];
  },

  UPDATE_PDV(state: EventPdvState, payload: { id: string; pdv: Partial<PDVApiResponse> }) {
    const { id, pdv } = payload;
    state.pdvList = state.pdvList.map((item) => {
      if (item.id === id) {
        return { ...item, ...pdv };
      }
      return item;
    });
  },

  REMOVE_PDV(state: EventPdvState, id: string) {
    state.pdvList = state.pdvList.filter((pdv) => pdv.id !== id);
  },
};

export const actions = {
  setIsLoading({ commit }: any, value: boolean) {
    commit('SET_IS_LOADING', value);
  },

  setPdvs({ commit }: any, pdvs: PDVApiResponse[]) {
    commit('SET_PDVS', pdvs);
  },

  setSelectedPdv({ commit }: any, pdv: PDVApiResponse | null) {
    commit('SET_SELECTED_PDV', pdv);
  },

  async fetchStatuses({ commit }: any) {
    try {
      const response = await $axios.$get(`statuses?where[module][v]=pdv&orderBy[]=name:asc`);

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Falha ao buscar status do módulo: pdv.');
      }

      const data = response.body.result.data;
      
      if (data) {  
        commit('SET_STATUSES', data);
        commit('SET_STATUS_DEFAULT', data.find((status: StatusApiResponse) => status.name.toLowerCase() === 'disponível' || status.name.toLowerCase() === 'disponivel'));

        return data;
      }

      return [];
    } catch (error) {
      console.error('[PDV] Error fetching statuses:', error);
      return [];
    }
  },

  async fetchAndPopulateByEventId({ dispatch, getters }: any, eventId: string) {
    try {
      dispatch('setIsLoading', true);

      // Buscar os statuses disponíveis se não estão carregados
      if (getters.$statuses.length === 0) {
        await dispatch('fetchStatuses');
      }

      // Buscar os PDVs do evento, usuarios e ingressos associados
      const promises = [
        $axios.$get(`pdvs?where[event_id][v]=${eventId}&preloads[]=status`),
        $axios.$get(`pdv-users?whereHas[pdv][event_id][v]=${eventId}&preloads[]=user:people`),
        $axios.$get(`pdv-tickets?whereHas[pdv][event_id][v]=${eventId}&preloads[]=ticket`)
      ];  

      const [pdvsResponse, pdvUsersResponse, pdvTicketsResponse] = await Promise.all(promises);
      
      const resultPdv = handleGetResponse(pdvsResponse, 'PDVs não encontrados', eventId, true);
      const resultPdvUsers = handleGetResponse(pdvUsersResponse, 'Usuários não encontrados', eventId, true);
      const resultPdvTickets = handleGetResponse(pdvTicketsResponse, 'Ingressos não encontrados', eventId, true);

      if (resultPdv && resultPdv.data) {
        
        const pdvs = resultPdv.data.map((pdv: PDVApiResponse) => {
          const pdvUser = resultPdvUsers.data.filter((user: any) => user.pdv_id === pdv.id);
          const pdvTicket = resultPdvTickets.data.filter((ticket: any) => ticket.pdv_id === pdv.id);

          return { ...pdv, users: pdvUser, tickets: pdvTicket };
        });

        dispatch('setPdvs', pdvs as PDVApiResponse[]);

        return { success: true, data: pdvs };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('[PDV] Error fetching PDVs:', error);
      dispatch('setPdvs', []);
      return { success: false, error };
    } finally {
      dispatch('setIsLoading', false);
    }
  },

  async createPdv({ commit, dispatch }: any, pdvData: Omit<PDVApiResponse, 'id'>) {
    try {
      dispatch('setIsLoading', true);
      
      const payload = {
        data: [pdvData]
      };
      
      const response = await $axios.$post('pdv', payload);
      
      if (response && response.body && response.body.code === 'CREATE_SUCCESS') {
        const newPdv = response.body.result[0];
        commit('ADD_PDV', newPdv);
        return { success: true, data: newPdv };
      }
      
      throw new Error('Falha ao criar PDV');
    } catch (error) {
      console.error('[PDV] Error creating PDV:', error);
      return { success: false, error };
    } finally {
      dispatch('setIsLoading', false);
    }
  },

  async updatePdv({ commit, dispatch }: any, payload: {data: Partial<PDVApiResponse> }) {
    try {
      dispatch('setIsLoading', true);
      
      const { data } = payload;
      
      const updatePayload = {
        data: [{ id: data.id, ...data }]
      };
      
      const response = await $axios.$patch('pdv', updatePayload);
      
      if (response && response.body && response.body.code === 'UPDATE_SUCCESS') {
        commit('UPDATE_PDV', { id: data.id, pdv: data });
        return { success: true };
      }
      
      throw new Error('Falha ao atualizar PDV');
    } catch (error) {
      console.error('[PDV] Error updating PDV:', error);
      return { success: false, error };
    } finally {
      dispatch('setIsLoading', false);
    }
  },

  async deletePdv({ commit, dispatch }: any, id: string) {
    try {
      dispatch('setIsLoading', true);
      
      const response = await $axios.$delete(`pdv/${id}`);
      
      if (response && response.body && response.body.code === 'DELETE_SUCCESS') {
        commit('REMOVE_PDV', id);
        return { success: true };
      }
      
      throw new Error('Falha ao excluir PDV');
    } catch (error) {
      console.error('[PDV] Error deleting PDV:', error);
      return { success: false, error };
    } finally {
      dispatch('setIsLoading', false);
    }
  },

  async associateUsers({ dispatch, getters }: any, payload: { pdvId: string; userIds: string[] }) {
    try {
      dispatch('setIsLoading', true);
      
      const { pdvId, userIds } = payload;
      
      const data = userIds.map(userId => ({
        pdv_id: pdvId,
        user_id: userId
      }));
      
      const response = await $axios.$post('pdv-user', { data });
      
      if (response && response.body && response.body.code === 'CREATE_SUCCESS') {
        // Atualizar o PDV na lista após associar usuários
        await dispatch('fetchAndPopulateByEventId', getters.$pdvs.find((pdv: PDVApiResponse) => pdv.id === pdvId)?.event_id || '');
        return { success: true, data: response.body.result.data };
      }
      
      throw new Error('Falha ao associar usuários ao PDV');
    } catch (error) {
      console.error('[PDV] Error associating users:', error);
      return { success: false, error };
    } finally {
      dispatch('setIsLoading', false);
    }
  },

  async associateTickets({ dispatch, getters }: any, payload: { pdvId: string; ticketIds: string[] }) {
    try {
      dispatch('setIsLoading', true);
      
      const { pdvId, ticketIds } = payload;
      
      const data = ticketIds.map(ticketId => ({
        pdv_id: pdvId,
        ticket_id: ticketId
      }));
      
      const response = await $axios.$post('pdv-ticket', { data });
      
      if (response && response.body && response.body.code === 'CREATE_SUCCESS') {
        // Atualizar o PDV na lista após associar ingressos
        await dispatch('fetchAndPopulateByEventId', getters.$pdvs.find((pdv: PDVApiResponse) => pdv.id === pdvId)?.event_id || '');
        return { success: true, data: response.body.result.data };
      }
      
      throw new Error('Falha ao associar ingressos ao PDV');
    } catch (error) {
      console.error('[PDV] Error associating tickets:', error);
      return { success: false, error };
    } finally {
      dispatch('setIsLoading', false);
    }
  },

  async removeUserAssociation({ dispatch, state }: any, pdvUserId: string) {
    try {
      dispatch('setIsLoading', true);
      
      const response = await $axios.$delete(`pdv-user/${pdvUserId}`);
      
      if (response && response.body && response.body.code === 'DELETE_SUCCESS') {
        // Atualiza a lista de PDVs para refletir a remoção
        const pdv = state.pdvList.find((p: PDVApiResponse) => p.users?.some((u: any) => u.id === pdvUserId));
        if (pdv && pdv.event_id) {
          await dispatch('fetchAndPopulateByEventId', pdv.event_id);
        }
        return { success: true };
      }
      
      throw new Error('Falha ao remover associação de usuário');
    } catch (error) {
      console.error('[PDV] Error removing user association:', error);
      return { success: false, error };
    } finally {
      dispatch('setIsLoading', false);
    }
  },

  async removeTicketAssociation({ dispatch, state }: any, pdvTicketId: string) {
    try {
      dispatch('setIsLoading', true);
      
      const response = await $axios.$delete(`pdv-ticket/${pdvTicketId}`);
      
      if (response && response.body && response.body.code === 'DELETE_SUCCESS') {
        // Atualiza a lista de PDVs para refletir a remoção
        const pdv = state.pdvList.find((p: PDVApiResponse) => p.tickets?.some((t: any) => t.id === pdvTicketId));
        if (pdv && pdv.event_id) {
          await dispatch('fetchAndPopulateByEventId', pdv.event_id);
        }
        return { success: true };
      }
      
      throw new Error('Falha ao remover associação de ingresso');
    } catch (error) {
      console.error('[PDV] Error removing ticket association:', error);
      return { success: false, error };
    } finally {
      dispatch('setIsLoading', false);
    }
  },

  async fetchPdvFromEventAndUserId(_: any, payload: { eventId: string; userId: string }) {
    const { eventId, userId } = payload;

    const preloads = [
      'event',
      'status',
      'pdvTickets:ticket:status',
      'pdvUsers'
    ];

    const params = new URLSearchParams();

    params.append('where[event_id][v]', eventId);
    params.append('whereHas[pdvUsers][user_id][v]', userId);
    params.append('limit', '9999');

    preloads.forEach(preload => params.append('preloads[]', preload));

    try {
      const response = await $axios.$get(`/pdvs?${params.toString()}`);

      const result = handleGetResponse(response, 'PDVs não encontrados', eventId, true);

      if (result && result.data) {

        // Se eu nao sou um usuário do PDV, procuro se sou promotor do evento
        if (result.data.length === 0) {

          const preloads = [
            'event',
            'status',
            'pdvTickets:ticket:status',
            'pdvUsers'
          ];

          const params = new URLSearchParams();

          params.append('where[event_id][v]', eventId);
          params.append('whereHas[event][promoter_id][v]', userId);
          params.append('limit', '9999');

          preloads.forEach(preload => params.append('preloads[]', preload));

          const promoterPdv = await $axios.$get(`/pdvs?${params.toString()}`);
          const promoterPdvData = handleGetResponse(promoterPdv, 'PDV não encontrado', eventId, true);

          if (promoterPdvData && promoterPdvData.data) {
            return { success: true, data: promoterPdvData.data };
          }

          return { success: false, error: 'Falha ao buscar PDV' };
        }
      }

      return { success: false, error: 'Falha ao buscar PDV' };
    } catch (error) {
      console.error('[PDV] Error fetching PDV from event and user:', error);
      return { success: false, error };
    }
  },

  reset({ commit }: any) {
    commit('SET_PDVS', []);
    commit('SET_SELECTED_PDV', null);
    commit('SET_STATUS_DEFAULT', null);
  },
}; 