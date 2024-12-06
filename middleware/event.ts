import { Middleware } from '@nuxt/types';

const event: Middleware = ({ store, route }) => {

    console.log('Middleware Eventos');
    console.log('route.name', route.name);

    if (route.name !== 'Detalhe de Eventos') {
        store.state.event.selectedEvent = null;
    }
}


export default event;
