import {
  CategoryApiResponse,
  CategoryOption,
  Ticket,
  TicketApiResponse,
  ValidationResult,
} from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { splitDateTime } from '~/utils/formatters';
import { getUniqueCategories } from '~/utils/utils';
import {
  generateUniqueName,
  getCategoryChanges,
  getNextDisplayOrder,
} from '~/utils/ticketCategoryHelpers';
import { handleGetResponse } from '~/utils/responseHelpers';

interface EventTicketsState {
  ticketList: Ticket[];
  ticketCategories: CategoryOption[];
  isLoading: boolean;
}

const mockTicketList: Ticket[] = [
  {
    name: 'Ingresso Normal',
    price: '100',
    total_quantity: 100,
    total_sold: 50,
    min_purchase: 1,
    max_purchase: '10',
    start_date: '2025-02-01',
    start_time: '10:00',
    end_date: '2025-02-01',
    end_time: '12:00',
    availability: 'Publico',
    category: {
      id: null,
      value: 'Ingresso Normal',
      text: 'Ingresso Normal',
    },
    visible: true,
    status: {
      id: '1',
      name: 'Em análise',
      module: 'event',
      description: 'Em análise do ingresso',
    },
  },
  {
    name: 'Ingresso Vip',
    price: '200',
    total_quantity: 50,
    total_sold: 20,
    min_purchase: 1,
    max_purchase: '5',
    start_date: '2025-02-01',
    start_time: '10:00',
    end_date: '2025-02-01',
    end_time: '12:00',
    availability: 'Publico',
    category: {
      id: null,
      value: 'Ingresso Vip',
      text: 'Ingresso Vip',
    },
    visible: true,
    status: {
      id: '1',
      name: 'Em análise',
      module: 'event',
      description: 'Em análise do ingresso',
    },
  },
];

export const state = (): EventTicketsState => {
  const ticketList = process.env.USE_MOCK_DATA === 'true' ? mockTicketList : [];
  const ticketCategories = process.env.USE_MOCK_DATA === 'true'
    ? ticketList.map((ticket) => ticket.category)
    : [];
  
  return {
    ticketList,
    ticketCategories,
    isLoading: false,
  };
};

export const getters = {
  $isLoading: (state: EventTicketsState) => state.isLoading,
  $tickets: (state: EventTicketsState) => state.ticketList,
  $ticketCategories: (state: EventTicketsState) => state.ticketCategories.filter((category) => !category._deleted),
  $deletedCategories: (state: EventTicketsState) => state.ticketCategories.filter((category) => category._deleted),
};

export const mutations = {
  SET_LOADING(state: EventTicketsState, payload: boolean) {
    state.isLoading = payload;
  },

  SET_TICKETS(state: EventTicketsState, tickets: Ticket[]) {
    state.ticketList = tickets;
  },

  SET_TICKET_CATEGORIES(state: EventTicketsState, categories: CategoryApiResponse[]) {
    state.ticketCategories = categories.map((category) => ({
      id: category.id,
      value: category.name,
      text: category.name,
      _deleted: category.deleted_at !== null,
    }));
  },

  ADD_TICKET(state: EventTicketsState, ticket: Ticket) {
    state.ticketList = [...state.ticketList, ticket];
    state.ticketCategories = getUniqueCategories(state.ticketList);
  },

  UPDATE_TICKET(state: EventTicketsState, { index, ticket }: { index: number; ticket: Ticket }) {
    const updatedList = [...state.ticketList];
    const oldTicket = state.ticketList[index];

    // Se a categoria mudou, marca a antiga como deletada (se não estiver em uso)
    if (
      oldTicket.category &&
      (!ticket.category || oldTicket.category.value !== ticket.category.value)
    ) {
      const categoryStillInUse = state.ticketList.some(
        (t, i) => i !== index && t.category?.value === oldTicket.category?.value
      );

      if (!categoryStillInUse) {
        const categoryIndex = state.ticketCategories.findIndex(
          (cat) => cat.value === oldTicket.category?.value
        );
        if (categoryIndex !== -1) {
          state.ticketCategories[categoryIndex] = {
            ...state.ticketCategories[categoryIndex],
            _deleted: true,
          };
        }
      }
    }

    updatedList[index] = { ...ticket };
    state.ticketList = updatedList;

    // Atualiza lista de categorias mantendo as marcadas como deletadas
    const activeCategories = getUniqueCategories(updatedList);
    state.ticketCategories = [
      ...activeCategories,
      ...state.ticketCategories.filter((cat) => cat._deleted),
    ];
  },

  REMOVE_TICKET(state: EventTicketsState, index: number) {
    const removedTicket = state.ticketList[index];
    state.ticketList.splice(index, 1);

    // Se a categoria do ticket removido não está mais em uso, marca como deletada
    if (removedTicket.category) {
      const categoryStillInUse = state.ticketList.some(
        (ticket) => ticket.category?.value === removedTicket.category?.value
      );

      if (!categoryStillInUse) {
        const categoryIndex = state.ticketCategories.findIndex(
          (cat) => cat.value === removedTicket.category?.value
        );
        if (categoryIndex !== -1) {
          state.ticketCategories[categoryIndex] = {
            ...state.ticketCategories[categoryIndex],
            _deleted: true,
          };
        }
      }
    }
  },

  SWAP_TICKETS(state: EventTicketsState, payload: { removedIndex: number; addedIndex: number }) {
    const ticketList = [...state.ticketList];
    const [removedTicket] = ticketList.splice(payload.removedIndex, 1);
    ticketList.splice(payload.addedIndex, 0, removedTicket);
    state.ticketList = ticketList;
  },
};

export const actions = {
  setTickets({ commit }: any, tickets: Ticket[]) {
    commit('SET_TICKETS', tickets);
  },

  setTicketCategories({ commit }: any, categories: CategoryApiResponse[]) {
    commit('SET_TICKET_CATEGORIES', categories);
  },

  addTicket({ commit }: any, ticket: Ticket) {
    commit('ADD_TICKET', ticket);
  },

  updateTicket({ commit }: any, payload: { index: number; ticket: Ticket }) {
    commit('UPDATE_TICKET', payload);
  },

  removeTicket({ commit }: any, index: number) {
    commit('REMOVE_TICKET', index);
  },

  async createTickets({ state, dispatch }: any, eventIds: string[]): Promise<Record<string, string>[]> {
    try {
      // Array para armazenar os mapas de tickets para cada evento
      const ticketMaps: Record<string, string>[] = [];
      
      // Buscar status diretamente
      const statusResponse = await $axios.$get(`statuses?where[module][v]=ticket&where[name][v]=À Venda`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Status "À Venda" não encontrado');
      }

      const statusData = statusResponse.body.result.data[0];

      // Cria todas as categorias em uma única chamada
      const categoryMaps = await dispatch('createCategories', {
        eventIds,
        tickets: state.ticketList,
      });

      // Processa cada evento individualmente
      for (let i = 0; i < eventIds.length; i++) {
        const eventId = eventIds[i];
        const categoryMap = categoryMaps[i] || new Map<string, string>();
        const ticketMap: Record<string, string> = {};

        // Prepara o payload com todos os tickets para este evento
        const ticketsPayload = {
          data: state.ticketList.map((ticket: Ticket, index: number) => {
            const startDateTime = `${ticket.start_date}T${ticket.start_time}:00.000Z`;
            const endDateTime = `${ticket.end_date}T${ticket.end_time}:00.000Z`;

            const startDate = new Date(startDateTime);
            const endDate = new Date(endDateTime);

            return {
              event_id: eventId,
              name: ticket.name,
              total_quantity: ticket.total_quantity,
              remaining_quantity: ticket.total_quantity,
              price: parseFloat(ticket.price),
              status_id: statusData.id,
              start_date: startDate.toISOString().replace('Z', '-0300'),
              end_date: endDate.toISOString().replace('Z', '-0300'),
              availability: ticket.availability,
              min_quantity_per_user: ticket.min_purchase,
              max_quantity_per_user: ticket.max_purchase,
              ticket_event_category_id: ticket.category
                ? categoryMap.get(ticket.category.text) || null
                : null,
              display_order: ticket.display_order || index + 1,
            };
          }),
        };

        const ticketResponse = await $axios.$post('ticket', ticketsPayload);

        if (!ticketResponse.body || ticketResponse.body.code !== 'CREATE_SUCCESS') {
          throw new Error(`Falha ao criar ingressos para o evento ${eventId}`);
        }

        ticketResponse.body.result.forEach((createdTicket: any) => {
          ticketMap[createdTicket.name] = createdTicket.id;
        });

        ticketMaps.push(ticketMap);
      }

      return ticketMaps;
    } catch (error) {
      console.error('Erro ao criar ingressos:', error);
      throw error;
    }
  },

  async updateTickets({ state }: any, eventId: string) {
    try {
      // Buscar status diretamente
      const statusResponse = await $axios.$get(`statuses?where[module][v]=ticket&where[name][v]=À Venda`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Status "À Venda" não encontrado');
      }

      const statusNewTicketResponse = statusResponse.body.result.data[0];

      // 1. Busca as categorias existentes
      const categoriesResponse = await $axios.$get(
        `ticket-event-categories?where[event_id][v]=${eventId}`
      );

      const existingCategories = handleGetResponse(
        categoriesResponse,
        'Categorias não encontradas',
        eventId,
        true
      ).data;

      // 2. Prepara as operações de categoria
      const categoriesToCreate: { event_id: string; name: string }[] = [];
      const categoriesToUpdate: { id: string; name: string }[] = [];
      const categoriesToDelete: string[] = [];
      const categoryMap = new Map<string, string>();

      // Identifica mudanças necessárias nas categorias
      const categoryChanges = getCategoryChanges(existingCategories, state.ticketList);

      // Mapeia categorias existentes
      existingCategories.forEach((cat: any) => {
        categoryMap.set(cat.name, cat.id);
      });

      // Organiza operações de categoria
      state.ticketList.forEach((ticket: Ticket) => {
        if (ticket.category && ticket.category.id === '-1') {
          if (!categoriesToCreate.find((c) => c.name === ticket.category.text)) {
            // Nova categoria
            categoriesToCreate.push({
              event_id: eventId,
              name: ticket.category.text,
            });
          } else if (categoryChanges.toUpdate.find((c: any) => c.id === ticket.category?.id)) {
            // Categoria para atualizar
            categoriesToUpdate.push({
              id: ticket.category.id,
              name: ticket.category.text,
            });
          }
        }
      });

      // Adiciona categorias para deletar
      categoriesToDelete.push(...categoryChanges.toDelete);

      // 3. Executa operações de categoria em lote
      if (categoriesToCreate.length > 0) {
        const createResponse = await $axios.$post('ticket-event-category', {
          data: categoriesToCreate,
        });

        if (createResponse.body?.code === 'CREATE_SUCCESS') {
          createResponse.body.result.forEach((cat: any) => {
            categoryMap.set(cat.name, cat.id);
          });
        }
      }

      if (categoriesToUpdate.length > 0) {
        await $axios.$patch('ticket-event-category', {
          data: categoriesToUpdate,
        });
      }

      if (categoriesToDelete.length > 0) {
         const categorieDeleteResponse = await Promise.all(categoriesToDelete.map(async (categoryId) => {
          return await $axios.$delete(`ticket-event-category/${categoryId}`);
         }));

        if (categorieDeleteResponse.some((response) => response.body?.code !== 'DELETE_SUCCESS')) {
          throw new Error('Falha ao deletar categorias de ingresso');
        }
      }

      // 4. Prepara operações de tickets
      const ticketsToCreate: any[] = [];
      const ticketsToUpdate: any[] = [];
      const ticketsToDelete: string[] = [];

      // Gera display_orders válidos
      const displayOrders = getNextDisplayOrder(state.ticketList);

      // Organiza operações de tickets
      state.ticketList.forEach((ticket: Ticket, index: number) => {
        const startDateTime = `${ticket.start_date}T${ticket.start_time}:00.000Z`;
        const endDateTime = `${ticket.end_date}T${ticket.end_time}:00.000Z`;
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        const baseTicketData = {
          name: ticket.name,
          total_quantity: ticket.total_quantity,
          price: parseFloat(ticket.price),
          start_date: startDate.toISOString().replace('Z', '-0300'),
          end_date: endDate.toISOString().replace('Z', '-0300'),
          availability: ticket.availability,
          min_quantity_per_user: ticket.min_purchase,
          max_quantity_per_user: ticket.max_purchase,
          ticket_event_category_id: ticket.category
            ? categoryMap.get(ticket.category.text)
            : null,
          display_order: ticket.display_order || displayOrders[index],
        };

        if (ticket.id === '-1') {
          // Novo ticket
          ticketsToCreate.push({
            ...baseTicketData,
            event_id: eventId,
            remaining_quantity: ticket.total_quantity,
            status_id: statusNewTicketResponse.id,
          });
        } else if (ticket._deleted) {
          // Ticket para deletar
          ticketsToDelete.push(ticket.id);
        } else {
          // Ticket para atualizar
          ticketsToUpdate.push({
            ...baseTicketData,
            id: ticket.id,
          });
        }
      });

      // 5. Executa operações de tickets em lote
      if (ticketsToCreate.length > 0) {
        await $axios.$post('ticket', { data: ticketsToCreate });
      }

      if (ticketsToUpdate.length > 0) {
        await $axios.$patch('ticket', { data: ticketsToUpdate });
      }

      if (ticketsToDelete.length > 0) {
        await $axios.$delete('ticket', { data: ticketsToDelete });
      }
    } catch (error) {
      console.error('Erro ao atualizar ingressos:', error);
      throw error;
    }
  },

  async fetchAndPopulateByEventId({ commit }: any, eventId: string) {
    try {
      commit('SET_LOADING', true);

      const promises = [      
        $axios.$get(
          `tickets?where[event_id][v]=${eventId}&preloads[]=category&preloads[]=status&limit=9999`
        ),
        $axios.$get(`ticket-event-categories?where[event_id][v]=${eventId}`)
      ];

      const [ticketsResponse, categoriesResponse] = await Promise.all(promises);

      const ticketsResult = handleGetResponse(
        ticketsResponse,
        'Tickets não encontrados',
        eventId,
        true
      );

      const categoriesResult = handleGetResponse(
        categoriesResponse,
        'Categorias não encontradas',
        eventId,
        true
      );

      const orderedTickets = ticketsResult.data.sort(
        (a: TicketApiResponse, b: TicketApiResponse) => a.display_order - b.display_order
      );
      
      commit('SET_TICKET_CATEGORIES', categoriesResult.data);

      const ticketsToCommit = orderedTickets.map((ticket: any) => {
        const category = {
          id: ticket?.category?.id,
          value: ticket?.category?.name,
          text: ticket?.category?.name,
          _deleted: ticket?.category?.deleted_at,
        };

        // Separar data e hora
        const startDateTime = splitDateTime(ticket.start_date);
        const endDateTime = splitDateTime(ticket.end_date);

        return {
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          total_quantity: ticket.total_quantity,
          total_sold: ticket.total_sold,
          min_purchase: ticket.min_quantity_per_user,
          max_purchase: ticket.max_quantity_per_user,
          availability: ticket.availability,
          display_order: ticket.display_order,
          category: ticket.category ? category : null,
          start_date: startDateTime.date,
          start_time: startDateTime.time,
          end_date: endDateTime.date,
          end_time: endDateTime.time,
          _deleted: ticket.deleted_at,
          status: ticket.status,
        };
      });

      commit('SET_TICKETS', ticketsToCommit);

      return { success: true, data: ticketsToCommit };

    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  validateTickets({ state }: any): ValidationResult {
    const errors: string[] = [];
    const ticketNames = new Set<string>();

    state.ticketList.forEach((ticket: Ticket, index: number) => {
      // Validação de nome duplicado
      if (ticketNames.has(ticket.name)) {
        errors.push(`Ticket "${ticket.name}" está duplicado`);
      }
      ticketNames.add(ticket.name);

      // Validações básicas
      if (!ticket.name?.trim()) {
        errors.push(`Ticket ${index + 1}: Nome é obrigatório`);
      }

      if (!ticket.price || Number(ticket.price) < 0) {
        errors.push(`Ticket ${index + 1}: Preço deve ser maior ou igual a zero`);
      }

      if (!ticket.total_quantity || Number(ticket.total_quantity) <= 0) {
        errors.push(`Ticket ${index + 1}: Quantidade máxima deve ser maior que zero`);
      }

      if (!ticket.min_purchase || Number(ticket.min_purchase) <= 0) {
        errors.push(`Ticket ${index + 1}: Quantidade mínima deve ser maior que zero`);
      }

      // Validação de datas
      if (!ticket.start_date || !ticket.start_time) {
        errors.push(`Ticket ${index + 1}: Data e hora de início são obrigatórios`);
      }

      if (!ticket.end_date || !ticket.end_time) {
        errors.push(`Ticket ${index + 1}: Data e hora de término são obrigatórios`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  reset({ commit }: any) {
    commit('SET_TICKETS', []);
    commit('SET_TICKET_CATEGORIES', []);
  },

  async createTicketCategory({ dispatch }: any, payload: {
    eventId: string;
    category: string;
  }): Promise<void> {
    try {
      const response = await $axios.$post('ticket-event-category', {
        data: [{
          event_id: payload.eventId,
          name: payload.category,
        }],
      });

      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error(`Falha ao criar categoria de ingresso para o evento ${payload.eventId}`);
      }

      await dispatch('fetchAndPopulateByEventId', payload.eventId);
    } catch (error) {
      console.error('Erro ao criar categoria de ingresso:', error);
      throw error;
    }
  },

  async createCategories(_: any, payload: {
    eventIds: string[];
    tickets: Ticket[];
  }): Promise<Map<string, string>[]> {
    try {
      // Extrai categorias únicas dos tickets
      const uniqueCategories = new Set(
        payload.tickets
          .filter((ticket) => ticket.category?.text)
          .map((ticket) => ticket.category.text)
      );

      if (uniqueCategories.size === 0) return [];

      // Array para armazenar os mapas de categorias para cada evento
      const categoryMaps: Map<string, string>[] = [];
      
      // Processa cada evento individualmente
      for (const eventId of payload.eventIds) {
        // Prepara o payload para criar categorias para este evento
        const categoriesPayload = {
          data: Array.from(uniqueCategories).map((categoryName) => ({
            event_id: eventId,
            name: categoryName,
          })),
        };

        const response = await $axios.$post('ticket-event-category', categoriesPayload);

        if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
          throw new Error(`Falha ao criar categorias de ingresso para o evento ${eventId}`);
        }

        // Cria um mapa com nome da categoria -> id para este evento
        const categoryMap = new Map<string, string>();
        response.body.result.forEach((category: any) => {
          categoryMap.set(category.name, category.id);
        });
        
        categoryMaps.push(categoryMap);
      }

      return categoryMaps;
    } catch (error) {
      console.error('Erro ao criar categorias:', error);
      throw error;
    }
  },

  async swapTicketsOrder({ commit, state }: any, payload: {
    removedIndex: number;
    addedIndex: number;
    persist: boolean;
  }) {
    const { removedIndex, addedIndex, persist } = payload;

    // Encontra os tickets na lista completa
    const movedTicket = state.ticketList[removedIndex];
    const targetTicket = state.ticketList[addedIndex];

    // Encontra os índices reais
    const movedRealIndex = state.ticketList.findIndex(
      (t: Ticket) => t.id === movedTicket.id || (t.name === movedTicket.name && !t.id)
    );

    const targetRealIndex = state.ticketList.findIndex(
      (t: Ticket) => t.id === targetTicket.id || (t.name === targetTicket.name && !t.id)
    );

    // Troca os display_orders
    const movedDisplayOrder = movedTicket.display_order;
    const targetDisplayOrder = targetTicket.display_order;

    if (persist) {
      try {
        commit('UPDATE_TICKET', {
          index: movedRealIndex,
          ticket: {
            ...movedTicket,
            display_order: targetDisplayOrder,
          },
        });

        commit('UPDATE_TICKET', {
          index: targetRealIndex,
          ticket: {
            ...targetTicket,
            display_order: movedDisplayOrder,
          },
        });

        commit('SWAP_TICKETS', { removedIndex, addedIndex });

        // Atualiza o display_order de todos os tickets
        const updateData = state.ticketList.map((ticket: Ticket, index: number) => {
          return {
            id: ticket.id,
            display_order: index + 1,
          };
        });

        await $axios.$patch('ticket', { data: updateData });
      } catch (error) {
        throw new Error('Falha ao reordenar tickets');
      }
    } else {
      // Atualiza o estado local apenas
      commit('UPDATE_TICKET', {
        index: movedRealIndex,
        ticket: {
          ...movedTicket,
          display_order: targetDisplayOrder,
        },
      });

      commit('UPDATE_TICKET', {
        index: targetRealIndex,
        ticket: {
          ...targetTicket,
          display_order: movedDisplayOrder,
        },
      });

      commit('SWAP_TICKETS', { removedIndex, addedIndex });
    }
  },

  async fetchDeleteTicket({ commit, state }: any, ticketId: string): Promise<void> {
    try {
      // 1. Buscar ticket com categoria
      const ticketResponse = await $axios.$get(
        `tickets?where[id][v]=${ticketId}&preloads[]=category`
      );

      const ticketResult = handleGetResponse(
        ticketResponse,
        'Ticket não encontrado',
        ticketId,
        true
      );

      const hasSales = ticketResult.data.total_sold > 0;

      if (hasSales) {
        throw new Error('TICKET_HAS_SALES');
      }

      // 2. Buscar e atualizar para status "Indisponível" antes de deletar
      const statusResponse = await $axios.$get(`statuses?where[module][v]=ticket&where[name][v]=Indisponível`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Status "Indisponível" não encontrado');
      }

      const unavailableStatus = statusResponse.body.result.data[0];

      await $axios.$patch('ticket', {
        id: ticketId,
        status_id: unavailableStatus.id,
      });

      const categoryId = ticketResult.data?.category?.id;

      // 3. Deletar o ticket
      const response = await $axios.$delete(`ticket/${ticketId}`);

      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao remover ingresso');
      }

      // 4. Se tinha categoria, verificar se ainda está em uso
      if (categoryId) {
        // Buscar outros tickets que usam a mesma categoria
        const otherTicketsResponse = await $axios.$get(
          `tickets?where[ticket_event_category_id][v]=${categoryId}`
        );

        const otherTicketsResult = handleGetResponse(
          otherTicketsResponse,
          'Tickets não encontrados',
          ticketId,
          true
        );

        // Filtrar tickets que não são o ticket a ser deletado
        const filteredTickets = otherTicketsResult.data.filter(
          (ticket: TicketApiResponse) => ticket.id !== ticketId
        );

        // Se não há outros tickets usando a categoria, deletá-la
        if (filteredTickets.length === 0) {
          const deleteCategoryResponse = await $axios.$delete(
            `ticket-event-category/${categoryId}`
          );

          if (
            !deleteCategoryResponse.body ||
            deleteCategoryResponse.body.code !== 'DELETE_SUCCESS'
          ) {
            throw new Error('Falha ao deletar categoria');
          }
        }
      }

      // 5. Atualizar o state
      const ticketIndex = state.ticketList.findIndex((t: Ticket) => t.id === ticketId);
      if (ticketIndex !== -1) {
        commit('UPDATE_TICKET', {
          index: ticketIndex,
          ticket: {
            ...state.ticketList[ticketIndex],
            _deleted: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error('Erro ao remover ingresso:', error);
      throw error;
    }
  },

  async inactivateTicket(_: any, ticketId: string): Promise<void> {
    try {
      // Busca o status "Indisponível"
      const statusResponse = await $axios.$get(`statuses?where[module][v]=ticket&where[name][v]=Indisponível`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Status "Indisponível" não encontrado');
      }

      const unavailableStatus = statusResponse.body.result.data[0];

      // Atualiza o ticket com end_date atual e status
      const response = await $axios.$patch('ticket', {
        id: ticketId,
        end_date: new Date().toISOString(),
        status_id: unavailableStatus.id,
      });

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao inativar ingresso');
      }
    } catch (error) {
      console.error('Erro ao inativar ingresso:', error);
      throw error;
    }
  },

  async createSingleTicket({ commit, state }: any, payload: {
    eventId: string;
    ticket: Ticket;
  }): Promise<string> {
    try {
      commit('SET_LOADING', true);

      // Busca o status "À Venda"
      const statusResponse = await $axios.$get(`statuses?where[module][v]=ticket&where[name][v]=À Venda`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Status "À Venda" não encontrado');
      }

      const statusData = statusResponse.body.result.data[0];

      let categoryId = null;

      // Se tem categoria e ela é nova (id === '-1'), cria primeiro
      if (payload.ticket.category && payload.ticket.category.id === '-1') {
        const categoriesPayload = {
          data: [
            {
              event_id: payload.eventId,
              name: payload.ticket.category.text,
            },
          ],
        };

        const categoryResponse = await $axios.$post(
          'ticket-event-category',
          categoriesPayload
        );

        if (!categoryResponse.body || categoryResponse.body.code !== 'CREATE_SUCCESS') {
          throw new Error('Falha ao criar categoria do ingresso');
        }

        categoryId = categoryResponse.body.result[0].id;
      } else {
        categoryId = payload.ticket.category?.id;
      }

      // Obtém o próximo display_order
      const nextOrder = getNextDisplayOrder(state.ticketList, true) as number;

      // Combina data e hora em uma única string ISO
      const startDateTime = `${payload.ticket.start_date}T${payload.ticket.start_time}:00.000Z`;
      const endDateTime = `${payload.ticket.end_date}T${payload.ticket.end_time}:00.000Z`;

      // Converte para Date para manipulação
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      // Prepara o payload do ticket usando o formato de array
      const ticketPayload = {
        data: [
          {
            event_id: payload.eventId,
            name: payload.ticket.name,
            total_quantity: payload.ticket.total_quantity,
            remaining_quantity: payload.ticket.total_quantity,
            price: parseFloat(payload.ticket.price),
            status_id: statusData.id,
            start_date: startDate.toISOString().replace('Z', '-0300'),
            end_date: endDate.toISOString().replace('Z', '-0300'),
            availability: payload.ticket.availability,
            min_quantity_per_user: payload.ticket.min_purchase,
            max_quantity_per_user: payload.ticket.max_purchase,
            ticket_event_category_id: categoryId,
            display_order: nextOrder,
          },
        ],
      };

      const ticketResponse = await $axios.$post('ticket', ticketPayload);

      if (!ticketResponse.body || ticketResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error(`Falha ao criar ingresso: ${payload.ticket.name}`);
      }

      // Retorna o ID do ticket criado
      return ticketResponse.body.result[0].id;
    } catch (error) {
      console.error('Erro ao criar ingresso:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateSingleTicket({ commit, state }: any, payload: {
    ticketId: string;
    ticket: Ticket;
    eventId: string;
  }): Promise<boolean> {
    try {
      commit('SET_LOADING', true);
      let categoryId = null;

      // 1. Tratamento da categoria
      if (payload.ticket.category) {
        if (payload.ticket.category.id === '-1') {
          console.log('[UPDATE SINGLE TICKET] - Categoria nova', payload.ticket.category);

          // Categoria nova, cria usando o novo formato
          const categoryPayload = {
            data: [
              {
                event_id: payload.eventId,
                name: payload.ticket.category.text,
              },
            ],
          };

          const categoryResponse = await $axios.$post(
            'ticket-event-category',
            categoryPayload
          );

          if (!categoryResponse.body || categoryResponse.body.code !== 'CREATE_SUCCESS') {
            throw new Error('Falha ao criar categoria do ingresso');
          }

          categoryId = categoryResponse.body.result[0].id;
        } else {
          console.log('[UPDATE SINGLE TICKET] - Categoria existente', payload.ticket.category);

          categoryId = payload.ticket.category.id;

          // Atualiza o nome da categoria
          const categoryUpdatePayload = {
            data: [
              {
                id: categoryId,
                name: payload.ticket.category.text,
              },
            ],
          };

          await $axios.$patch('ticket-event-category', categoryUpdatePayload);
        }
      }

      // 2. Combina data e hora em uma única string ISO
      const startDateTime = `${payload.ticket.start_date}T${payload.ticket.start_time}:00.000Z`;
      const endDateTime = `${payload.ticket.end_date}T${payload.ticket.end_time}:00.000Z`;

      // Converte para Date para manipulação
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      // 3. Monta o payload da atualização
      const updatePayload = {
        data: [
          {
            id: payload.ticketId,
            name: payload.ticket.name,
            total_quantity: payload.ticket.total_quantity,
            price: parseFloat(payload.ticket.price),
            start_date: startDate.toISOString().replace('Z', '-0300'),
            end_date: endDate.toISOString().replace('Z', '-0300'),
            availability: payload.ticket.availability,
            min_quantity_per_user: payload.ticket.min_purchase,
            max_quantity_per_user: payload.ticket.max_purchase,
            ticket_event_category_id: categoryId,
            display_order: payload.ticket.display_order,
          },
        ],
      };

      // 4. Faz a chamada de atualização
      const response = await $axios.$patch('ticket', updatePayload);

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error(`Falha ao atualizar ingresso: ${payload.ticket.name}`);
      }

      const oldTicket = state.ticketList.find((t: Ticket) => t.id === payload.ticketId);

      // 5. Se a categoria antiga não está mais em uso, pode deletá-la
      if (
        oldTicket?.category?.id &&
        oldTicket.category.id !== '-1' &&
        oldTicket.category.id !== categoryId
      ) {
        // Busca outros tickets que usam a categoria antiga
        const oldCategoryId = oldTicket.category.id;
        const ticketsWithOldCategory = state.ticketList.filter(
          (t: Ticket) =>
            t.category?.id === oldCategoryId && t.id !== payload.ticketId && !t._deleted
        );

        // Se não há outros tickets usando a categoria antiga, deleta
        if (ticketsWithOldCategory.length === 0) {
          try {
            const deleteCategoryResponse = await $axios.$delete(
              `ticket-event-category/${oldCategoryId}`
            );

            if (
              !deleteCategoryResponse.body ||
              deleteCategoryResponse.body.code !== 'DELETE_SUCCESS'
            ) {
              console.warn('Falha ao deletar categoria antiga');
            }
          } catch (error) {
            console.warn('Erro ao tentar deletar categoria antiga:', error);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar ingresso:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async stopTicketSales({ commit }: any, ticketId: string): Promise<void> {
    try {
      commit('SET_LOADING', true);

      // 1. Busca o status "Interrompido"
      const statusResponse = await $axios.$get(`statuses?where[module][v]=ticket&where[name][v]=Interrompido`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Status "Interrompido" não encontrado');
      }

      const unavailableStatus = statusResponse.body.result.data[0];

      // 2. Atualiza o ticket com end_date atual e status Interrompido
      const response = await $axios.$patch('ticket', {
        data: [
          {
            id: ticketId,
            end_date: new Date().toISOString().replace('Z', '-0300'),
            status_id: unavailableStatus.id,
          },
        ],
      });

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao interromper vendas do ingresso');
      }
    } catch (error) {
      console.error('Erro ao interromper vendas:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async duplicateTicket({ commit, state }: any, payload: {
    ticketId: string;
    eventId: string;
  }): Promise<string> {
    try {
      commit('SET_LOADING', true);

      // 1. Encontra o ticket original
      const originalTicket = state.ticketList.find((t: Ticket) => t.id === payload.ticketId);
      if (!originalTicket) {
        throw new Error('Ticket original não encontrado');
      }

      // 2. Gera nome único para o novo ticket
      const newName = generateUniqueName(originalTicket.name, state.ticketList);

      // 3. Busca próximo display_order disponível
      const nextOrder = getNextDisplayOrder(state.ticketList, true) as number;

      // 4. Busca o status "À Venda"
      const statusResponse = await $axios.$get(`statuses?where[module][v]=ticket&where[name][v]=À Venda`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Status "À Venda" não encontrado');
      }

      const availableStatus = statusResponse.body.result.data[0];

      // 5. Prepara o novo ticket
      const newTicket = {
        event_id: payload.eventId,
        name: newName,
        total_quantity: originalTicket.total_quantity,
        total_sold: 0,
        price: originalTicket.price,
        status_id: availableStatus.id,
        start_date: originalTicket.start_date,
        end_date: originalTicket.end_date,
        availability: originalTicket.availability,
        min_purchase: originalTicket.min_purchase,
        max_purchase: originalTicket.max_purchase,
        ticket_event_category_id: originalTicket.category?.id,
        display_order: nextOrder,
      };

      // 6. Cria o novo ticket na API
      const response = await $axios.$post('ticket', {
        data: [newTicket],
      });

      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error(`Falha ao duplicar ingresso: ${newName}`);
      }

      return response.body.result[0].id;
    } catch (error) {
      console.error('Erro ao duplicar ingresso:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
}; 