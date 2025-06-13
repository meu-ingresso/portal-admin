
import { $axios } from '@/utils/nuxt-instance';
import { handleDeleteResponse, handleGetResponse, handleUpdateResponse } from '~/utils/responseHelpers';

export interface UserAddressPayload {
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

interface UserAddressState {
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
    isApiZipcode: boolean;
  };
}

export const state = (): UserAddressState => ({
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
    isApiZipcode: false,
  },
});

export const getters = {
  $isLoading: (state: UserAddressState) => state.isLoading,
  $address: (state: UserAddressState) => state.address,
  $addressIsValid: (state: UserAddressState) => {
    const { street, number, neighborhood, city, state: addressState, zipcode } = state.address;

    return Boolean(
      street && street !== '' &&
      number && number !== '' &&
      neighborhood && neighborhood !== '' &&
      city && city !== '' &&
      addressState && addressState !== '' &&
      zipcode && zipcode !== ''
    );
  },
};

export const mutations = {
  SET_LOADING(state: UserAddressState, payload: boolean) {
    state.isLoading = payload;
  },

  SET_ADDRESS(state: UserAddressState, payload: any) {
    state.address = { ...state.address, ...payload };
  },

  RESET_ADDRESS(state: UserAddressState) {
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
      isApiZipcode: false,
    };
  },
};

export const actions = {
  updateAddress({ commit }: any, payload: Partial<UserAddressPayload>) {
    commit('SET_ADDRESS', payload);
  },

  resetAddress({ commit }: any) {
    commit('RESET_ADDRESS');
  },

  async fetchUserAddress({ commit, state }: any, peopleId: string) {
    try {
      commit('SET_LOADING', true);

      if (!peopleId) {
        throw new Error('ID de pessoa não encontrado');
      }

      const response = await $axios.$get(`people?where[id][v]=${peopleId}&preloads[]=address`);
      const { data } = handleGetResponse(response, 'Informações de endereço não encontradas', null, true);

      if (data && data.length > 0 && data[0].address) {
        const address = data[0].address;
        const isApiZipcode = state.address.isApiZipcode !== undefined ? 
          state.address.isApiZipcode : 
          !!address.zipcode;
        
        commit('SET_ADDRESS', {
          ...address,
          isApiZipcode
        });
      }

      return data[0];
    } catch (error) {
      console.error('Erro ao buscar endereço do usuário:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createUserAddress({ commit }: any, payload: UserAddressPayload) {
    try {
      commit('SET_LOADING', true);

      const { ...addressData } = payload;

      const addressResponse = await $axios.$post('address', {
        data: [
          {
            street: addressData.street,
            number: addressData.number,
            complement: addressData.complement || '',
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state,
            zipcode: addressData.zipcode,
            latitude: addressData.latitude || null,
            longitude: addressData.longitude || null,
          },
        ],
      });

      if (!addressResponse.body || addressResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar endereço');
      }

      const addressId = addressResponse.body.result[0].id;

      return addressId;
    } catch (error) {
      console.error('Erro ao criar endereço do usuário:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateUserAddress({ commit }: any, payload: { addressId: string, data: Partial<UserAddressPayload> }) {
    try {
      commit('SET_LOADING', true);

      const { addressId, data } = payload;

      const addressResponse = await $axios.$patch('address', {
        data: [
          {
            id: addressId,
            ...data
          },
        ],
      });

      const result = handleUpdateResponse(addressResponse, 'Falha ao atualizar endereço', null);

      commit('SET_ADDRESS', result[0]);

      return result[0];
    } catch (error) {
      console.error('Erro ao atualizar endereço do usuário:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteUserAddress({ commit }: any, addressId: string) {
    try {
      commit('SET_LOADING', true);

      const response = await $axios.$delete(`address/${addressId}`);

      const result = handleDeleteResponse(response, 'Falha ao deletar endereço', null);

      return result;
    } catch (error) {
      console.error('Erro ao deletar endereço do usuário:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
}; 