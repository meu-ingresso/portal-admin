import { BatchOperations, CustomField, CustomFieldApiResponse, CustomFieldTicket, CustomFieldTicketApiResponse, FieldOption, FieldSelectedOption, PersonType, TicketApiResponse, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { defaultFields, getFieldOptionChanges, getNextDisplayOrder, getPersonTypeChanges, getTicketRelationChanges, isMultiOptionField, prepareFieldPayload, shouldUpdateField } from '~/utils/customFieldsHelpers';
import { handleGetResponse } from '~/utils/responseHelpers';

interface EventCustomFieldsState {
  isLoading: boolean;
  defaultFieldList: CustomField[];
  fieldList: CustomField[];
}

const defaultFieldList: CustomField[] = [
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

const mockFieldList: CustomField[] = [
  ...defaultFieldList,
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

export const state = (): EventCustomFieldsState => ({
  isLoading: false,
  defaultFieldList,
  fieldList: process.env.USE_MOCK_DATA === 'true' ? mockFieldList : [...defaultFieldList],
});

export const getters = {
  $customFields: (state: EventCustomFieldsState) => state.fieldList,
  $isLoading: (state: EventCustomFieldsState) => state.isLoading,
};

export const mutations = {
  SET_LOADING(state: EventCustomFieldsState, loading: boolean) {
    state.isLoading = loading;
  },

  SET_FIELDS(state: EventCustomFieldsState, fields: CustomField[]) {
    state.fieldList = [...fields];
  },

  ADD_FIELD(state: EventCustomFieldsState, field: CustomField) {
    state.fieldList = [...state.fieldList, field];
  },

  UPDATE_FIELD(state: EventCustomFieldsState, { index, field }: { index: number; field: CustomField }) {
    const updatedList = [...state.fieldList];
    updatedList[index] = { ...field };
    state.fieldList = updatedList;
  },

  REMOVE_FIELD(state: EventCustomFieldsState, index: number) {
    const updatedList = [...state.fieldList];
    updatedList[index]._deleted = true;
    state.fieldList = updatedList;
  },

  SWAP_FIELDS(state: EventCustomFieldsState, payload: { 
    removedIndex: number; 
    addedIndex: number; 
  }) {
    const fieldList = [...state.fieldList];
    const [removedField] = fieldList.splice(payload.removedIndex, 1);
    fieldList.splice(payload.addedIndex, 0, removedField);
    state.fieldList = fieldList;
  },
};

export const actions = {
  setFields({ commit }: any, fields: CustomField[]) {
    commit('SET_FIELDS', fields);
  },

  addField({ commit }: any, field: CustomField) {
    commit('ADD_FIELD', field);
  },

  updateField({ commit }: any, payload: { index: number; field: CustomField }) {
    commit('UPDATE_FIELD', payload);
  },

  removeField({ commit }: any, index: number) {
    commit('REMOVE_FIELD', index);
  },

  async fetchAndPopulateByEventId({ commit }: any, eventId: string) {
    try {
      commit('SET_LOADING', true); 
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
          let termsContent: string = '';

          if (isMultiOptionField(field.type)) {
            const responseFieldOptions = await $axios.$get(
              `event-checkout-field-options?where[event_checkout_field_id][v]=${field.id}`
            );

            // Trata o retorno e filtra por não deletados
            const { data: fieldOptionsResult } = handleGetResponse(responseFieldOptions, 'Opções não encontradas', null, true)

            if (field.type === 'TERMO') {
              termsContent = fieldOptionsResult[0].name;
            } else {
              selectedOptions = fieldOptionsResult.map(
                (option: FieldSelectedOption) => {
                  return {
                  id: option.id,
                    name: option.name,
                  }
                }
              );
            }
          }

          groupedFields.set(field.name, {
            name: field.name,
            type: field.type,
            is_default: false,
            options,
            person_types: [field.person_type],
            tickets: customFieldTickets,
            selected_options: selectedOptions,
            terms_content: termsContent,
            help_text: field.help_text || '',
            display_order: field.display_order,
            field_ids: fieldIds
          });
        }
      };
      
      const fields = Array.from(groupedFields.values()).sort((a, b) => a.display_order - b.display_order);
      commit('SET_FIELDS', fields);
      
    } catch (error) {
      console.error('Erro ao buscar campos personalizados:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createCustomFields({ state, dispatch }: any, eventIds: string[]): Promise<void> {
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

        const tickets = await dispatch('getEventTickets', eventId);

        // 2. Processar campos
        state.fieldList.forEach((field: CustomField, index: number) => {
          
          if (field.is_default) {
            field.tickets = tickets;
          }

          // Para cada tipo de pessoa, criar um campo
          field.person_types.forEach((personType: PersonType) => {
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
        state.fieldList.forEach((field: CustomField) => {
          // Se é campo de múltipla escolha, criar opções
          if (isMultiOptionField(field.type)) {
            field.person_types.forEach((personType: PersonType) => {
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
          field.person_types.forEach((personType: PersonType) => {
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
        await dispatch('executeBatchOperations', operations);
      }
    } catch (error) {
      console.error('Erro ao criar campos personalizados:', error);
      throw error;
    }
  },

  async deleteCustomFields(_: any, fieldId: string) {
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
  },

  validateCustomFields({ state }: any): ValidationResult {
    const errors: string[] = [];
    const fieldNames = new Set<string>();

    state.fieldList.filter((field: CustomField) => !field.is_default).forEach((field: CustomField, index: number) => {
      
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
  },

  async updateEventCustomFields({ commit, state, dispatch }: any, payload: {
    eventId: string;
    tickets: CustomFieldTicket[];
  }): Promise<void> {
    try {
      commit('SET_LOADING', true);

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

      const displayOrders = getNextDisplayOrder(state.fieldList);

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

      for (const field of state.fieldList) {

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
                await dispatch('processFieldOptions', { field, fieldId, operations });
              }
            }
          } else {
            // Novo campo
            const newField = prepareFieldPayload(
              field, 
              payload.eventId, 
              personType, 
              displayOrders[state.fieldList.indexOf(field)]
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

      await dispatch('executeBatchOperations', operations);

    } catch (error) {
      console.error('Erro ao atualizar campos personalizados:', error);
      throw new Error(`Falha ao atualizar campos personalizados: ${error.message}`);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  reset({ commit, state }: any) {
    commit('SET_FIELDS', state.defaultFieldList);
  },

  async executeBatchOperations(_: any, operations: BatchOperations): Promise<void> {
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
  },

  async processFieldOptions(_: any, payload: {
    field: CustomField, 
    fieldId: string, 
    operations: BatchOperations
  }): Promise<void> {

    try {
      
      if (!isMultiOptionField(payload.field.type) || payload.field._deleted) return;

      const optionsResponse = await $axios.$get(`event-checkout-field-options?where[event_checkout_field_id][v]=${payload.fieldId}`);

      const { data: existingOptions } = handleGetResponse(optionsResponse, 'Opções não encontradas', null, true);

      if (payload.field.type === 'TERMO') {

        if (!existingOptions.length) {
          payload.operations.optionsToCreate.push({
            event_checkout_field_id: payload.fieldId,
            name: payload.field.terms_content
          });
        } else if (payload.field.terms_content !== existingOptions[0].name) {
          payload.operations.optionsToUpdate.push({
            id: existingOptions[0].id,
            name: payload.field.terms_content
          });
        }

      } else {

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
    } catch (error) {
      console.error('Erro ao processar opções do campo:', error);
      throw new Error(`Falha ao processar opções do campo: ${error.message}`);
    }
  },

  // Função para trocar a ordem dos campos com base em milhares ou centenas
  swapFieldsOrder({ commit, state }: any, payload: { 
    removedIndex: number; 
    addedIndex: number;
  }) {

    commit('SWAP_FIELDS', payload);
    
    const sortedFields = [...state.fieldList];
    
    let useThousandsScale = true;
    
    const fieldsInTensScale = sortedFields.filter((f: CustomField) => 
      !f._deleted && f.display_order !== undefined && f.display_order < 1000
    ).length;
    
    const fieldsInThousandsScale = sortedFields.filter((f: CustomField) => 
      !f._deleted && f.display_order !== undefined && f.display_order >= 1000
    ).length;
    
    if (fieldsInThousandsScale > fieldsInTensScale) {
      useThousandsScale = false;
    }
    
    const baseOffset = useThousandsScale ? 1000 : 10;
    
    const newOrderValues = sortedFields
      .filter((f: CustomField) => !f._deleted)
      .map((_, index) => baseOffset + (index * 10));
    
    const ordersByPersonType = new Map<string, Map<number, number>>();
    
    ['PF', 'PJ', 'ESTRANGEIRO'].forEach(personType => {
      ordersByPersonType.set(personType, new Map<number, number>());
    });
      
    sortedFields.forEach((field: CustomField, index: number) => {
      if (!field._deleted) {
        const newOrder = newOrderValues[index];
        
        if (field.display_order !== newOrder) {
          commit('UPDATE_FIELD', { 
            index, 
            field: {
              ...field,
              display_order: newOrder
            }
          });
        }
      }
    });
    
    const usedDisplayOrdersByPersonType = new Map<string, Set<number>>();
    
    ['PF', 'PJ', 'ESTRANGEIRO'].forEach(personType => {
      usedDisplayOrdersByPersonType.set(personType, new Set<number>());
    });
    
    const fieldsWithDuplicateOrders = new Set<number>();
    
    sortedFields.forEach((field: CustomField, index: number) => {
      if (!field._deleted && field.display_order !== undefined) {
        field.person_types.forEach(personType => {
          const usedOrders = usedDisplayOrdersByPersonType.get(personType);
          if (usedOrders) {
            if (usedOrders.has(field.display_order)) {
              fieldsWithDuplicateOrders.add(index);
            } else {
              usedOrders.add(field.display_order);
            }
          }
        });
      }
    });
    
    fieldsWithDuplicateOrders.forEach(index => {
      const field = sortedFields[index];
      let newOrder = field.display_order;
      let isDuplicate = true;
      
      while (isDuplicate) {
        newOrder += 1;
        isDuplicate = false;
        
        for (const personType of field.person_types) {
          const usedOrders = usedDisplayOrdersByPersonType.get(personType);
          if (usedOrders && usedOrders.has(newOrder)) {
            isDuplicate = true;
            break;
          }
        }
      }
      
      commit('UPDATE_FIELD', { 
        index, 
        field: {
          ...field,
          display_order: newOrder
        }
      });
      
      field.person_types.forEach(personType => {
        const usedOrders = usedDisplayOrdersByPersonType.get(personType);
        if (usedOrders) {
          usedOrders.add(newOrder);
        }
      });
    });
  },

  async getEventTickets(_: any, eventId: string): Promise<TicketApiResponse[]> {
    const response = await $axios.$get(`tickets?where[event_id][v]=${eventId}`);
    const { data } = handleGetResponse(response, 'Ingressos não encontrados', eventId, true);
    return data;
  },
}; 