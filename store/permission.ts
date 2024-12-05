import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'permission',
  stateFactory: true,
  namespaced: true,
})
export default class Permission extends VuexModule {
  private permissionList = [];

  public get $permissionList() {
    return this.permissionList;
  }

  @Mutation
  private SET_PERMISSION_LIST(data: any) {
    this.permissionList = data;
  }

  @Action
  public async getAll() {
    return await $axios
      .$get(`permissions?limit=9990&orderBy[]=module_name:asc`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_PERMISSION_LIST', response.body.result.data);
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
