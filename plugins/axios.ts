import { Plugin } from '@nuxt/types';

const axiosPlugin: Plugin = ({ app, store, redirect }) => {
  app.$axios.onRequest((config) => {
    const tokenObj = app.$cookies.get('token');

    if (tokenObj) config.headers.Authorization = `bearer ${tokenObj.token}`;
  });

  app.$axios.onError((error) => {
    if (error.response?.status === 401) {
      app.$cookies.remove('token');

      store.dispatch('auth/update', { token: null });

      return redirect('/login');
    }
  });
};

export default axiosPlugin;
