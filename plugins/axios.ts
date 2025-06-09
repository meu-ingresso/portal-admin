import { Plugin } from '@nuxt/types';

const axiosPlugin: Plugin = ({ app, store, redirect }) => {
  app.$axios.onRequest((config) => {
    const tokenObj = app.$cookies.get('token');

    if (tokenObj) config.headers.Authorization = `bearer ${tokenObj.token}`;
  });

  app.$axios.onError((error) => {
    if (error.response?.status === 401) {
      app.$cookies.remove('token');
      app.$cookies.remove('user_id');
      app.$cookies.remove('user_role');
      app.$cookies.remove('user_email');
      app.$cookies.remove('user_logged');
      app.$cookies.remove('people_id');

      store.dispatch('auth/update', { token: null });

      console.log('[plugins/axios.ts] Token inválido, removendo cookies e redirecionando para login...');

      return redirect('/login');
    }
  });
};

export default axiosPlugin;
