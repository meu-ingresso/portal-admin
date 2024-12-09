import { Middleware } from '@nuxt/types';

const event: Middleware = ({ store, route }) => {

    if (route.name !== 'Detalhe de Eventos') {
        store.state.event.selectedEvent = null;
    }
}


export default event;
