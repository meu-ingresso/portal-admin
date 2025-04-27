import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
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

@Module({
  name: 'userAddress',
  stateFactory: true,
  namespaced: true,
})
export default class UserAddress extends VuexModule {
  private isLoading: boolean = false;
  private address = {
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
    isApiZipcode: false
  };

  public get $isLoading() {
    return this.isLoading;
  }

  public get $address() {
    return this.address;
  }

  public get $addressIsValid() {
    const { street, number, neighborhood, city, state, zipcode } = this.address;

    return Boolean(
      street && street !== '' &&
      number && number !== '' &&
      neighborhood && neighborhood !== '' &&
      city && city !== '' &&
      state && state !== '' &&
      zipcode && zipcode !== ''
    );
  }

  @Mutation
  private SET_LOADING(payload: boolean) {
    this.isLoading = payload;
  }

  @Mutation
  private SET_ADDRESS(payload: any) {
    this.address = { ...this.address, ...payload };
  }

  @Mutation
  private RESET_ADDRESS() {
    this.address = {
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
      isApiZipcode: false
    };
  }

  @Action
  public updateAddress(payload: Partial<UserAddressPayload>) {
    this.context.commit('SET_ADDRESS', payload);
  }

  @Action
  public resetAddress() {
    this.context.commit('RESET_ADDRESS');
  }

  @Action
  public async fetchUserAddress(peopleId: string) {
    try {
      this.context.commit('SET_LOADING', true);

      if (!peopleId) {
        throw new Error('ID de pessoa não encontrado');
      }

      const response = await $axios.$get(`people?where[id][v]=${peopleId}&preloads[]=address`);
      const { data } = handleGetResponse(response, 'Informações de endereço não encontradas', null, true);

      if (data && data.length > 0 && data[0].address) {
        const address = data[0].address;
        const isApiZipcode = this.address.isApiZipcode !== undefined ? 
          this.address.isApiZipcode : 
          !!address.zipcode;
        
        this.context.commit('SET_ADDRESS', {
          ...address,
          isApiZipcode
        });
      }

      return data[0];
    } catch (error) {
      console.error('Erro ao buscar endereço do usuário:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async createUserAddress(payload: UserAddressPayload) {
    try {
      this.context.commit('SET_LOADING', true);

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
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async updateUserAddress(payload: { addressId: string, data: Partial<UserAddressPayload> }) {
    try {
      this.context.commit('SET_LOADING', true);

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

      this.context.commit('SET_ADDRESS', result[0]);

      return result[0];
    } catch (error) {
      console.error('Erro ao atualizar endereço do usuário:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async deleteUserAddress(addressId: string) {
    try {
      this.context.commit('SET_LOADING', true);

      const response = await $axios.$delete(`address/${addressId}`);

      const result = handleDeleteResponse(response, 'Falha ao deletar endereço', null);

      return result;
    } catch (error) {
      console.error('Erro ao deletar endereço do usuário:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }
} 