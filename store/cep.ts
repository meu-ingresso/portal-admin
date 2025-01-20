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
      const response = await $axios.$get(`https://viacep.com.br/ws/${cep}/json/`);
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
      console.warn('Erro ao buscar CEP na API ViaCEP:', error.message);

      try {
        const response = await $axios.$get(`https://brasilapi.com.br/api/cep/v2/${cep}`);
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
        };
      } catch (error) {
        console.error('Erro ao buscar CEP na API BrasilAPI:', error.message);
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
