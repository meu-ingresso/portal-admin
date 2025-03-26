/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload as BaseSearchPayload, PeoplePayload, UserWithRelations, RolePayload } from '@/models';
import { handleGetResponse, handleUpdateResponse } from '~/utils/responseHelpers';

interface ExtendedSearchPayload extends BaseSearchPayload {
  preloads?: string[];
}

@Module({ name: 'user', stateFactory: true, namespaced: true })
export default class User extends VuexModule {
  private user: UserWithRelations = {
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
      address: {
        id: '',
        street: '',
        number: '',
        neighborhood: '',
        zipcode: '',
        city: '',
        state: '',
      },
    },
    role: {
      id: '',
      name: '',
      description: '',
      created_at: '',
      updated_at: '',
    },
    attachments: [],
  };

  private copyUser: UserWithRelations = {
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
      address: {
        id: '',
        street: '',
        number: '',
        neighborhood: '',
        zipcode: '',
        city: '',
        state: '',
      },
    },
    role: {
      id: '',
      name: '',
      description: '',
    },
    attachments: [],
  };

  private userList = [];

  private roleList = [];

  public get $user() {
    return this.user;
  }

  public get $people() {
    return this.user.people;
  }

  public get $userList() {
    return this.userList;
  }

  public get $roleList() {
    return this.roleList;
  }

  @Mutation
  private SET_USER(payload: UserWithRelations) {
    this.user = payload;
    this.copyUser = { ...this.user };
  }

  @Mutation
  private SET_USER_LIST(data: UserWithRelations[]) {
    this.userList = data;
  }

  @Mutation
  private SET_ROLE_LIST(data: RolePayload[]) {
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
        address: {
          id: '',
          street: '',
          number: '',
          neighborhood: '',
          zipcode: '',
          city: '',
          state: '',
        },
      },
      role: {
        id: '',
        name: '',
        description: '',
      },
      attachments: [],
    };
    this.copyUser = { ...this.user };
  }

  @Action
  public async get(user_id: string) {

    const response = await $axios.$get(`users?where[id][v]=${user_id}&preloads[]=people:address&preloads[]=role&preloads[]=attachments`);
    
    const result = handleGetResponse(response, 'Usuário não encontrado', null, true);

    if (result && result.data) {
      this.context.commit('SET_USER', result.data[0]);
    }

    return result.data[0];
  }

  @Action
  public async getAllUsers() {
    const response = await $axios
      .$get('users?preloads[]=people:address&preloads[]=role&preloads[]=attachments&limit=9999');
    
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

    try {
      const updatedPeople = await $axios.$patch('people', {
        data: [
          {
            ...payload,
          },
        ],
      });

      const result = handleUpdateResponse(updatedPeople, 'Pessoa não encontrada', null);

      return result;
    } catch (error) {
      return error;
    }
  }

  @Action
  public reset() {
    this.context.commit('RESET');
  }
}
