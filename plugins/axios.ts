import { Plugin } from '@nuxt/types';

const axiosPlugin: Plugin = ({ app, redirect }) => {
  app.$axios.onRequest((config) => {
    const tokenObj = app.$cookies.get('token');

    if (tokenObj) config.headers.Authorization = `bearer ${tokenObj.token}`;
  });

  app.$axios.onError((error) => {
    if (error.response?.status === 401) {

      // Se o erro for 401, redirecionar para a página de login
      if (app.$auth) {
        app.$auth.logout();
      }
      // Limpar o token do cookie
      app.$cookies.remove('token');
      // Redirecionar para a página de login
      return redirect('/login');
    }
  });
};

export default axiosPlugin;
