/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { $axios } from '@/utils/nuxt-instance';

import { SearchPayload } from '@/models';
import { handleGetResponse } from '~/utils/responseHelpers';

interface CreatePayload {
  first_name: String;
  last_name: String;
  cellphone: String;
  email: String;
  password: String;
  id_erp?: String;
  hiring_mode: String;
  role_id: String;
  is_active: Boolean;
  sellers: Array<String>;
}

@Module({ name: 'user', stateFactory: true, namespaced: true })
export default class User extends VuexModule {
  private user: any = {
    id: '',
    first_name: '',
    last_name: '',
    cellphone: '',
    email: undefined,
    password: '',
    id_erp: '',
    hiring_mode: '',
    role_id: '',
    is_active: true,
    sellers: [],
  };

  private copyUser: any = {
    id: '',
    first_name: '',
    last_name: '',
    cellphone: '',
    email: undefined,
    password: '',
    id_erp: '',
    hiring_mode: '',
    role_id: '',
    is_active: true,
    sellers: [],
  };

  private userList = [];

  private roleList = [];

  public get $user() {
    return this.user;
  }

  public get $userList() {
    return this.userList;
  }

  public get $roleList() {
    return this.roleList;
  }

  @Mutation
  private SET_USER(payload: any) {
    this.user = payload;
    this.copyUser = { ...this.user };
  }

  @Mutation
  private SET_USER_LIST(data: any) {
    this.userList = data;
  }

  @Mutation
  private SET_ROLE_LIST(data: any) {
    this.roleList = data;
  }

  @Mutation
  private RESET() {
    this.user = {
      id: undefined,
      first_name: '',
      last_name: '',
      cellphone: '',
      email: undefined,
      password: '',
      id_erp: '',
      hiring_mode: '',
      role_id: '',
      is_active: true,
      sellers: [],
    };
    this.copyUser = { ...this.user };
  }

  @Action
  public async create(payload: CreatePayload) {
    return await $axios
      .$post('user', payload)
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
  public async update() {
    const payload: any = {
      id: this.user.id,
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      cellphone: this.user.cellphone,
      email: this.user.email,
      password: this.user.password,
      id_erp: this.user.id_erp,
      hiring_mode: this.user.hiring_mode,
      role_id: this.user.role_id,
      is_active: this.user.is_active,
      sellers: this.user.sellers,
    };

    if (this.user.password !== this.copyUser.password) {
      payload.password = this.user.password;
    }

    return await $axios
      .$patch('user', payload)
      .then((response) => {
        if (response.body && response.body.code !== 'UPDATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public async get(user_id: string) {
    return await $axios
      .$get(`users?where[id][v]=${user_id}&preloads[]=groupMainUser`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_USER', response.body.result.data[0]);

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
  public async getAllUsers() {
    const response = await $axios
      .$get('users?preloads[]=people');
    
    const responseResult = handleGetResponse(response, 'Usuários não encontrados', null, true);

    if (responseResult && responseResult.data) {
      this.context.commit('SET_USER_LIST', responseResult.data);
    }

    return response;
  }

  @Action
  public async getUsers({ page, limit, search, sortBy, sortDesc }: SearchPayload) {
    let filter = '';
    let filter2 = '';
    let orderAux = '';

    filter += page ? `page=${page}&` : '';
    filter += limit ? `limit=${limit}&` : '';

    for (let i = 0; i < sortBy.length; i++) {
      const sortDescAux = sortDesc[i] ? 'desc' : 'asc';
      orderAux += `&orderBy[]=${sortBy[i]}:${sortDescAux}`;
    }

    if (search) {
      const newString = encodeURIComponent(`${search}`);
      filter2 += `&search[first_name][o]=_LIKE_&search[first_name][v]=${newString}&search[last_name][o]=_LIKE_&search[last_name][v]=${newString}&search[email][o]=_LIKE_&search[email][v]=${newString}`;
    }

    const status = await $axios
      .$get(`users?${filter}${filter2}&preloads[]=role${orderAux}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_USER_LIST', response.body.result.data);

        return {
          data: response.body.result.data,
          code: response.body.code,
          total: response.body.result.meta.total,
        };
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'SEARCH_NOTFOUND',
          total: 0,
        };
      });
    return status;
  }

  @Action
  public async getRoles() {
    return await $axios
      .$get('roles')
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_ROLE_LIST', response.body.result.data);

        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'SEARCH_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public reset() {
    this.context.commit('RESET');
  }
}
