import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { CustomField, CustomFieldApiResponse, CustomFieldOptionApiResponse, CustomFieldTicket, CustomFieldTicketApiResponse, FieldOption, FieldSelectedOption, PersonType, TicketApiResponse, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { defaultFields, getFieldOptionChanges, getPersonTypeChanges, getTicketRelationChanges, isMultiOptionField, shouldUpdateField } from '~/utils/customFieldsHelpers';

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
      tickets: [{
        id: '1',
        name: 'Ingresso Normal',
      }, {
        id: '2',
        name: 'Ingresso Vip',
      }],
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

      const fieldsData = response.body.result.data.filter((field: CustomFieldApiResponse) => !field.deleted_at);
      const groupedFields = new Map<string, CustomField>();
      
      // Inicializa o objeto field_ids com todas as chaves necessárias
      const initializeFieldIds = (): Record<PersonType, string> => ({
        PF: '',
        PJ: '',
        ESTRANGEIRO: '',
      });

      // Primeiro, vamos processar os campos padrão
      const defaultFieldsData = fieldsData.filter((field: CustomFieldApiResponse) => defaultFields.includes(field.name));
      const customFieldsData = fieldsData.filter((field: CustomFieldApiResponse) => !defaultFields.includes(field.name));

      // Processa campos padrão primeiro
      for (const defaultFieldName of defaultFields) {
        const fieldsForName = defaultFieldsData.filter((f: CustomFieldApiResponse) => f.name === defaultFieldName);
        
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

          const customFieldTickets = responseCheckoutFieldsTickets.body?.code === 'SEARCH_SUCCESS' 
            ? responseCheckoutFieldsTickets.body.result.data.map(
                (customFieldTicket: CustomFieldTicketApiResponse) => ({
                  id: customFieldTicket.ticket.id,
                  name: customFieldTicket.ticket.name,
                })
              )
            : [];

          groupedFields.set(defaultFieldName, {
            name: defaultFieldName,
            type: firstField.type,
            is_default: true,
            options,
            person_types: ['PF', 'PJ', 'ESTRANGEIRO'], // Campos padrão sempre têm todos os tipos
            tickets: customFieldTickets,
            selected_options: [],
            help_text: firstField.help_text || '',
            display_order: firstField.display_order,
            field_ids: fieldIds
          });
        }
      }

      // Processa campos customizados
      for (const field of customFieldsData) {

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

          const customFieldTickets = responseCheckoutFieldsTickets.body?.code === 'SEARCH_SUCCESS'
            ? responseCheckoutFieldsTickets.body.result.data.map(
                (customFieldTicket: CustomFieldTicketApiResponse) => ({
                  id: customFieldTicket.ticket.id,
                  name: customFieldTicket.ticket.name,
                  _deleted: customFieldTicket.ticket.deleted_at
                })
              )
            : [];
          
          let selectedOptions: FieldSelectedOption[] = [];
          
          if (field.type === 'MULTI_CHECKBOX' || field.type === 'MENU_DROPDOWN') {
            const responseFieldOptions = await $axios.$get(
              `event-checkout-field-option?where[event_checkout_field_id][v]=${field.id}`
            );

            selectedOptions = responseFieldOptions.body?.result?.data?.map(
              (option: FieldSelectedOption) => {
                return {
                  id: option.id,
                  name: option.name,
                }
              }
            );
          }

          groupedFields.set(field.name, {
            name: field.name,
            type: field.type,
            is_default: false,
            options,
            person_types: [field.person_type],
            tickets: customFieldTickets,
            selected_options: selectedOptions,
            help_text: field.help_text || '',
            display_order: field.display_order,
            field_ids: fieldIds
          });
        }
      };
      
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
    tickets: CustomFieldTicket[]
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

          for (const ticket of field.tickets) {
            if (!fieldTicketMap[ticket.name]) {
              fieldTicketMap[ticket.name] = [];
            }
            fieldTicketMap[ticket.name].push(fieldId);
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
          if (optionSet.has(option.name)) {
            errors.push(`Campo ${index + 1}: Opção "${option.name}" está duplicada`);
          }
          optionSet.add(option.name);
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  @Action
  public async updateEventCustomFields(payload: {
    eventId: string;
    tickets: CustomFieldTicket[];
  }): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);

      // 1. Buscar campos existentes e suas opções/relações
      const [fieldsResponse, ticketsFromEventResponse] = await Promise.all([
        $axios.$get(`event-checkout-fields?where[event_id][v]=${payload.eventId}`),
        $axios.$get(`tickets?where[event_id][v]=${payload.eventId}`)
      ]);
        
      const existingFields = fieldsResponse.body?.result?.data || [];
      const ticketsFromEvent = ticketsFromEventResponse.body?.result?.data || [];
      // 2. Processar cada campo
      for (const field of this.fieldList) {
        if (field.is_default) continue;

        // 1. Verifica se há tipos de pessoa para deletar
        const personTypeChanges = getPersonTypeChanges(field);
        
        // 2. Deleta campos que não são mais usados e suas relações
        await Promise.all(
          personTypeChanges.toDelete.map(async (fieldId) => {
            try {
              // 2.1 Remove relações com tickets
              const ticketRelationsResponse = await $axios.$get(
                `event-checkout-fields-tickets?where[event_checkout_field_id][v]=${fieldId}`
              );
              
              if (ticketRelationsResponse.body?.code === 'SEARCH_SUCCESS') {
                await Promise.all(
                  ticketRelationsResponse.body.result.data.map((relation: any) =>
                    $axios.$delete(`event-checkout-field-ticket/${relation.id}`)
                  )
                );
              }

              // 2.2 Remove opções se for campo multi-opção
              if (field.type === 'MULTI_CHECKBOX' || field.type === 'MENU_DROPDOWN') {
                const optionsResponse = await $axios.$get(
                  `event-checkout-field-options?where[event_checkout_field_id][v]=${fieldId}`
                );

                if (optionsResponse.body?.code === 'SEARCH_SUCCESS') {
                  await Promise.all(
                    optionsResponse.body.result.data.map((option: any) =>
                      $axios.$delete(`event-checkout-field-option/${option.id}`)
                    )
                  );
                }
              }

              // 2.3 Finalmente remove o campo
              await $axios.$delete(`event-checkout-field/${fieldId}`);
              
            } catch (error) {
              console.error(`Erro ao deletar campo ${fieldId} e suas relações:`, error);
              throw error;
            }
          })
        );

        // Processar cada tipo de pessoa do campo
        for (const personType of field.person_types) {
          const fieldId = field.field_ids?.[personType];
          const existingField = existingFields.find((f: CustomFieldApiResponse) => f.id === fieldId);

          if (fieldId && existingField) {

            const [optionsResponse, ticketRelationsResponse] = await Promise.all([
              $axios.$get(`event-checkout-field-options?where[event_checkout_field_id][v]=${fieldId}`),
              $axios.$get(`event-checkout-fields-tickets?where[event_checkout_field_id][v]=${fieldId}`)
            ]);

            const existingOptions = optionsResponse.body?.result?.data || [];
            const existingTicketRelations = ticketRelationsResponse.body?.result?.data || [];

            // Atualizar campo existente
            if (shouldUpdateField(existingField, field)) {
              await $axios.$patch('event-checkout-field', {
                id: fieldId,
                name: field.name,
                type: field.type,
                required: field.options.includes('required'),
                visible_on_ticket: field.options.includes('visible_on_ticket'),
                is_unique: field.options.includes('is_unique'),
                help_text: field.help_text,
                display_order: field.display_order
              });
            }

            // Processar opções se for campo multi-opção
            if (isMultiOptionField(field.type)) {
              const fieldOptions = existingOptions.filter(
                (opt: CustomFieldOptionApiResponse) => opt.event_checkout_field_id === fieldId
              );
              const optionChanges = getFieldOptionChanges(fieldOptions, field.selected_options);

              // Criar novas opções
              await Promise.all(
                optionChanges.toCreate.map(name =>
                  $axios.$post('event-checkout-field-option', {
                    event_checkout_field_id: fieldId,
                    name
                  })
                )
              );

              // Atualizar opções existentes
              await Promise.all(
                optionChanges.toUpdate.map((opt: FieldSelectedOption) =>
                  $axios.$patch('event-checkout-field-option', {
                    id: opt.id,
                    name: opt.name
                  })
                )
              );

              // Deletar opções removidas
              await Promise.all(
                optionChanges.toDelete.map(optId =>
                  $axios.$delete(`event-checkout-field-option/${optId}`)
                )
              );
            }

            // Processar relações com tickets
            const fieldTicketRelations = existingTicketRelations.filter(
              (rel: CustomFieldTicketApiResponse) => rel.event_checkout_field_id === fieldId
            );

            // Parâmetros para o getTicketRelationChanges :
            // - existingRelations: array de relações existentes
            // - newTickets: array de tickets do evento atualizado
            const relationChanges = getTicketRelationChanges(fieldTicketRelations, ticketsFromEvent.map((ticket: TicketApiResponse) => ({
              id: ticket.id,
              name: ticket.name,
              _deleted: ticket.deleted_at
            })), field.tickets);

            // Criar novas relações
            const promiseCreationRelations = relationChanges.toCreate.map(async (ticket: CustomFieldTicket) => {
              
              const responseTicket = await $axios.$get(
                `tickets?where[name][v]=${ticket.name}&where[event_id][v]=${payload.eventId}`
              );

              if (!responseTicket.body || responseTicket.body.code !== 'SEARCH_SUCCESS') {
                throw new Error(`Ticket não encontrado para o evento ${payload.eventId} e nome ${ticket.name}`);
              }

              const ticketId = responseTicket.body.result.data[0].id;

              return $axios.$post('event-checkout-field-ticket', {
                event_checkout_field_id: fieldId,
                ticket_id: ticketId
              })
            });

            await Promise.all(promiseCreationRelations);           

            // Deletar relações removidas
            await Promise.all(
              relationChanges.toDelete.map((relationId: string) =>
                $axios.$delete(`event-checkout-field-ticket/${relationId}`)
              )
            );
          } else {
            // Criar novo campo
            await this.createSingleCustomField({
              eventId: payload.eventId,
              customField: field,
              personType,
              index: this.fieldList.indexOf(field)
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar campos personalizados:', error);
      throw new Error(`Falha ao atualizar campos personalizados: ${error.message}`);
    } finally {
      this.context.commit('SET_LOADING', false);
    }
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
      display_order: payload.customField.display_order || payload
    };  

    const fieldResponse = await $axios.$post('event-checkout-field', requestPayload);

    if (!fieldResponse.body || fieldResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error(`Falha ao criar campo personalizado: ${payload.customField.name}`);
    }

    const fieldId = fieldResponse.body.result.id;

    if (payload.customField.type === 'MULTI_CHECKBOX' || payload.customField.type === 'MENU_DROPDOWN') {
      await this.createFieldOptions({ fieldId, options: payload.customField.selected_options.map((option) => option.name) });
    }

    if (payload.customField.tickets?.length) {
      await this.createFieldTicketRelations({
        fieldId,
        eventId: payload.eventId,
        tickets: payload.customField.tickets
      });
    }

    return fieldId;
  }

  @Action
  private async createFieldTicketRelations(payload: { 
    fieldId: string, 
    eventId: string,
    tickets: CustomFieldTicket[] 
  }) {
    const promises = payload.tickets.map(async (ticket) => {

      const responseTicket = await $axios.$get(
        `tickets?where[name][v]=${ticket.name}&where[event_id][v]=${payload.eventId}`
      );

      if (!responseTicket.body || responseTicket.body.code !== 'SEARCH_SUCCESS') {
        throw new Error(`Ticket não encontrado para o evento ${payload.eventId} e nome ${ticket.name}`);
      }

      const ticketId = responseTicket.body.result.data[0].id;

      const requestPayload = {
        event_checkout_field_id: payload.fieldId,
        ticket_id: ticketId,
      };

      const response = await $axios.$post('event-checkout-field-ticket', requestPayload);

      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error(`Falha ao criar relação com ticket ${ticketId}`);
      }
    });

    await Promise.all(promises);
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