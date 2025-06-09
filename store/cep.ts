import { $axios } from '@/utils/nuxt-instance';

interface CepState {
  isLoading: boolean;
}

export const state = (): CepState => ({
  isLoading: false,
});

export const getters = {
  $isLoading: (state: CepState) => state.isLoading,
};

export const mutations = {
  SET_IS_LOADING(state: CepState, value: boolean) {
    state.isLoading = value;
  },
};

export const actions = {
  setLoading({ commit }: any, value: boolean) {
    commit('SET_IS_LOADING', value);
  },

  async fetchCep({ dispatch }: any, cep: string) {
    dispatch('setLoading', true);

    try {
      const response = await $axios.$get(`https://brasilapi.com.br/api/cep/v2/${cep}`, { timeout: 5000 });
      if (
        !response.street ||
        !response.neighborhood ||
        !response.city ||
        !response.state
      ) {
        throw new Error('CEP não encontrado na API BrasilAPI');
      }

      dispatch('setLoading', false);

      return {
        street: response.street,
        neighborhood: response.neighborhood,
        city: response.city,
        state: response.state,
        latitude: response.location?.coordinates?.latitude,
        longitude: response.location?.coordinates?.longitude,
      };
    } catch (error) {
      try {
        const response = await $axios.$get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 5000 });
        if (
          !response.logradouro ||
          !response.bairro ||
          !response.localidade ||
          !response.uf
        ) {
          throw new Error('CEP não encontrado na API ViaCEP');
        }
        dispatch('setLoading', false);
        return {
          street: response.logradouro,
          neighborhood: response.bairro,
          city: response.localidade,
          state: response.uf,
          state_name: response.estado,
        };
      } catch (error) {
        dispatch('setLoading', false);
        return {
          street: null,
          neighborhood: null,
          city: null,
          state: null,
        };
      }
    }
  },
};
