import { $axios } from '@/utils/nuxt-instance';
import { handleDeleteResponse, handleGetResponse, handleUpdateResponse } from '~/utils/responseHelpers';

export interface AddressPayload {
  street: string;
  number: string;
  zipcode: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  isApiZipcode?: boolean;
}

interface AddressState {
  isLoading: boolean;
  address: {
    id: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
    latitude: number | null;
    longitude: number | null;
    deleted_at: string | null;
  };
}

export const state = (): AddressState => ({
  isLoading: false,
  address: {
    id: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: '',
    latitude: null,
    longitude: null,
    deleted_at: null,
  },
});

export const getters = {
  $isLoading: (state: AddressState) => state.isLoading,
  $address: (state: AddressState) => state.address,
  $addressIsValid: (state: AddressState) => {
    const { street, number, neighborhood, city, state: addressState, zipcode } = state.address;
    return street && number && neighborhood && city && addressState && zipcode;
  },
};

export const mutations = {
  SET_LOADING(state: AddressState, payload: boolean) {
    state.isLoading = payload;
  },

  SET_ADDRESS(state: AddressState, payload: any) {
    state.address = { ...state.address, ...payload };
  },

  RESET_ADDRESS(state: AddressState) {
    state.address = {
      id: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: '',
      latitude: null,
      longitude: null,
      deleted_at: null,
    };
  },
};

export const actions = {
  updateAddress({ commit }: any, payload: Partial<AddressPayload>) {
    commit('SET_ADDRESS', payload);
  },

  resetAddress({ commit }: any) {
    commit('RESET_ADDRESS');
  },

  async fetchGetAddress({ commit, state }: any, addressId: string) {
    try {
      commit('SET_LOADING', true);

      if (!addressId) {
        throw new Error('ID de endereço não encontrado');
      }

      const response = await $axios.$get(`addresses?where[id][v]=${addressId}`);
      const { data } = handleGetResponse(response, 'Informações de endereço não encontradas', null, true);

      if (data && data.length > 0 && data[0].address) {
        const address = data[0].address;

        commit('SET_ADDRESS', {
          ...address,
        });
      }

      return state.address;
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchCreateAddress({ commit }: any, payload: AddressPayload) {
    try {
      commit('SET_LOADING', true);

      const addressResponse = await $axios.$post('address', {
        data: [
          {
            street: payload.street,
            number: payload.number,
            complement: payload.complement || '',
            neighborhood: payload.neighborhood,
            city: payload.city,
            state: payload.state,
            zipcode: payload.zipcode,
            latitude: payload.latitude || null,
            longitude: payload.longitude || null,
          },
        ],
      });

      if (!addressResponse.body || addressResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar endereço');
      }

      const addressId = addressResponse.body.result[0].id;

      return addressId;
    } catch (error) {
      console.error('Erro ao criar endereço:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchUpdateAddress({ commit }: any, payload: { addressId: string, payload: Partial<AddressPayload> }) {
    try {
      commit('SET_LOADING', true);

      const addressResponse = await $axios.$patch('address', {
        data: [
          {
            id: payload.addressId,
            ...payload.payload
          },
        ],
      });

      const { data } = handleUpdateResponse(addressResponse, 'Falha ao atualizar endereço', null);

      return data;
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchDeleteAddress({ commit }: any, addressId: string) {
    try {
      commit('SET_LOADING', true);

      const response = await $axios.$delete(`address/${addressId}`);
      const { data } = handleDeleteResponse(response, 'Falha ao deletar endereço', null);

      return data;
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
}; 