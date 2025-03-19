/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { $axios } from '@/utils/nuxt-instance';

import { SearchPayload as BaseSearchPayload } from '@/models';
import { handleGetResponse } from '~/utils/responseHelpers';
import { RoleApiResponse, UserApiResponse } from '~/models/event';

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

interface PeoplePayload {
  id: string;
  person_type?: 'PF' | 'PJ';
  first_name?: string;
  last_name?: string;
}

interface ExtendedSearchPayload extends BaseSearchPayload {
  preloads?: string[];
}

@Module({ name: 'user', stateFactory: true, namespaced: true })
export default class User extends VuexModule {
  private user: UserApiResponse = {
    id: '',
    people_id: '',
    email: '',
    alias: '',
    role_id: '',
    account_verified: false,
    created_at: '',
    updated_at: '',
    deleted_at: '',
    people: {
      id: '',
      first_name: '',
      last_name: '',
      person_type: 'PF',
      tax: '',
      phone: '',
      email: '',
      created_at: '',
      updated_at: '',
    },
    role: {
      id: '',
      name: '',
      description: '',
    },
  };

  private copyUser: UserApiResponse = {
    id: '',
    people_id: '',
    email: '',
    alias: '',
    role_id: '',
    account_verified: false,
    created_at: '',
    updated_at: '',
    deleted_at: '',
    people: {
      id: '',
      first_name: '',
      last_name: '',
      person_type: 'PF',
      tax: '',
      phone: '',
      email: '',
      created_at: '',
      updated_at: '',
    },
    role: {
      id: '',
      name: '',
      description: '',
    },
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
  private SET_USER(payload: UserApiResponse) {
    this.user = payload;
    this.copyUser = { ...this.user };
  }

  @Mutation
  private SET_USER_LIST(data: UserApiResponse[]) {
    this.userList = data;
  }

  @Mutation
  private SET_ROLE_LIST(data: RoleApiResponse[]) {
    this.roleList = data;
  }

  @Mutation
  private RESET() {
    this.user = {
      id: '',
      people_id: '',
      email: '',
      alias: '',
      role_id: '',
      account_verified: false,
      created_at: '',
      updated_at: '',
      deleted_at: '',
      people: {
        id: '',
        first_name: '',
        last_name: '',
        person_type: 'PF',
        tax: '',
        phone: '',
        email: '',
        created_at: '',
        updated_at: '',
      },
      role: {
        id: '',
        name: '',
        description: '',
      },
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
    const payload: UserApiResponse = {
      id: this.user.id,
      people_id: this.user.people_id,
      email: this.user.email,
      alias: this.user.alias,
      role_id: this.user.role_id,
      account_verified: this.user.account_verified,
      created_at: this.user.created_at,
      updated_at: this.user.updated_at,
      deleted_at: this.user.deleted_at,
      people: this.user.people,
      role: this.user.role,
    };

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

    const response = await $axios.$get(`users?where[id][v]=${user_id}&preloads[]=people&preloads[]=role`);
    
    const result = handleGetResponse(response, 'Usuário não encontrado', null, true);

    if (result && result.data) {
      this.context.commit('SET_USER', result.data[0]);
    }

    return result.data[0];
  }

  @Action
  public async getAllUsers() {
    const response = await $axios
      .$get('users?preloads[]=people&preloads[]=role');
    
    const responseResult = handleGetResponse(response, 'Usuários não encontrados', null, true);

    if (responseResult && responseResult.data) {
      this.context.commit('SET_USER_LIST', responseResult.data);
    }

    return response;
  }

  @Action
  public async getUsers({ page, limit, search, sortBy, sortDesc, preloads = ['people'] }: ExtendedSearchPayload) {
    let filter = '';
    let filter2 = '';
    let orderAux = '';
    let preloadsStr = '';

    filter += page ? `page=${page}&` : '';
    filter += limit ? `limit=${limit}&` : '';
    
    // Add preloads if provided
    if (preloads && preloads.length > 0) {
      preloadsStr = preloads.map(preload => `preloads[]=${preload}`).join('&');
      if (preloadsStr) {
        preloadsStr = `&${preloadsStr}`;
      }
    }

    for (let i = 0; i < sortBy.length; i++) {
      const sortDescAux = sortDesc[i] ? 'desc' : 'asc';
      orderAux += `&orderBy[]=${sortBy[i]}:${sortDescAux}`;
    }

    if (search) {
      const newString = encodeURIComponent(`${search}`);
      filter2 += `&search[people][first_name:last_name][o]=LIKE&search[people][first_name:last_name][v]=${newString}&search[email][o]=LIKE&search[email][v]=${newString}`;
    }

    const status = await $axios
      .$get(`users?${filter}${filter2}&preloads[]=role${preloadsStr}${orderAux}`)
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
  public async updatePeople(payload: PeoplePayload) {
    return await $axios.$patch('people', {
      data: [
        {
          ...payload,
        },
      ],
    });
  }

  @Action
  public reset() {
    this.context.commit('RESET');
  }
}
