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

  private isUpdatingUserName = false;

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

  public get $isUpdatingUserName() {
    return this.isUpdatingUserName;
  }

  @Mutation
  private SET_IS_UPDATING_USER_NAME(value: boolean) {
    this.isUpdatingUserName = value;
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

      const { auth, token } = response.body.result;

      const people = auth.people;
      const personType = people.person_type;

      $cookies.set('token', token, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('user_id', auth.id, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('person_type', personType, {
        path: '/',
        maxAge: this.age,
      });

      if (personType === 'PF') {
        const fullName = `${people.first_name} ${people.last_name}`;

        $cookies.set('username', fullName !== 'null null' ? fullName : 'Sem nome', {
          path: '/',
          maxAge: this.age,
        });

      } else {
        const fullName = `${people.social_name} ${people.fantasy_name}`; 

        $cookies.set('username', fullName !== 'null null' ? fullName : 'Sem nome', {
          path: '/',
          maxAge: this.age,
        });
      }

      $cookies.set('user_email', auth.email, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('user_role', auth.role, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('user_logged', true, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('people_id', people.id, {
        path: '/',
        maxAge: this.age,
      });

      $cookies.set('people_address_id', people.address_id || '', {
        path: '/',
        maxAge: this.age,
      });

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
  public  updateUserName(payload: { first: string, last: string }) {
    try {
      this.context.commit('SET_IS_UPDATING_USER_NAME', true);

      $cookies.set('username', `${payload.first} ${payload.last}`, {
        path: '/',
        maxAge: this.age,
      });

    } catch (error) {
      console.error('Erro ao atualizar o nome do usuário:', error);
      throw error;
    } finally {

      setTimeout(() => {
        this.context.commit('SET_IS_UPDATING_USER_NAME', false);
      }, 1500);
    }
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
