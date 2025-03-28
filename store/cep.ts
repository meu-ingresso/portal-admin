import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'cep',
  stateFactory: true,
  namespaced: true,
})
export default class Cep extends VuexModule {
  private isLoading: boolean = false;

  public get $isLoading() {
    return this.isLoading;
  }

  @Mutation
  private SET_IS_LOADING(value: boolean) {
    this.isLoading = value;
  }

  @Action
  public setLoading(value: boolean) {
    this.context.commit('SET_IS_LOADING', value);
  }

  @Action
  public async fetchCep(cep: string) {
    this.setLoading(true);

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

      this.setLoading(false);

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
        this.setLoading(false);
        return {
          street: response.logradouro,
          neighborhood: response.bairro,
          city: response.localidade,
          state: response.uf,
          state_name: response.estado,
        };
      } catch (error) {
        this.setLoading(false);
        return {
          street: null,
          neighborhood: null,
          city: null,
          state: null,
        };
      }
    }
  }
}
