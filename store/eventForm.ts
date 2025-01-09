import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

@Module({
    name: 'eventForm',
    stateFactory: true,
    namespaced: true,
})
export default class EventForm extends VuexModule {
    private form = {
        eventName: '',
        alias: '',
        description: '',
        category: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        rating: null,
        event_type: '',
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