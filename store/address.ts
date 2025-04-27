import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
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

@Module({
  name: 'address',
  stateFactory: true,
  namespaced: true,
})
export default class Address extends VuexModule {
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
  };

  public get $isLoading() {
    return this.isLoading;
  }

  public get $address() {
    return this.address;
  }

  public get $addressIsValid() {
    const { street, number, neighborhood, city, state, zipcode } = this.address;
    return street && number && neighborhood && city && state && zipcode;
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
    };
  }

  @Action
  public updateAddress(payload: Partial<AddressPayload>) {
    this.context.commit('SET_ADDRESS', payload);
  }

  @Action
  public resetAddress() {
    this.context.commit('RESET_ADDRESS');
  }

  @Action
  public async fetchGetAddress(addressId: string) {
    try {
      this.context.commit('SET_LOADING', true);

      if (!addressId) {
        throw new Error('ID de endereço não encontrado');
      }

      const response = await $axios.$get(`addresses?where[id][v]=${addressId}`);
      const { data } = handleGetResponse(response, 'Informações de endereço não encontradas', null, true);

      if (data && data.length > 0 && data[0].address) {
        const address = data[0].address;

        this.context.commit('SET_ADDRESS', {
          ...address,
        });
      }

      return this.address;
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchCreateAddress(payload: AddressPayload) {
    try {
      this.context.commit('SET_LOADING', true);

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
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchUpdateAddress(payload: { addressId: string, payload: Partial<AddressPayload> }) {
    try {
      this.context.commit('SET_LOADING', true);

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
      this.context.commit('SET_LOADING', false);
    }
  }


  @Action
  public async fetchDeleteAddress(addressId: string) {
    try {
      this.context.commit('SET_LOADING', true);

      const response = await $axios.$delete(`address/${addressId}`);
      const { data } = handleDeleteResponse(response, 'Falha ao deletar endereço', null);

      return data;
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }
} 