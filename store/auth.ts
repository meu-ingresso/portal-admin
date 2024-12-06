import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { $axios, $cookies } from '@/utils/nuxt-instance';

interface LoginPayload {
  user_id: string;
  email: string;
  password: string;
}

interface UpdatePayload {
  token?: string;
  permission?: Object[];
  roles?: Object[];
}

type Token = string | null;

@Module({
  name: 'auth',
  stateFactory: true,
  namespaced: true,
})
export default class Auth extends VuexModule {
  private isError = false;
  private credentials: LoginPayload = {
    user_id: undefined,
    email: '',
    password: '',
  };

  private token = {} as Token;

  public get $token() {
    return this.token;
  }

  public get $credentials() {
    return this.credentials;
  }

  public get $statusError() {
    return this.isError;
  }

  @Mutation
  private UPDATE_TOKEN(result: any) {
    if (!result) {
      this.token = result;
      return;
    }

    if (typeof result === 'string') {
      this.token = result;
      this.credentials.user_id = $cookies.get('user_id');
      return;
    }

    this.token = result.token;
    this.credentials.user_id = result.payload.id;
    this.credentials.email = '';
    this.credentials.password = '';
  }

  @Mutation
  private SET_ERROR() {
    this.isError = true;
  }

  @Mutation
  private REMOVE_ERROR() {
    this.isError = false;
  }

  @Action
  public async login(payload: LoginPayload) {
    // Simulação de login para ambiente de desenvolvimento

    if (process.env.NODE_ENV === 'development') {
      const mockResponse = {
        code: 'LOGIN_SUCCESS',
        result: {
          token: 'mocked-token',
          payload: {
            id: 'b10b507a-5b4e-474d-b8dc-9d9984630754',
            name: 'Mock User',
            email: payload.email,
            role: 'admin',
            id_erp: 'erp_123',
            sellers: [],
            permissions: ['read', 'write'],
          },
        },
      };

      const age = 60 * 60 * 24 * 7;

      $cookies.set('token', mockResponse.result.token, {
        path: '/',
        maxAge: age,
      });

      $cookies.set('user_id', mockResponse.result.payload.id, {
        path: '/',
        maxAge: age,
      });

      $cookies.set('username', mockResponse.result.payload.name, {
        path: '/',
        maxAge: age,
      });

      $cookies.set('user_email', mockResponse.result.payload.email, {
        path: '/',
        maxAge: age,
      });

      $cookies.set('user_role', mockResponse.result.payload.role, {
        path: '/',
        maxAge: age,
      });

      $cookies.set('id_erp', mockResponse.result.payload.id_erp, {
        path: '/',
        maxAge: age,
      });

      $cookies.set('sellers', mockResponse.result.payload.sellers, {
        path: '/',
        maxAge: age,
      });

      $cookies.set(
        'user_permissions',
        JSON.stringify(mockResponse.result.payload.permissions),
        {
          path: '/',
          maxAge: age,
        }
      );

      $cookies.set('user_logged', true, {
        path: '/',
        maxAge: age,
      });

      this.context.commit('UPDATE_TOKEN', mockResponse.result);
      return mockResponse;
    }

    // Caso não seja ambiente de desenvolvimento, realiza o fluxo normal
    return await $axios
      .$post('login', payload)
      .then((response) => {
        if (response.code !== 'LOGIN_SUCCESS') throw new Error(response);

        const age = 60 * 60 * 24 * 7;

        $cookies.set('token', response.result.token, {
          path: '/',
          maxAge: age,
        });

        $cookies.set('user_id', response.result.payload.id, {
          path: '/',
          maxAge: age,
        });

        $cookies.set('username', response.result.payload.name, {
          path: '/',
          maxAge: age,
        });

        $cookies.set('user_email', response.result.payload.email, {
          path: '/',
          maxAge: age,
        });

        $cookies.set('user_role', response.result.payload.role, {
          path: '/',
          maxAge: age,
        });

        $cookies.set('id_erp', response.result.payload.id_erp, {
          path: '/',
          maxAge: age,
        });

        $cookies.set('sellers', response.result.payload.sellers, {
          path: '/',
          maxAge: age,
        });

        $cookies.set(
          'user_permissions',
          JSON.stringify(response.result.payload.permissions),
          {
            path: '/',
            maxAge: age,
          }
        );

        $cookies.set('user_logged', true, {
          path: '/',
          maxAge: age,
        });

        this.context.commit('UPDATE_TOKEN', response.result);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public update(payload: UpdatePayload) {
    const token = payload?.token ? payload.token : $cookies.get('token');

    this.context.commit('UPDATE_TOKEN', token || null);
  }

  @Action
  async destroy() {
    await $axios.get('logout');

    $cookies.removeAll();

    $cookies.set('user_logged', false, {
      path: '/',
    });

    this.context.commit('UPDATE_TOKEN', null);
  }

  @Action
  public setError() {
    this.context.commit('SET_ERROR');
  }

  @Action
  public removeError() {
    this.context.commit('REMOVE_ERROR');
  }
}
