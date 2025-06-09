const defaultFields = [
  {
    name: 'Nome Completo',
    type: { text: 'Texto', value: 'TEXTO' },
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
    type: { text: 'Email', value: 'EMAIL' },
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

interface EventFormState {
  form: {
    eventName: string;
    alias: string;
    general_information: string;
    category: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    rating: any;
    event_type: string;
    max_capacity: number;
    address: {
      street: string;
      neighborhood: string;
      city: string;
      state: string;
      cep: string;
      location_name: string;
      complement: string;
      number: string;
    };
    is_featured: boolean;
    absorb_service_fee: boolean;
    tickets: any[];
    coupons: any[];
    customFields: any[];
    attachments: any[];
    link_online: string;
    sale_type: string;
    availability: string;
    promoter_id: string | null;
  };
}

export const state = (): EventFormState => ({
  form: {
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
      cep: '',
      location_name: '',
      complement: '',
      number: '',
    },
    is_featured: false,
    absorb_service_fee: false,
    tickets: [],
    coupons: [],
    customFields: [...defaultFields],
    attachments: [],
    link_online: '',
    sale_type: 'Ingresso',
    availability: 'Público',
    promoter_id: null,
  },
});

export const getters = {
  $form: (state: EventFormState) => state.form,
};

export const mutations = {
  SET_FORM(state: EventFormState, data: any) {
    state.form = { ...state.form, ...data };
    localStorage.setItem('eventForm', JSON.stringify(state.form));
  },
};

export const actions = {
  updateForm({ commit }: any, data: any) {
    commit('SET_FORM', data);
  },

  loadForm({ commit }: any) {
    const savedForm = localStorage.getItem('eventForm');
    if (savedForm) {
      commit('SET_FORM', JSON.parse(savedForm));
    }
  },

  clearForm({ commit }: any) {
    commit('SET_FORM', {
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
  },
};
