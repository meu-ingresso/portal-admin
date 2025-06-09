import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse } from '~/utils/responseHelpers';

interface StatusState {
  statusData: { [key: string]: any[] };
  isLoading: boolean;
}

export const state = (): StatusState => ({
  statusData: {},
  isLoading: false,
});

export const getters = {
  $getStatusByModule: (state: StatusState) => (module: string) => state.statusData[module] || [],
  $isLoading: (state: StatusState) => state.isLoading,
};

export const mutations = {
  SET_STATUS_BY_MODULE(state: StatusState, { module, data }: { module: string; data: any[] }) {
    state.statusData = {
      ...state.statusData,
      [module]: data,
    };
  },

  SET_IS_LOADING(state: StatusState, value: boolean) {
    state.isLoading = value;
  },
};

export const actions = {
  setLoading({ commit }: any, value: boolean) {
    commit('SET_IS_LOADING', value);
  },

  async fetchStatusByModule({ commit, dispatch }: any, module: string) {
    try {
      dispatch('setLoading', true);

      const response = await $axios.$get(`statuses?where[module][v]=${module}&orderBy[]=name:asc`);

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error(`Falha ao buscar status do módulo: ${module}.`);
      }

      const data = response.body.result.data;

      // Salva os status no estado
      commit('SET_STATUS_BY_MODULE', { module, data });

      dispatch('setLoading', false);

      return { success: true, data };
    } catch (error) {
      dispatch('setLoading', false);
      console.error(`[STATUS] Error fetching status for module "${module}":`, error);
      throw error;
    }
  },

  async fetchStatusByModuleAndName({ dispatch }: any, payload: { module: string, name: string }) {
    try {
      dispatch('setLoading', true);

      const response = await $axios.$get(
        `statuses?where[module][v]=${payload.module}&where[name][v]=${payload.name}`
      );

      const responseResult = handleGetResponse(response, 'Status não encontrado', null);

      return responseResult.data[0];
    } catch (error) {
      console.error(`[STATUS] Error fetching status for module "${payload.module}" and name "${payload.name}":`, error);
      throw error;
    } finally {
      dispatch('setLoading', false);
    }
  },
};
