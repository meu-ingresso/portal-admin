import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'shipowner',
  stateFactory: true,
  namespaced: true,
})
export default class Shipowner extends VuexModule {
  private shipownerList = [];

  public get $shipownerList() {
    return this.shipownerList;
  }

  @Mutation
  private SET_SHIPOWNER_LIST(data: any) {
    this.shipownerList = data;
  }

  @Action
  public async getAll() {
    return await $axios
      .$get(`shipowners?limit=50&orderBy[]=name:asc`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_SHIPOWNER_LIST', response.body.result.data);
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
