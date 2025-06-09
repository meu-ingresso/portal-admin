import { $auth } from '@/utils/nuxt-instance';

export const AuthHelper = {
  // Dados do usuário
  get user() {
    return $auth?.user;
  },

  get isLoggedIn() {
    return $auth?.loggedIn || false;
  },

  get token() {
    return $auth?.token;
  },

  // Dados específicos do usuário (equivalente aos cookies antigos)
  get userId() {
    return $auth?.user?.auth?.id || null;
  },

  get userEmail() {
    return $auth?.user?.auth?.email || '';
  },

  get userRole() {
    return $auth?.user?.auth?.role || null;
  },

  get userName() {
    const user = $auth?.user;
    if (!user?.auth?.people) return 'Sem nome';

    const people = user.auth.people;
    const personType = people.person_type;

    if (personType === 'PF') {
      const fullName = `${people.first_name} ${people.last_name}`;
      return fullName !== 'null null' ? fullName : 'Sem nome';
    } else {
      const fullName = `${people.social_name} ${people.fantasy_name}`;
      return fullName !== 'null null' ? fullName : 'Sem nome';
    }
  },

  get personType() {
    return $auth?.user?.auth?.people?.person_type || null;
  },

  get peopleId() {
    return $auth?.user?.auth?.people?.id || null;
  },

  get peopleAddressId() {
    return $auth?.user?.auth?.people?.address_id || null;
  },

  // Métodos de autenticação
  async login(credentials: any) {
    try {
      return await $auth.loginWith('local', { data: credentials });
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await $auth.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  },

  async fetchUser() {
    try {
      return await $auth.fetchUser();
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },
}; 