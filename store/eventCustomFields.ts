import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { CustomField, CustomFieldApiResponse, FieldOption, PersonType, ValidationResult } from '~/models/event';
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
    this.fieldList = fields;
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
    this.fieldList.splice(index, 1);
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
  public async fetchAndPopulateByEventId(eventId: string) {
    try {
      this.context.commit('SET_LOADING', true); 
      const response = await $axios.$get(`event-checkout-fields?where[event_id][v]=${eventId}`);

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error(`Campos personalizados não encontrados para o evento ${eventId}`);
      }

      const fieldsData = response.body.result.data;
      const groupedFields = new Map<string, CustomField>();
      
      // Inicializa o objeto field_ids com todas as chaves necessárias
      const initializeFieldIds = (): Record<PersonType, string> => ({
        PF: '',
        PJ: '',
        ESTRANGEIRO: '',
      });

    // Agrupa campos por nome
    fieldsData.forEach((field: CustomFieldApiResponse) => {
      const existingField = groupedFields.get(field.name);

      if (existingField) {
        // Adiciona person_type ao campo existente
        existingField.person_types.push(field.person_type);
        
        // Armazena o ID do campo para cada tipo de pessoa
        existingField.field_ids = {
          ...existingField.field_ids,
          [field.person_type]: field.id
        };
      } else {

        // Cria array de options baseado nas propriedades do campo
        const options: FieldOption[] = [
          ...(field.required ? ['required' as const] : []),
          ...(field.visible_on_ticket ? ['visible_on_ticket' as const] : []),
          ...(field.is_unique ? ['is_unique' as const] : []),
        ];

        // Inicializa field_ids com valores vazios
        const fieldIds = initializeFieldIds();
        // Define o ID para o tipo de pessoa atual
        fieldIds[field.person_type] = field.id;

        // Cria novo campo
        groupedFields.set(field.name, {
          name: field.name,
          type: field.type,
          is_default: ['Nome Completo', 'Email'].includes(field.name),
          options,
          person_types: [field.person_type],
          tickets: [], // Precisará ser preenchido com a relação de tickets
          selected_options: [],
          help_text: field.help_text || '',
          order: field.order,
          field_ids: fieldIds
        });
      }
    });

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
  public async createCustomFields(
    eventId: string
  ): Promise<Record<string, string[]>> {
    try {
      const fieldTicketMap: Record<string, string[]> = {};

      const fieldPromises = this.fieldList.flatMap((field, index) => {
        return field.person_types.map(async (personType) => {

          try {
            const fieldId = await this.createSingleCustomField({
              eventId,
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
    this.context.commit('SET_FIELDS', []);
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

    return fieldResponse.body.result.id;
  }

} 