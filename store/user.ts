/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload as BaseSearchPayload, PeoplePayload, UserWithRelations, RolePayload, UserPayload } from '@/models';
import { handleGetResponse, handleUpdateResponse, handleDeleteResponse } from '~/utils/responseHelpers';

interface ExtendedSearchPayload extends BaseSearchPayload {
  preloads?: string[];
  roleFilter?: string | string[];
  personType?: string;
  verifiedStatus?: string;
  startDate?: string;
  endDate?: string;
  active?: string;
  includeEventCount?: boolean;
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
  public async getById(payload: { user_id: string, commit?: boolean }) {

    try {

      const response = await $axios.$get(`users?where[id][v]=${payload.user_id}&preloads[]=people:address&preloads[]=role&preloads[]=attachments`);
      
      const result = handleGetResponse(response, 'Usuário não encontrado', null, true);

      if (result && result.data) {
        if (payload.commit) {
          this.context.commit('SET_USER', result.data[0]);
        }

        return result.data[0];
      }

      return null;

    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
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
  public async getUsersByRole({ 
    page = 1, 
    limit = 50, 
    search, 
    sortBy = [], 
    sortDesc = [], 
    preloads = ['people'],
    roleFilter,
    personType,
    verifiedStatus,
    startDate,
    endDate,
    active,
    includeEventCount = false
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

      // Filtro por role
      if (roleFilter) {
        if (Array.isArray(roleFilter)) {
          params.append('whereHas[role][name][o]', 'IN');
          roleFilter.forEach((role: string) => {
            params.append('whereHas[role][name][v][]', role);
          });
        } else {
          params.append('whereHas[role][name][v]', roleFilter);
        }
      }

      // Filtro por tipo de pessoa
      if (personType) {
        params.append('whereHas[people][person_type][v]', personType);
      }

      // Filtro por status de verificação
      if (verifiedStatus) {
        params.append('where[account_verified][v]', verifiedStatus === 'verified' ? 'true' : 'false');
      }

      // Filtro por data de cadastro
      if (startDate) {
        params.append('where[created_at][gte]', startDate);
      }
      if (endDate) {
        params.append('where[created_at][lte]', endDate);
      }

      // Filtro por status ativo/inativo
      if (active) {
        if (active === 'active') {
          params.append('whereNull[deleted_at]', 'true');
        } else if (active === 'inactive') {
          params.append('whereNotNull[deleted_at]', 'true');
        }
      }

      // Preloads
      const defaultPreloads = ['role'];
      [...new Set([...preloads, ...defaultPreloads])].forEach(preload => {
        if (preload === 'people') {
          params.append('preloads[]', 'people:address');
        } else {
          params.append('preloads[]', preload);
        }
      });

      // Incluir contagem de eventos para organizadores
      if (includeEventCount) {
        params.append('includeEventCount', 'true');
      }

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
      console.error('Erro ao buscar usuários por função:', error);
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
  public async updateUser(payload: UserPayload) {
    try {

      const response = await $axios.$patch('user', {
        data: [
          {
            ...payload,
          },
        ],
      });

      const result = handleUpdateResponse(response, 'Usuário não encontrado', null);

      return result;
      
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return error;
    }

  }

  @Action
  public reset() {
    this.context.commit('RESET');
  }

  @Action
  public async createUser(payload: {
    email: string;
    role_id: string;
    people_id?: string;
    password?: string;
    require_password_change?: boolean;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    alias?: string;
  }) {
    try {
      // Se não foi fornecido um people_id, criamos uma pessoa básica
      let peopleId = payload.people_id;
      
      if (!peopleId) {
        const peopleResponse = await $axios.$post('people', {
          data: [{
            first_name: payload.firstName || '',
            last_name: payload.lastName || '',
            person_type: 'PF',
            email: payload.email,
            birth_date: payload.birthDate || '2000-01-01',
          }]
        });
        
        if (!peopleResponse.body || peopleResponse.body.code !== 'CREATE_SUCCESS') {
          throw new Error('Falha ao criar pessoa');
        }
        
        peopleId = peopleResponse.body.result[0].id;
      }
      
      // Gerar senha temporária se não fornecida
      const password = payload.password || '123456';

      const alias = payload.alias || `${payload.firstName}-${payload.lastName}`;
      
      // Criar usuário
      const userResponse = await $axios.$post('user', {
        data: [{
          people_id: peopleId,
          email: payload.email,
          role_id: payload.role_id,
          password,
          alias: alias.substring(0, 30),
        }]
      });
      
      if (!userResponse.body || userResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar usuário');
      }
      
      return {
        success: true,
        data: userResponse.body.result[0],
        password
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  @Action
  public async getRoleByName(roleName: string) {
    try {
      const response = await $axios.$get('roles?where[name][v]=' + encodeURIComponent(roleName));
      
      const result = handleGetResponse(response, 'Cargo não encontrado', null, true);

      if (result && result.data && result.data.length > 0) {
        return {
          success: true,
          data: result.data[0]
        };
      }
      
      return {
        success: false,
        error: 'Cargo não encontrado'
      };
    } catch (error) {
      console.error('Erro ao buscar cargo por nome:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }


  @Action
  public async deleteUser(payload: { user_id: string }) {
    try {
      const response = await $axios.$delete(`user/${payload.user_id}`);

      const result = handleDeleteResponse(response, 'Usuário não encontrado', null);

      return result;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return error;
    }
  }

  @Action
  public async findUserByEmail(email: string) {
    try {
      const response = await $axios.$get(`users?where[email][v]=${encodeURIComponent(email)}`);
      
      const result = handleGetResponse(response, 'Usuário não encontrado', null, true);
      
      if (result && result.data && result.data.length > 0) {
        return {
          success: true,
          exists: true,
          data: result.data[0]
        };
      }
      
      return {
        success: true,
        exists: false
      };
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }
}
