import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'role',
  stateFactory: true,
  namespaced: true,
})
export default class Role extends VuexModule {
  private roleList = [];

  public get $roleList() {
    return this.roleList;
  }

  @Mutation
  private SET_ROLE_LIST(data: any) {
    this.roleList = data;
  }

  @Action
  public async getAll() {
    return await $axios
      .$get(`roles?limit=50&orderBy[]=name:asc`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_ROLE_LIST', response.body.result.data);
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
