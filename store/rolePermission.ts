import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

interface CreatePayload {
  role_id: String;
  permission_id: String;
}

interface UpdatePayload {
  id: String;
}

@Module({
  name: 'rolePermission',
  stateFactory: true,
  namespaced: true,
})
export default class RolePermission extends VuexModule {
  private rolePermissionList = [];

  public get $rolePermissionList() {
    return this.rolePermissionList;
  }

  @Mutation
  private SET_ROLE_PERMISSION_LIST(data: any) {
    this.rolePermissionList = data;
  }

  @Action
  public async getAll() {
    return await $axios
      .$get(`roles/permissions?limit=999&preloads[]=role&preloads[]=permission`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_ROLE_PERMISSION_LIST', response.body.result.data);
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

  @Action
  public async create(payload: CreatePayload) {
    return await $axios
      .$post('role/permission', payload)
      .then((response) => {
        if (response.body && response.body.code !== 'CREATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public async update(payload: UpdatePayload) {
    return await $axios
      .$patch('role/permission', payload)
      .then((response) => {
        if (response.body && response.body.code !== 'UPDATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }
}
