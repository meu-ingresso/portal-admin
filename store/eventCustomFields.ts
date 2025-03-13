import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { BatchOperations, CustomField, CustomFieldApiResponse, CustomFieldTicket, CustomFieldTicketApiResponse, FieldOption, FieldSelectedOption, PersonType, TicketApiResponse, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { defaultFields, getFieldOptionChanges, getNextDisplayOrder, getPersonTypeChanges, getTicketRelationChanges, isMultiOptionField, prepareFieldPayload, shouldUpdateField } from '~/utils/customFieldsHelpers';
import { handleGetResponse } from '~/utils/responseHelpers';

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

  @Mutation
  private SWAP_FIELDS(payload: { 
    removedIndex: number; 
    addedIndex: number; 
  }) {
    const fieldList = [...this.fieldList];
    const [removedField] = fieldList.splice(payload.removedIndex, 1);
    fieldList.splice(payload.addedIndex, 0, removedField);
    this.fieldList = fieldList;
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
      const fieldsResult = handleGetResponse(response, 'Campos personalizados não encontrados', eventId, true);
      
      const groupedFields = new Map<string, CustomField>();
      
      // Inicializa o objeto field_ids com todas as chaves necessárias
      const initializeFieldIds = (): Record<PersonType, string> => ({
        PF: '',
        PJ: '',
        ESTRANGEIRO: '',
      });

      // Primeiro, vamos processar os campos padrão
      const defaultFieldsData = fieldsResult.data.filter((field: CustomFieldApiResponse) => defaultFields.includes(field.name));
      const customFieldsData = fieldsResult.data.filter((field: CustomFieldApiResponse) => !defaultFields.includes(field.name));

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

          // Trata o retorno e filtra por não deletados
          const { data: checkoutFieldsTicketsResult } = handleGetResponse(responseCheckoutFieldsTickets, 'Relação de tickets não encontrados', null, true)

          const customFieldTickets = checkoutFieldsTicketsResult.map(
            (customFieldTicket: CustomFieldTicketApiResponse) => ({
              id: customFieldTicket.ticket.id,
              name: customFieldTicket.ticket.name,
            })
          );

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

          // Trata o retorno e filtra por não deletados
          const { data: checkoutFieldsTicketsResult } = handleGetResponse(responseCheckoutFieldsTickets, 'Relação de tickets não encontrados', null, true)

          // Filtra os tickets que existem
          const checkoutFieldsTicketsResultWithTicket = checkoutFieldsTicketsResult.filter((customFieldTicket: CustomFieldTicketApiResponse) => customFieldTicket.ticket);

          const customFieldTickets = checkoutFieldsTicketsResultWithTicket.map(
            (customFieldTicket: CustomFieldTicketApiResponse) => ({
              id: customFieldTicket.ticket.id,
              name: customFieldTicket.ticket.name,
              _deleted: customFieldTicket.ticket.deleted_at
            })
          )
          
          let selectedOptions: FieldSelectedOption[] = [];
          
          if (isMultiOptionField(field.type)) {
            const responseFieldOptions = await $axios.$get(
              `event-checkout-field-options?where[event_checkout_field_id][v]=${field.id}`
            );

            // Trata o retorno e filtra por não deletados
            const { data: fieldOptionsResult } = handleGetResponse(responseFieldOptions, 'Opções não encontradas', null, true)

            selectedOptions = fieldOptionsResult.map(
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
  public async createCustomFields(eventIds: string[]): Promise<void> {
    try {
      // Para cada evento, teremos um conjunto de operações em lote
      for (const eventId of eventIds) {
        // 1. Preparar arrays para operações em lote
        const operations: BatchOperations = {
          fieldsToCreate: [],
          fieldsToUpdate: [],
          fieldsToDelete: [],
          optionsToCreate: [],
          optionsToUpdate: [],
          optionsToDelete: [],
          ticketRelationsToCreate: [],
          ticketRelationsToDelete: []
        };

        const fieldMap = new Map<string, string>(); 

        const tickets = await this.getEventTickets(eventId);

        // 2. Processar campos
        this.fieldList.forEach((field, index) => {
          
          if (field.is_default) {
            field.tickets = tickets;
          }

          // Para cada tipo de pessoa, criar um campo
          field.person_types.forEach((personType) => {
            operations.fieldsToCreate.push({
              event_id: eventId,
              name: field.name,
              type: field.type,
              person_type: personType,
              required: field.options.includes('required'),
              visible_on_ticket: field.options.includes('visible_on_ticket'),
              is_unique: field.options.includes('is_unique'),
              help_text: field.help_text || '',
              display_order: field.display_order || index
            });
          });
        });

        // 3. Criar todos os campos de uma vez
        const fieldsResponse = await $axios.$post('event-checkout-field', {
          data: operations.fieldsToCreate
        });

        // Limpa o array de campos a serem criados
        operations.fieldsToCreate = [];

        if (!fieldsResponse.body || fieldsResponse.body.code !== 'CREATE_SUCCESS') {
          throw new Error(`Falha ao criar campos personalizados para o evento ${eventId}`);
        }

        // 4. Mapear campos criados
        fieldsResponse.body.result.forEach((createdField: any) => {
          fieldMap.set(`${createdField.name}-${createdField.person_type}`, createdField.id);
        });

        // 5. Preparar criação de opções e relações com tickets
        this.fieldList.forEach((field) => {
          // Se é campo de múltipla escolha, criar opções
          if (isMultiOptionField(field.type)) {
            field.person_types.forEach((personType) => {
              const fieldId = fieldMap.get(`${field.name}-${personType}`);
              if (fieldId) {
                field.selected_options.forEach((option) => {
                  operations.optionsToCreate.push({
                    event_checkout_field_id: fieldId,
                    name: option.name
                  });
                });
              }
            });
          }

          // Criar relações com tickets
          field.person_types.forEach((personType) => {
            const fieldId = fieldMap.get(`${field.name}-${personType}`);
            if (fieldId) {
              field.tickets.forEach((ticket) => {

                const ticketId = tickets.find((t: TicketApiResponse) => t.name === ticket.name)?.id;

                operations.ticketRelationsToCreate.push({
                  event_checkout_field_id: fieldId,
                  ticket_id: ticketId
                });
              });
            }
          });
        });

        // 6. Executar operações em lote para opções e relações
        await this.executeBatchOperations(operations);
      }
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

      const [fieldsResponse, ticketsFromEventResponse] = await Promise.all([
        $axios.$get(`event-checkout-fields?where[event_id][v]=${payload.eventId}`),
        $axios.$get(`tickets?where[event_id][v]=${payload.eventId}`)
      ]);

      const { data: existingFields } = handleGetResponse(fieldsResponse, 'Campos personalizados não encontrados', payload.eventId, true);
      const { data: ticketsFromEvent } = handleGetResponse(ticketsFromEventResponse, 'Ingressos não encontrados', payload.eventId, true);

      const operations: BatchOperations = {
        fieldsToCreate: [],
        fieldsToUpdate: [],
        fieldsToDelete: [],
        optionsToCreate: [],
        optionsToUpdate: [],
        optionsToDelete: [],
        ticketRelationsToCreate: [],
        ticketRelationsToDelete: [],
      };

      const displayOrders = getNextDisplayOrder(this.fieldList);

      // Mapeia os tickets existentes para fácil acesso
      const existingTickets = new Map(
        ticketsFromEvent.map((ticket: TicketApiResponse) => [
          ticket.id,
          {
            id: ticket.id,
            name: ticket.name,
            _deleted: ticket.deleted_at
          }
        ])
      );

      for (const field of this.fieldList) {

        if (field.is_default) continue;

        const personTypeChanges = getPersonTypeChanges(field);
        operations.fieldsToDelete.push(...personTypeChanges.toDelete);

        for (const personType of field.person_types) {

          const fieldId = field.field_ids?.[personType];
          const existingField = existingFields.find((f: CustomFieldApiResponse) => f.id === fieldId);

          if (fieldId && existingField) {
            if (field._deleted) {
              operations.fieldsToDelete.push(fieldId);
            } else {
              // Verifica se o campo precisa ser atualizado
              if (shouldUpdateField(existingField, field)) {
                operations.fieldsToUpdate.push(
                  prepareFieldPayload(field, payload.eventId, personType, field.display_order)
                );
              }

              // Busca as relações existentes com tickets
              const ticketRelationsResponse = await $axios.$get(
                `event-checkout-fields-tickets?where[event_checkout_field_id][v]=${fieldId}`
              );

              const existingTicketRelations = handleGetResponse(
                ticketRelationsResponse,
                'Relações de tickets não encontradas',
                null,
                true
              ).data;

              // Processa mudanças nas relações com tickets
              const currentTickets = field.tickets.map(ticket => ({
                id: ticket.id,
                name: ticket.name,
                _deleted: (existingTickets.get(ticket.id) as CustomFieldTicket)?._deleted || false
              }));

              const relationChanges = getTicketRelationChanges(
                existingTicketRelations,
                Array.from(existingTickets.values()) as CustomFieldTicket[],
                currentTickets
              );

              // Adiciona relações para criar/deletar
              operations.ticketRelationsToDelete.push(...relationChanges.toDelete);
              operations.ticketRelationsToCreate.push(
                ...relationChanges.toCreate.map(ticket => ({
                  event_checkout_field_id: fieldId,
                  ticket_id: ticket.id
                }))
              );

              // Processa opções se for campo multi-opção
              if (isMultiOptionField(field.type)) {
                await this.processFieldOptions({ field, fieldId, operations });
              }
            }
          } else {
            // Novo campo
            const newField = prepareFieldPayload(
              field, 
              payload.eventId, 
              personType, 
              displayOrders[this.fieldList.indexOf(field)]
            );
            operations.fieldsToCreate.push(newField);

            // Adiciona relações com tickets para o novo campo
            // Note: As relações serão criadas após o campo ser criado
            field.tickets.forEach(ticket => {
              if (!ticket._deleted) {
                operations.ticketRelationsToCreate.push({
                  // Temporariamente usamos um placeholder que será substituído pelo ID real
                  event_checkout_field_id: `NEW_FIELD_${field.name}_${personType}`,
                  ticket_id: ticket.id
                });
              }
            });

            // Se for campo multi-opção, adiciona as opções
            if (isMultiOptionField(field.type)) {
              field.selected_options.forEach(option => {
                operations.optionsToCreate.push({
                  // Temporariamente usamos um placeholder que será substituído pelo ID real
                  event_checkout_field_id: `NEW_FIELD_${field.name}_${personType}`,
                  name: option.name
                });
              });
            }
          }
        }
      }

      // Primeiro criamos os campos
      if (operations.fieldsToCreate.length > 0) {
        const createFieldsResponse = await $axios.$post('event-checkout-field', { 
          data: operations.fieldsToCreate 
        });

        // Limpa o array de campos a serem criados
        operations.fieldsToCreate = [];
        
        // Atualiza os IDs dos campos nas relações e opções
        if (createFieldsResponse.body?.result) {
          createFieldsResponse.body.result.forEach((createdField: any) => {
            // Atualiza os IDs nas relações com tickets
            operations.ticketRelationsToCreate = operations.ticketRelationsToCreate.map(relation => {
              if (relation.event_checkout_field_id === `NEW_FIELD_${createdField.name}_${createdField.person_type}`) {
                return {
                  ...relation,
                  event_checkout_field_id: createdField.id
                };
              }
              return relation;
            });

            // Atualiza os IDs nas opções
            operations.optionsToCreate = operations.optionsToCreate.map(option => {
              if (option.event_checkout_field_id === `NEW_FIELD_${createdField.name}_${createdField.person_type}`) {
                return {
                  ...option,
                  event_checkout_field_id: createdField.id
                };
              }
              return option;
            });
          });
        }
      }

      await this.executeBatchOperations(operations);

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
  private async executeBatchOperations(operations: BatchOperations): Promise<void> {
    const apiCalls = [];

    if (operations.fieldsToDelete.length > 0) {
      operations.fieldsToDelete.forEach(fieldId => {
        apiCalls.push($axios.$delete(`event-checkout-field/${fieldId}`));
      });
    }

    if (operations.fieldsToCreate.length > 0) {
      apiCalls.push($axios.$post('event-checkout-field', { data: operations.fieldsToCreate }));
    }

    if (operations.fieldsToUpdate.length > 0) {
      apiCalls.push($axios.$patch('event-checkout-field', { data: operations.fieldsToUpdate }));
    }

    if (operations.optionsToDelete.length > 0) {
      operations.optionsToDelete.forEach(optionId => {
        apiCalls.push($axios.$delete(`event-checkout-field-option/${optionId}`));
      });
    }

    if (operations.optionsToCreate.length > 0) {
      apiCalls.push($axios.$post('event-checkout-field-option', { data: operations.optionsToCreate }));
    }

    if (operations.optionsToUpdate.length > 0) {
      apiCalls.push($axios.$patch('event-checkout-field-option', { data: operations.optionsToUpdate }));
    }

    if (operations.ticketRelationsToDelete.length > 0) {
      operations.ticketRelationsToDelete.forEach(relationId => {
        apiCalls.push($axios.$delete(`event-checkout-field-ticket/${relationId}`));
      });
    }

    if (operations.ticketRelationsToCreate.length > 0) {
      apiCalls.push($axios.$post('event-checkout-field-ticket', { data: operations.ticketRelationsToCreate }));
    }

    await Promise.all(apiCalls);
  }

  @Action
  public async processFieldOptions(payload: {
    field: CustomField, 
    fieldId: string, 
    operations: BatchOperations
  }): Promise<void> {
    if (!isMultiOptionField(payload.field.type) || payload.field._deleted) return;

    const optionsResponse = await $axios.$get(`event-checkout-field-options?where[event_checkout_field_id][v]=${payload.fieldId}`);

    const { data: existingOptions } = handleGetResponse(optionsResponse, 'Opções não encontradas', null, true);

    const optionChanges = getFieldOptionChanges(existingOptions, payload.field.selected_options);
    
    payload.operations.optionsToCreate.push(...optionChanges.toCreate.map(name => ({
      event_checkout_field_id: payload.fieldId,
      name
    })));

    payload.operations.optionsToUpdate.push(...optionChanges.toUpdate.map(opt => ({
      id: opt.id,
      name: opt.name
    })));

    payload.operations.optionsToDelete.push(...optionChanges.toDelete);
  }

  @Action
  public swapFieldsOrder(payload: { 
    removedIndex: number; 
    addedIndex: number;
  }) {
    const { removedIndex, addedIndex } = payload;
    
    const movedField = this.fieldList[removedIndex];
    const targetField = this.fieldList[addedIndex];
    
    // Encontra os índices reais
    const movedRealIndex = this.fieldList.findIndex(f => 
      f.id === movedField.id || 
      (f.name === movedField.name && !f.id)
    );
    
    const targetRealIndex = this.fieldList.findIndex(f => 
      f.id === targetField.id || 
      (f.name === targetField.name && !f.id)
    );

    // Troca os display_orders
    const movedDisplayOrder = movedField.display_order;
    const targetDisplayOrder = targetField.display_order;

    this.context.commit('UPDATE_FIELD', { 
      index: movedRealIndex, 
      field: {
        ...movedField,
        display_order: targetDisplayOrder
      }
    });

    this.context.commit('UPDATE_FIELD', { 
      index: targetRealIndex, 
      field: {
        ...targetField,
        display_order: movedDisplayOrder
      }
    });

    this.context.commit('SWAP_FIELDS', { removedIndex, addedIndex });
  }


  @Action
  private async getEventTickets(eventId: string): Promise<TicketApiResponse[]> {
    const response = await $axios.$get(`tickets?where[event_id][v]=${eventId}`);
    const { data } = handleGetResponse(response, 'Ingressos não encontrados', eventId, true);
    return data;
  }

} 