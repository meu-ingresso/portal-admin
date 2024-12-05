import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'modal',
  stateFactory: true,
  namespaced: true,
})
export default class Modal extends VuexModule {
  private modalList = [];

  public get $modalList() {
    return this.modalList;
  }

  @Mutation
  private SET_MODAL_LIST(data: any) {
    this.modalList = data;
  }

  @Action
  public async getAll() {
    return await $axios
      .$get(`modals?limit=50&orderBy[]=name:asc`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_MODAL_LIST', response.body.result.data);
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
