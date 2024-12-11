import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload } from '~/models';
import { formatRealValue } from '~/utils/formatters';

@Module({
    name: 'event',
    stateFactory: true,
    namespaced: true,
})
export default class Event extends VuexModule {
    private eventList = [];
    private selectedEvent = null;
    private isLoading: boolean = false;

    public get $eventList() {
        return this.eventList;
    }

    public get $selectedEvent() {

        if (!this.selectedEvent)
            return null;

        return {
            ...this.selectedEvent,
            location: `${this.selectedEvent.address.street}, ${this.selectedEvent.address.number} - ${this.selectedEvent.address.neighborhood}, ${this.selectedEvent.address.city.name} - ${this.selectedEvent.address.city.state.name}`
        };
    }

    public get $isLoading() {
        return this.isLoading;
    }

    @Mutation
    private SET_EVENT_LIST(data: any) {
        this.eventList = data.map((event: any) => ({
            ...event,
            location: `${event.address.street}, ${event.address.number} - ${event.address.neighborhood}, ${event.address.city.name} - ${event.address.city.state.name}`
        }));
    }

    @Mutation
    private SET_SELECTED_EVENT(data: any) {

        const ticketsTypes = data.tickets.map((ticket) => ticket.name);

        const ticketSales = data.tickets.filter(
            (ticket) => ticket.total_quantity > ticket.remaining_quantity
        );

        this.selectedEvent = {
            ...data,
            title: data.name,
            statusText: data.status.name,
            date: data.start_date,
            statistics: [
                { title: 'Visualizações', value: 0 },
                { title: 'Visibilidade', value: data.availability },
                { title: 'Tipos de ingressos', value: `${ticketsTypes.length} Tipos` },
                {
                    title: 'Códigos Promocionais',
                    value: `${data.coupons.length} Códigos`,
                },
            ],
            sales: [
                { title: 'Ingressos Vendidos', value: ticketSales.length },
                {
                    title: 'Vendas',
                    value: formatRealValue(data.totalizers.totalSalesAmout),
                },
            ],
            promoters: data.collaborators.length,
            tickets: data.tickets.map((ticket) => ({
                ...ticket,
                id: ticket.id,
                name: ticket.name,
                price: ticket.price,
                sold: ticket.total_quantity - ticket.remaining_quantity,
                total: ticket.total_quantity,
                status: ticket.status.name,
                hasSales: ticket.total_quantity > ticket.remaining_quantity,
            })),
        };
    }

    @Mutation
    private SET_IS_LOADING(value: boolean) {
        this.isLoading = value;
    }

    @Action
    public setLoading(value: boolean) {
        this.context.commit('SET_IS_LOADING', value);
    }

    @Action
    public setSelectedEvent(data: any) {
        this.context.commit('SET_SELECTED_EVENT', data);
    }

    @Action
    public async fetchEvents({ page = 1, limit = 12, search, sortBy, sortDesc }: SearchPayload) {

        this.setLoading(true);

        const preloads = [
            'rating',
            'tickets:status',
            'status',
            'address:city:state',
            'category',
            'attachments',
        ];

        const params = new URLSearchParams();

        params.append('page', page.toString());
        params.append('limit', limit.toString());

        sortBy.forEach((field: string, index: number) => {
            const order = sortDesc[index] ? 'desc' : 'asc';
            params.append('orderBy[]', `${field}:${order}`);
        });

        if (search) {
            params.append('search[name][o]', '_LIKE_');
            params.append('search[name][v]', encodeURIComponent(String(search)));
        }

        preloads.forEach((preload) => params.append('preloads[]', preload));

        return await $axios
            .$get(`events?${params.toString()}`)
            .then((response) => {
                if (response.body && response.body.code !== 'SEARCH_SUCCESS')
                    throw new Error(response);

                this.setLoading(false);
                this.context.commit('SET_EVENT_LIST', response.body.result.data);
                return response;
            })
            .catch(() => {
                this.setLoading(false);
                return {
                    data: 'Error',
                    code: 'FIND_NOTFOUND',
                    total: 0,
                };
            });
    }

    @Action
    public async getById(eventId: string) {

        this.setLoading(true);

        const preloads = [
            'rating',
            'tickets:status',
            'status',
            'address:city:state',
            'category',
            'attachments',
            'collaborators',
            'coupons'
        ];


        return await $axios
            .$get(`events?where[id][v]=${eventId}&${preloads.map((preload) => `preloads[]=${preload}`).join('&')}`)
            .then((response) => {
                if (response.body && response.body.code !== 'SEARCH_SUCCESS')
                    throw new Error(response);

                this.setLoading(false);
                this.context.commit('SET_SELECTED_EVENT', response.body.result.data[0]);
                return response;
            })
            .catch(() => {
                this.setLoading(false);
                return {
                    data: 'Error',
                    code: 'FIND_NOTFOUND',
                    total: 0,
                };
            });
    }
}
