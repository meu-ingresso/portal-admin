import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse } from '~/utils/responseHelpers';

@Module({
  name: 'status',
  stateFactory: true,
  namespaced: true,
})
export default class Status extends VuexModule {
  private statusData: { [key: string]: any[] } = {};
  private isLoading: boolean = false;

  public get $getStatusByModule() {
    return (module: string) => this.statusData[module] || [];
  }

  public get $isLoading() {
    return this.isLoading;
  }

  @Mutation
  private SET_STATUS_BY_MODULE({ module, data }: { module: string; data: any[] }) {
    this.statusData = {
      ...this.statusData,
      [module]: data,
    };
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
  public async fetchStatusByModule(module: string) {
    try {
      this.setLoading(true);

      const response = await $axios.$get(`statuses?where[module][v]=${module}&orderBy[]=name:asc`);

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error(`Falha ao buscar status do módulo: ${module}.`);
      }

      const data = response.body.result.data;

      // Salva os status no estado
      this.context.commit('SET_STATUS_BY_MODULE', { module, data });

      this.setLoading(false);

      return { success: true, data };
    } catch (error) {
      this.setLoading(false);
      console.error(`[STATUS] Error fetching status for module "${module}":`, error);
      throw error;
    }
  }

  @Action
  public async fetchStatusByModuleAndName(payload: { module: string, name: string }) {
    try {
      this.setLoading(true);

      const response = await $axios.$get(
        `statuses?where[module][v]=${payload.module}&where[name][v]=${payload.name}`
      );

      const responseData = handleGetResponse(response, 'Status não encontrado', null);

      return responseData[0];
    } catch (error) {
      console.error(`[STATUS] Error fetching status for module "${payload.module}" and name "${payload.name}":`, error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
}
