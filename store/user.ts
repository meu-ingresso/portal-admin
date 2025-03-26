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
  public async getUsers({ 
    page = 1, 
    limit = 12, 
    search, 
    sortBy = [], 
    sortDesc = [], 
    preloads = ['people'] 
  }: ExtendedSearchPayload) {
    try {
      const params = new URLSearchParams();

      // Paginação
      params.append('page', String(page));
      params.append('limit', String(limit));

      // Ordenação
      sortBy.forEach((field: string, index: number) => {
        const order = sortDesc[index] ? 'desc' : 'asc';
        params.append('orderBy[]', `${field}:${order}`);
      });

      // Busca
      if (search) {
        const searchValue = String(search);
        const encodedSearch = encodeURIComponent(searchValue);

        // Busca com OR em todos os campos relevantes
        params.append('search[email][o]', 'LIKE');
        params.append('search[email][v]', encodedSearch);
        params.append('search[people][first_name:last_name:social_name:tax:person_type][o]', 'LIKE');
        params.append('search[people][first_name:last_name:social_name:tax:person_type][v]', encodedSearch);
      }

      // Preloads
      const defaultPreloads = ['role', 'attachments'];
      [...new Set([...preloads, ...defaultPreloads])].forEach(preload => {
        if (preload === 'people') {
          params.append('preloads[]', 'people:address');
        } else {
          params.append('preloads[]', preload);
        }
      });

      const response = await $axios.$get(`users?${params.toString()}`);
      
      const result = handleGetResponse(response, 'Usuários não encontrados', null, true);

      if (result && result.data) {
        this.context.commit('SET_USER_LIST', result.data);
      }

      return {
        data: result.data,
        meta: result.meta,
        code: response.body.code
      };

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return {
        data: [],
        meta: {
          total: 0,
          perPage: limit,
          currentPage: page,
          lastPage: 1,
          firstPage: 1
        },
        code: 'SEARCH_NOTFOUND'
      };
    }
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
