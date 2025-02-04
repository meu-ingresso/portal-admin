import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { CustomField, CustomFieldApiResponse, CustomFieldTicketApiResponse, FieldOption, PersonType, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'eventCustomFields',
  stateFactory: true,
  namespaced: true,
})
export default class EventCustomFields extends VuexModule {

  private isLoading: boolean = false;

  private defaultFieldList: CustomField[] = [
    {
      name: 'Nome Completo',
      type: 'TEXTO',
      is_default: true,
      options: [
        'required',
        'visible_on_ticket',
      ],
      person_types: [
        'PF',
        'PJ',
        'ESTRANGEIRO',
      ],
      tickets: [],
      selected_options: []
    },
    {
      name: 'Email',
      type: 'EMAIL',
      is_default: true,
      options: [
        'required',
        'visible_on_ticket',
      ],
      person_types: [
        'PF',
        'PJ',
        'ESTRANGEIRO',
      ],
      tickets: [],
      selected_options: []
    },
  ];

  private fieldList: CustomField[] = [
    ...this.defaultFieldList,
  ];

  private mockFieldList: CustomField[] = [
    ...this.defaultFieldList,
    {
      name: 'CPF',
      type: 'CPF',
      options: [
        'required',
        'visible_on_ticket',
      ],
      person_types: [
        'PF',
      ],
      tickets: ['Ingresso Normal', 'Ingresso Vip'],
      selected_options: []
    },
  ];

  constructor(module: VuexModule<ThisType<EventCustomFields>, EventCustomFields>) {
    super(module);
    this.fieldList = process.env.USE_MOCK_DATA === 'true' ? this.mockFieldList : this.fieldList;
  }

  public get $customFields() {
    return this.fieldList;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  @Mutation
  private SET_LOADING(loading: boolean) {
    this.isLoading = loading;
  }

  @Mutation
  private SET_FIELDS(fields: CustomField[]) {
    this.fieldList = [...fields];
  }

  @Mutation
  private ADD_FIELD(field: CustomField) {
    this.fieldList = [...this.fieldList, field];
  }

  @Mutation
  private UPDATE_FIELD({ index, field }: { index: number; field: CustomField }) {
    const updatedList = [...this.fieldList];
    updatedList[index] = { ...field };
    this.fieldList = updatedList;
  }

  @Mutation
  private REMOVE_FIELD(index: number) {
    const updatedList = [...this.fieldList];
    updatedList[index]._deleted = true;
    this.fieldList = updatedList;
  }

  @Action
  public setFields(fields: CustomField[]) {
    this.context.commit('SET_FIELDS', fields);
  }

  @Action
  public addField(field: CustomField) {
    this.context.commit('ADD_FIELD', field);
  }

  @Action
  public updateField(payload: { index: number; field: CustomField }) {
    this.context.commit('UPDATE_FIELD', payload);
  }

  @Action
  public removeField(index: number) {
    this.context.commit('REMOVE_FIELD', index);
  }

  @Action
  public async fetchAndPopulateByEventId(payload: {eventId: string, tickets: string[]}) {
    try {
      this.context.commit('SET_LOADING', true); 
      const response = await $axios.$get(`event-checkout-fields?where[event_id][v]=${payload.eventId}`);

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error(`Campos personalizados não encontrados para o evento ${payload.eventId}`);
      }

      const fieldsData = response.body.result.data;
      const groupedFields = new Map<string, CustomField>();
      
      // Inicializa o objeto field_ids com todas as chaves necessárias
      const initializeFieldIds = (): Record<PersonType, string> => ({
        PF: '',
        PJ: '',
        ESTRANGEIRO: '',
      });

      // Primeiro, vamos processar os campos padrão
      const defaultFields = fieldsData.filter(field => ['Nome Completo', 'Email'].includes(field.name));
      const customFields = fieldsData.filter(field => !['Nome Completo', 'Email'].includes(field.name));

      // Processa campos padrão primeiro
      for (const defaultFieldName of ['Nome Completo', 'Email']) {
        const fieldsForName = defaultFields.filter((f: CustomFieldApiResponse) => f.name === defaultFieldName);
        
        if (fieldsForName.length > 0) {
          const firstField = fieldsForName[0];
          const fieldIds = initializeFieldIds();
          
          // Coleta todos os IDs para cada tipo de pessoa
          fieldsForName.forEach((field: CustomFieldApiResponse) => {
            fieldIds[field.person_type] = field.id;
          });

          const options: FieldOption[] = [
            ...(firstField.required ? ['required' as const] : []),
            ...(firstField.visible_on_ticket ? ['visible_on_ticket' as const] : []),
            ...(firstField.is_unique ? ['is_unique' as const] : []),
          ];

          // Busca tickets para o primeiro ID (já que são os mesmos para todos os tipos)
          const responseCheckoutFieldsTickets = await $axios.$get(
            `event-checkout-fields-tickets?where[event_checkout_field_id][v]=${firstField.id}&preloads[]=ticket`
          );

          const ticketNames = responseCheckoutFieldsTickets.body?.code === 'SEARCH_SUCCESS' 
            ? responseCheckoutFieldsTickets.body.result.data.map(
                (customFieldTicket: CustomFieldTicketApiResponse) => customFieldTicket.ticket.name
              )
            : [];

          groupedFields.set(defaultFieldName, {
            name: defaultFieldName,
            type: firstField.type,
            is_default: true,
            options,
            person_types: ['PF', 'PJ', 'ESTRANGEIRO'], // Campos padrão sempre têm todos os tipos
            tickets: ticketNames,
            selected_options: [],
            help_text: firstField.help_text || '',
            order: firstField.order,
            field_ids: fieldIds
          });
        }
      }

      // Processa campos customizados
      const promiseFields = customFields.map(async (field: CustomFieldApiResponse) => {
        const existingField = groupedFields.get(field.name);

        if (existingField) {
          if (!existingField.person_types.includes(field.person_type)) {
            existingField.person_types.push(field.person_type);
          }
          existingField.field_ids = {
            ...existingField.field_ids,
            [field.person_type]: field.id
          };
        } else {
          const options: FieldOption[] = [
            ...(field.required ? ['required' as const] : []),
            ...(field.visible_on_ticket ? ['visible_on_ticket' as const] : []),
            ...(field.is_unique ? ['is_unique' as const] : []),
          ];

          const fieldIds = initializeFieldIds();
          fieldIds[field.person_type] = field.id;

          const responseCheckoutFieldsTickets = await $axios.$get(
            `event-checkout-fields-tickets?where[event_checkout_field_id][v]=${field.id}&preloads[]=ticket`
          );

          const ticketNames = responseCheckoutFieldsTickets.body?.code === 'SEARCH_SUCCESS'
            ? responseCheckoutFieldsTickets.body.result.data.map(
                (customFieldTicket: CustomFieldTicketApiResponse) => customFieldTicket.ticket.name
              )
            : [];

          groupedFields.set(field.name, {
            name: field.name,
            type: field.type,
            is_default: false,
            options,
            person_types: [field.person_type],
            tickets: ticketNames,
            selected_options: [],
            help_text: field.help_text || '',
            order: field.order,
            field_ids: fieldIds
          });
        }
      });
      
      await Promise.all(promiseFields);
      const fields = Array.from(groupedFields.values());
      this.context.commit('SET_FIELDS', fields);
      
    } catch (error) {
      console.error('Erro ao buscar campos personalizados:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async createCustomFields(payload: {
    eventId: string,
    tickets: string[]
  }): Promise<Record<string, string[]>> {
    try {
      const fieldTicketMap: Record<string, string[]> = {};

      const fieldPromises = this.fieldList.flatMap((field, index) => {

        if (field.is_default) {
          field.tickets = payload.tickets;
        }

        return field.person_types.map(async (personType) => {

          try {
            const fieldId = await this.createSingleCustomField({
              eventId: payload.eventId,
              customField: field,
              personType,
              index
            });

          for (const ticketName of field.tickets) {
            if (!fieldTicketMap[ticketName]) {
              fieldTicketMap[ticketName] = [];
            }
            fieldTicketMap[ticketName].push(fieldId);
          }

          return fieldId;
          } catch (error) {
            throw new Error(
              `Erro ao processar campo ${field.name}: ${error.message}`
            );
          }
        });
      });

      await Promise.all(fieldPromises);

      return fieldTicketMap;

    } catch (error) {
      console.error('Erro ao criar campos personalizados:', error);
      throw error;
    }
  }

  @Action
  public async deleteCustomFields(fieldId: string) {
    try {
      const response = await $axios.$delete(`event-checkout-field/${fieldId}`);

      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error(`Falha ao deletar campo personalizado`);
      }

      return response.body.result.data;
      
    } catch (error) {
      console.error('Erro ao deletar campo personalizado:', error);
      throw error;
    }
  }

  @Action
  public validateCustomFields(): ValidationResult {
    const errors: string[] = [];
    const fieldNames = new Set<string>();

    this.fieldList.filter(field => !field.is_default).forEach((field, index) => {
      
      // Validação de nome duplicado
      if (fieldNames.has(field.name)) {
        errors.push(`Campo "${field.name}" está duplicado`);
      }
      fieldNames.add(field.name);

      // Validações básicas
      if (!field.name?.trim()) {
        errors.push(`Campo ${index + 1}: Nome é obrigatório`);
      }

      if (!field.type) {
        errors.push(`Campo ${index + 1}: Tipo é obrigatório`);
      }

      if (!field.person_types?.length) {
        errors.push(`Campo ${index + 1}: Selecione pelo menos um tipo de pessoa`);
      }

      if (!field.tickets?.length) {
        errors.push(`Campo ${index + 1}: Selecione pelo menos um ingresso`);
      }

      const fieldIsMultiOptions = field.type === 'MULTI_CHECKBOX' || field.type === 'MENU_DROPDOWN';

      // Validações específicas por tipo
      if (fieldIsMultiOptions) {
        if (!field.selected_options?.length) {
          errors.push(`Campo ${index + 1}: Opções são obrigatórias para campo desse tipo`);
        }

        // Validar opções duplicadas
        const optionSet = new Set<string>();
        field.selected_options?.forEach((option) => {
          if (optionSet.has(option)) {
            errors.push(`Campo ${index + 1}: Opção "${option}" está duplicada`);
          }
          optionSet.add(option);
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }


  @Action
  public reset() {
    this.context.commit('SET_FIELDS', this.defaultFieldList);
  }

  @Action
  private async createSingleCustomField(payload: { eventId: string, customField: CustomField, personType: PersonType, index: number }) {
    
    const isRequired = payload.customField.options.includes('required');
    const visibleOnTicket = payload.customField.options.includes('visible_on_ticket');
    const isUnique = payload.customField.options.includes('is_unique');
    
    const requestPayload = {
      event_id: payload.eventId,
      name: payload.customField.name,
      type: payload.customField.type,
      person_type: payload.personType,
      required: isRequired,
      is_unique: isUnique,
      visible_on_ticket: visibleOnTicket,
      help_text: payload.customField.help_text || '',
      order: payload.customField.order || payload.index + 1,
    };  

    const fieldResponse = await $axios.$post('event-checkout-field', requestPayload);

    if (!fieldResponse.body || fieldResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error(`Falha ao criar campo personalizado: ${payload.customField.name}`);
    }

    const fieldId = fieldResponse.body.result.id;

    if (payload.customField.type === 'MULTI_CHECKBOX' || payload.customField.type === 'MENU_DROPDOWN') {
      await this.createFieldOptions({ fieldId, options: payload.customField.selected_options });
    }

    return fieldId;
  }

  @Action
  private async createFieldOptions(payload: { fieldId: string, options: string[] }) {

    const promises = payload.options.map(async (option) => {
        const requestPayload = {
          event_checkout_field_id: payload.fieldId,
          name: option,
        };

      const response = await $axios.$post('event-checkout-field-option', requestPayload);

      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
          throw new Error(`Falha ao criar opção ${option} do campo personalizado: ${payload.fieldId}`);
        }
    });

    await Promise.all(promises);
  }
} 