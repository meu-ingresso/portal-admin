import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'container',
  stateFactory: true,
  namespaced: true,
})
export default class Container extends VuexModule {
  private containerList = [];

  public get $containerList() {
    return this.containerList;
  }

  @Mutation
  private SET_CONTAINER_LIST(data: any) {
    this.containerList = data;
  }

  @Action
  public async getAll() {
    return await $axios
      .$get(`containers?limit=50&orderBy[]=name:asc`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_CONTAINER_LIST', response.body.result.data);
        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }
}
