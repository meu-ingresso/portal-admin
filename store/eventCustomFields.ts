import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { CustomField, PersonType, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'eventCustomFields',
  stateFactory: true,
  namespaced: true,
})
export default class EventCustomFields extends VuexModule {
  private fieldList: CustomField[] = [];

  private defaultFields: CustomField[] = [
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

  public get $customFields() {
    return this.fieldList;
  }

  public get $defaultFields() {
    return this.defaultFields;
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
  public async createCustomFields(
    eventId: string
  ): Promise<Record<string, string[]>> {
    try {
      const fieldTicketMap: Record<string, string[]> = {};

      const fieldPromises = this.fieldList.flatMap((field, index) => {
        return field.person_types.map(async (personType) => {

          try {
            const fieldId = await this.createSingleCustomField(
              eventId,
              field,
              personType,
              index
            );

            return {
              fieldId,
              tickets: field.tickets,
            };
          } catch (error) {
            throw new Error(
              `Erro ao processar campo ${field.name}: ${error.message}`
            );
          }
        });
      });

      const results = await Promise.all(fieldPromises);

      results.forEach(({ fieldId, tickets }) => {
        this.updateFieldTicketMap(fieldTicketMap, tickets, fieldId);
      });

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

    this.fieldList.forEach((field, index) => {
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

  private async createSingleCustomField(eventId: string, customField: CustomField, personType: PersonType, index: number) {
    const { isRequired, visibleOnTicket, isUnique } = this.getCustomFieldOptions(customField);

    const fieldResponse = await $axios.$post('event-checkout-field', {
      event_id: eventId,
      name: customField.name,
      type: customField.type,
      person_type: personType,
      required: isRequired,
      is_unique: isUnique,
      visible_on_ticket: visibleOnTicket,
      help_text: customField.help_text || '',
      order: customField.order || index + 1,
    });

    if (!fieldResponse.body || fieldResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error(`Falha ao criar campo personalizado: ${customField.name}`);
    }

    return fieldResponse.body.result.id;
  }

  private getCustomFieldOptions(customField: CustomField) {
    return {
      isRequired: customField.options.includes('required'),
      visibleOnTicket: customField.options.includes('visible_on_ticket'),
      isUnique: customField.options.includes('is_unique'),
    };
  }

  private updateFieldTicketMap(fieldTicketMap: Record<string, string[]>, ticketNames: string[], fieldId: string) {
    for (const ticketName of ticketNames) {
      if (!fieldTicketMap[ticketName]) {
        fieldTicketMap[ticketName] = [];
      }
      fieldTicketMap[ticketName].push(fieldId);
    }
  }

} 