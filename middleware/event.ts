import { Middleware } from '@nuxt/types';

const event: Middleware = ({ store, route }) => {
  if (route.name !== 'Detalhe de Eventos') {
    store.dispatch('event/setEvent', null);
  }
};

export default event;
