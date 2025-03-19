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

interface Token {
  token: string;
  expires_at: string;
}

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

  private age = 60 * 60 * 24 * 7;

  private token: Token = null;

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
      this.token = null;
      this.credentials.user_id = undefined;
      this.credentials.email = '';
      this.credentials.password = '';
      return;
    }

    this.token = {
      token: result.token.token,
      expires_at: result.token.expires_at,
    };

    this.credentials.user_id = result.auth.id;
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

    try {
      const response = await $axios.$post('login', payload);

      if (!response || !response.body || response.body.code !== 'LOGIN_SUCCESS') {
        throw new Error('Erro ao fazer login');
      }

      const { body } = response;

      $cookies.set('token', body.result.token, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('user_id', body.result.auth.id, {
        path: '/',
        maxAge: this.age,
      });

      const fullName = `${body.result.auth.people.first_name} ${body.result.auth.people.last_name}`;

      $cookies.set('username', fullName, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('user_email', body.result.auth.email, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('user_role', body.result.auth.role, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('user_logged', true, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('people_id', body.result.auth.people_id, {
        path: '/',
        maxAge: this.age,
      });

      this.context.commit('UPDATE_TOKEN', body.result);

      return response;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
    
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
