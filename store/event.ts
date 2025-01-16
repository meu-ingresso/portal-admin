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
    private isLoadingAlias: boolean = false;

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

    public get $isLoadingAlias() {
        return this.isLoadingAlias;
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
                { title: 'Visualizações', value: data.totalizers.totalViews },
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

    @Mutation
    private SET_IS_LOADING_ALIAS(value: boolean) {
        this.isLoadingAlias = value;
    }

    @Action
    public setLoading(value: boolean) {
        this.context.commit('SET_IS_LOADING', value);
    }

    @Action
    public setLoadingAlias(value: boolean) {
        this.context.commit('SET_IS_LOADING_ALIAS', value);
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

    @Action
    public async validateAlias(alias: string) {

        this.setLoadingAlias(true);

        return await $axios
            .$get(`event/validate-alias/${alias}`)
            .then((response) => {
                if (response.body && response.body.code !== 'VALIDATE_SUCCESS')
                    throw new Error(response);

                this.setLoadingAlias(false);

                return response.body.result;
            })
            .catch(() => {
                this.setLoadingAlias(false);
                return {
                    data: 'Error',
                    code: 'FIND_NOTFOUND',
                    total: 0,
                };
            });
    }

    @Action
    public async createEvent(eventPayload) {
        try {
            this.setLoading(true);

            // Step 1: Create Address
            const addressResponse = await $axios.$post('addresses', {
                street: eventPayload.address.street,
                zipcode: eventPayload.cep,
                number: eventPayload.number,
                complement: eventPayload.address.complement || '',
                neighborhood: eventPayload.address.neighborhood,
                latitude: eventPayload.address.latitude || null,
                longitude: eventPayload.address.longitude || null,
                city_id: eventPayload.address.city_id,
            });

            if (!addressResponse || !addressResponse.body || addressResponse.body.code !== 'CREATE_SUCCESS') {
                throw new Error('Failed to create address');
            }

            const addressId = addressResponse.body.result.id;

            // Step 2: Create Event
            const eventResponse = await $axios.$post('events', {
                alias: eventPayload.alias,
                name: eventPayload.eventName,
                description: eventPayload.description,
                status_id: 'd2057acb-d359-4508-b685-2aefa7a7b4e7', // Draft status [Rascunho]
                address_id: addressId,
                category_id: eventPayload.category.value,
                rating_id: eventPayload.rating.value,
                start_date: `${eventPayload.startDate}T${eventPayload.startTime}:00.000Z`,
                end_date: `${eventPayload.endDate}T${eventPayload.endTime}:00.000Z`,
                opening_hour: eventPayload.startTime,
                ending_hour: eventPayload.endTime,
                contact: eventPayload.contact || '',
                location_name: eventPayload.location_name,
                general_information: eventPayload.general_information || '',
                availability: eventPayload.availability,
                sale_type: eventPayload.sale_type,
                event_type: eventPayload.event_type,
                promoter_id: eventPayload.promoter_id || '',
                id_pixel: eventPayload.id_pixel || '',
                id_tag_manager: eventPayload.id_tag_manager || '',
                id_analytics: eventPayload.id_analytics || '',
                id_google_ads: eventPayload.id_google_ads || '',
                ads_conversion_label: eventPayload.ads_conversion_label || '',
                is_featured: eventPayload.is_featured,
                absorb_service_fee: eventPayload.absorb_service_fee || false,
            });


            if (!eventResponse || !eventResponse.body || eventResponse.body.code !== 'CREATE_SUCCESS') {
                throw new Error('Failed to create event');
            }

            const eventId = eventResponse.body.result.id;

            // Step 3: Create Ticket Categories and Tickets
            const categoryMap = new Map();

            for (const [index, ticket] of eventPayload.tickets.entries()) {
                let categoryId;

                if (ticket.category && !categoryMap.has(ticket.category)) {
                    // Create Category if not already created
                    const categoryResponse = await $axios.$post('ticket-categories', {
                        event_id: eventId,
                        name: ticket.category,
                    });

                    if (!categoryResponse || !categoryResponse.body || categoryResponse.body.code !== 'CREATE_SUCCESS') {
                        throw new Error('Failed to create ticket category');
                    }

                    categoryId = categoryResponse.body.result.id;
                    categoryMap.set(ticket.category, categoryId);
                } else {
                    // Use existing category ID
                    categoryId = categoryMap.get(ticket.category);
                }

                // Create Ticket
                await $axios.$post('tickets', {
                    event_id: eventId,
                    ticket_event_category_id: categoryId,
                    name: ticket.name,
                    description: ticket.description || '',
                    total_quantity: ticket.max_quantity,
                    remaining_quantity: ticket.max_quantity,
                    price: ticket.price,
                    status_id: '89b4f60f-c058-4d9c-ab88-f27bb0f8925f', // Default status [Ingresso a venda]
                    start_date: `${ticket.open_date}T${ticket.start_time}:00.000Z`,
                    end_date: `${ticket.close_date}T${ticket.end_time}:00.000Z`,
                    availability: ticket.availability.value,
                    display_order: index + 1,
                    min_quantity_per_user: ticket.min_purchase,
                    max_quantity_per_user: ticket.max_purchase,
                });
            }

            this.setLoading(false);

            return eventResponse;
        } catch (error) {
            this.setLoading(false);
            console.error('Error creating event:', error);
            throw error;
        }
    }


}
