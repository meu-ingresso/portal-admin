import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

@Module({
    name: 'eventForm',
    stateFactory: true,
    namespaced: true,
})
export default class EventForm extends VuexModule {

    private defaultFields = [
        {
            name: 'Nome Completo',
            type: { text: 'Texto', value: 'text' },
            isDefault: true,
            options: [
                { text: 'Obrigatório', value: 'required' },
                { text: 'Visível no ingresso', value: 'visible_on_ticket' },
            ],
            personTypes: [
                { text: 'Pessoa Física (PF)', value: 'PF' },
                { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
                { text: 'Estrangeiro', value: 'Estrangeiro' },
            ],
            tickets: [],
        },
        {
            name: 'Email',
            type: { text: 'Email', value: 'email' },
            isDefault: true,
            options: [
                { text: 'Obrigatório', value: 'required' },
                { text: 'Visível na Impressão', value: 'visible_on_ticket' },
            ],
            personTypes: [
                { text: 'Pessoa Física (PF)', value: 'PF' },
                { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
                { text: 'Estrangeiro', value: 'Estrangeiro' },
            ],
            tickets: [],
        },
    ];

    private form = {
        eventName: '',
        alias: '',
        general_information: '',
        category: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        rating: null,
        event_type: '',
        max_capacity: 0,
        address: {
            street: '',
            neighborhood: '',
            city: '',
            state: '',
            complement: '',
        },
        cep: '',
        location_name: '',
        number: '',
        is_featured: false,
        absorb_service_fee: false,
        tickets: [],
        coupons: [],
        customFields: [
            ...this.defaultFields,
        ],
        attachments: [],
        link_online: '',
        sale_type: 'Ingresso',
        availability: 'Visível a todos',
        promoter_id: null,
    };

    public get $form() {
        return this.form;
    }

    @Mutation
    private SET_FORM(data: any) {
        this.form = { ...this.form, ...data };
        localStorage.setItem('eventForm', JSON.stringify(this.form));
    }

    @Action
    public updateForm(data: any) {
        this.context.commit('SET_FORM', data);
    }

    @Action
    public loadForm() {
        const savedForm = localStorage.getItem('eventForm');
        if (savedForm) {
            this.context.commit('SET_FORM', JSON.parse(savedForm));
        }
    }

    @Action
    public clearForm() {
        this.context.commit('SET_FORM', {
            eventName: '',
            alias: '',
            description: '',
            category: '',
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            rating: '',
            cep: '',
            max_capacity: 0,
            address: {
                street: '',
                number: '',
                neighborhood: '',
                city: '',
                state: '',
                complement: '',
            },
            is_featured: false,
            location_name: '',
            tickets: [],
            coupons: [],
            customFields: [],
        });
        localStorage.removeItem('eventForm');
    }
}