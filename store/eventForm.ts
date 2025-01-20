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
                { text: 'Estrangeiro', value: 'ESTRANGEIRO' },
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
                { text: 'Estrangeiro', value: 'ESTRANGEIRO' },
            ],
            tickets: [],
        },
    ];

    private form = {
        "eventName":"Festa do Vinícius",
        "alias":"festa-do-vincius",
        "general_information":"Vamos comemorar o aniversário de 28 anos do Vinícius",
        "category":{
           "value":"e4db293d-76e5-425e-a7bb-9d8ba002f733",
           "text":"Música"
        },
        "startDate":"2025-09-12",
        "startTime":"19:00",
        "endDate":"2025-09-12",
        "endTime":"00:00",
        "rating":{
           "value":"cdd790bd-9f8e-41a4-bca0-8aa80a8ba4b3",
           "text":"Maiores de 16 anos",
           "img":"https://meuingresso-attachments.s3.us-east-1.amazonaws.com/%2B16.png"
        },
        "event_type":"Presencial",
        "max_capacity":0,
        "address":{
           "street":"Rua Bernardina da Rocha",
           "neighborhood":"São Vicente",
           "city":"Itajaí",
           "state":"SC",
           "state_name":"Santa Catarina"
        },
        "cep":"",
        "location_name":"",
        "number":"",
        "is_featured":true,
        "absorb_service_fee":false,
        "tickets":[
           {
              "name":"Amigos Próximos",
              "category":"VIP",
              "price":"10",
              "max_quantity":"400",
              "min_purchase":"1",
              "max_purchase":"400",
              "open_date":"2025-01-20",
              "start_time":"00:00",
              "close_date":"2025-01-31",
              "end_time":"00:00",
              "visible":true,
              "availability":{
                 "text":"Para todo o público",
                 "value":"Publico"
              },
           },
           {
              "name":"Convidados",
              "category":"PISTA",
              "price":"40",
              "max_quantity":"400",
              "min_purchase":"1",
              "max_purchase":"400",
              "open_date":"2025-01-20",
              "start_time":"00:00",
              "close_date":"2025-01-31",
              "end_time":"00:00",
              "visible":true,
              "availability":{
                 "text":"Para todo o público",
                 "value":"Publico"
              },
           }
        ],
        "coupons":[
           {
              "code":"VINAO10",
              "discountType":{
                 "text":"Porcentagem",
                 "value":"PERCENTAGE"
              },
              "discountValue":"10",
              "maxUses":"400",
              "end_date":"2025-09-11",
              "end_time":"23:59",
              "start_date":"2025-01-20",
              "start_time":"00:00",
              "tickets":[
                 "Amigos Próximos",
                 "Convidados"
              ]
           }
        ],
        "customFields":[
           {
              "name":"Nome Completo",
              "type":{
                 "text":"Texto",
                 "value":"TEXTO"
              },
              "isDefault":true,
              "options":[
                 {
                    "text":"Obrigatório",
                    "value":"required"
                 },
                 {
                    "text":"Visível no ingresso",
                    "value":"visible_on_ticket"
                 }
              ],
              "personTypes":[
                 {
                    "text":"Pessoa Física (PF)",
                    "value":"PF"
                 },
                 {
                    "text":"Pessoa Jurídica (PJ)",
                    "value":"PJ"
                 },
                 {
                    "text":"Estrangeiro",
                    "value":"ESTRANGEIRO"
                 }
              ],
              "tickets":[

              ]
           },
           {
              "name":"Email",
              "type":{
                 "text":"Email",
                 "value":"EMAIL"
              },
              "isDefault":true,
              "options":[
                 {
                    "text":"Obrigatório",
                    "value":"required"
                 },
                 {
                    "text":"Visível na Impressão",
                    "value":"visible_on_ticket"
                 }
              ],
              "personTypes":[
                 {
                    "text":"Pessoa Física (PF)",
                    "value":"PF"
                 },
                 {
                    "text":"Pessoa Jurídica (PJ)",
                    "value":"PJ"
                 },
                 {
                    "text":"Estrangeiro",
                    "value":"ESTRANGEIRO"
                 }
              ],
              "tickets":[

              ]
           },
           {
              "name":"CPF",
              "type":{
                 "text":"CPF",
                 "value":"CPF"
              },
              "tickets":[
                 "Amigos Próximos",
                 "Convidados"
              ],
              "personTypes":[
                 {
                    "text":"Pessoa Física (PF)",
                    "value":"PF"
                 },
                 {
                    "text":"Pessoa Jurídica (PJ)",
                    "value":"PJ"
                 }
              ],
              "options":[
                 {
                    "text":"Obrigatório",
                    "value":"required"
                 },
                 {
                    "text":"Visível na Impressão",
                    "value":"visible_on_ticket"
                 }
              ],
              "description":"",
              "optionsValues":[

              ],
              "termsContent":""
           }
        ],
        "attachments":[

        ],
        "link_online":"",
        "sale_type":"Ingresso",
        "availability":"Publico",
        "promoter_id":"73d98b21-a13a-4c66-9262-ffea1aafa436"
     }


   /*  private form = {
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
        complement: '',
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
        availability: 'Público',
        promoter_id: null,
    }; */

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
