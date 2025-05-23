import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import {
  CategoryApiResponse,
  CategoryOption,
  Ticket,
  TicketApiResponse,
  ValidationResult,
} from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { status } from '@/utils/store-util';
import { splitDateTime } from '~/utils/formatters';
import { getUniqueCategories } from '~/utils/utils';
import {
  generateUniqueName,
  getCategoryChanges,
  getNextDisplayOrder,
} from '~/utils/ticketCategoryHelpers';
import { handleGetResponse } from '~/utils/responseHelpers';
@Module({
  name: 'eventTickets',
  stateFactory: true,
  namespaced: true,
})
export default class EventTickets extends VuexModule {
  private ticketList: Ticket[] = [];

  private ticketCategories: CategoryOption[] = [];

  private isLoading: boolean = false;

  private mockTicketList: Ticket[] = [
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

  constructor(module: VuexModule<ThisType<EventTickets>, EventTickets>) {
    super(module);
    this.ticketList = process.env.USE_MOCK_DATA === 'true' ? this.mockTicketList : [];
    this.ticketCategories =
      process.env.USE_MOCK_DATA === 'true'
        ? this.ticketList.map((ticket) => ticket.category)
        : [];
  }

  public get $isLoading() {
    return this.isLoading;
  }

  public get $tickets() {
    return this.ticketList;
  }

  public get $ticketCategories() {
    return this.ticketCategories.filter((category) => !category._deleted);
  }

  public get $deletedCategories() {
    return this.ticketCategories.filter((category) => category._deleted);
  }

  @Mutation
  private SET_LOADING(payload: boolean) {
    this.isLoading = payload;
  }

  @Mutation
  private SET_TICKETS(tickets: Ticket[]) {
    this.ticketList = tickets;
  }

  @Mutation
  private SET_TICKET_CATEGORIES(categories: CategoryApiResponse[]) {
    this.ticketCategories = categories.map((category) => ({
      id: category.id,
      value: category.name,
      text: category.name,
      _deleted: category.deleted_at !== null,
    }));
  }

  @Mutation
  private ADD_TICKET(ticket: Ticket) {
    this.ticketList = [...this.ticketList, ticket];
    this.ticketCategories = getUniqueCategories(this.ticketList);
  }

  @Mutation
  private UPDATE_TICKET({ index, ticket }: { index: number; ticket: Ticket }) {
    const updatedList = [...this.ticketList];
    const oldTicket = this.ticketList[index];

    // Se a categoria mudou, marca a antiga como deletada (se não estiver em uso)
    if (
      oldTicket.category &&
      (!ticket.category || oldTicket.category.value !== ticket.category.value)
    ) {
      const categoryStillInUse = this.ticketList.some(
        (t, i) => i !== index && t.category?.value === oldTicket.category?.value
      );

      if (!categoryStillInUse) {
        const categoryIndex = this.ticketCategories.findIndex(
          (cat) => cat.value === oldTicket.category?.value
        );
        if (categoryIndex !== -1) {
          this.ticketCategories[categoryIndex] = {
            ...this.ticketCategories[categoryIndex],
            _deleted: true,
          };
        }
      }
    }

    updatedList[index] = { ...ticket };
    this.ticketList = updatedList;

    // Atualiza lista de categorias mantendo as marcadas como deletadas
    const activeCategories = getUniqueCategories(updatedList);
    this.ticketCategories = [
      ...activeCategories,
      ...this.ticketCategories.filter((cat) => cat._deleted),
    ];
  }

  @Mutation
  private REMOVE_TICKET(index: number) {
    const removedTicket = this.ticketList[index];
    this.ticketList.splice(index, 1);

    // Se a categoria do ticket removido não está mais em uso, marca como deletada
    if (removedTicket.category) {
      const categoryStillInUse = this.ticketList.some(
        (ticket) => ticket.category?.value === removedTicket.category?.value
      );

      if (!categoryStillInUse) {
        const categoryIndex = this.ticketCategories.findIndex(
          (cat) => cat.value === removedTicket.category?.value
        );
        if (categoryIndex !== -1) {
          this.ticketCategories[categoryIndex] = {
            ...this.ticketCategories[categoryIndex],
            _deleted: true,
          };
        }
      }
    }
  }

  @Mutation
  private SWAP_TICKETS(payload: { removedIndex: number; addedIndex: number }) {
    const ticketList = [...this.ticketList];
    const [removedTicket] = ticketList.splice(payload.removedIndex, 1);
    ticketList.splice(payload.addedIndex, 0, removedTicket);
    this.ticketList = ticketList;
  }

  @Action
  public setTickets(tickets: Ticket[]) {
    this.context.commit('SET_TICKETS', tickets);
  }

  @Action
  public setTicketCategories(categories: CategoryApiResponse[]) {
    this.context.commit('SET_TICKET_CATEGORIES', categories);
  }

  @Action
  public addTicket(ticket: Ticket) {
    this.context.commit('ADD_TICKET', ticket);
  }

  @Action
  public updateTicket(payload: { index: number; ticket: Ticket }) {
    this.context.commit('UPDATE_TICKET', payload);
  }

  @Action
  public removeTicket(index: number) {
    this.context.commit('REMOVE_TICKET', index);
  }

  @Action
  public async createTickets(eventIds: string[]): Promise<Record<string, string>[]> {
    try {
      // Array para armazenar os mapas de tickets para cada evento
      const ticketMaps: Record<string, string>[] = [];
      
      const statusResponse = await status.fetchStatusByModuleAndName({
        module: 'ticket',
        name: 'À Venda',
      });

      // Cria todas as categorias em uma única chamada
      const categoryMaps = await this.createCategories({
        eventIds,
        tickets: this.ticketList,
      });

      // Processa cada evento individualmente
      for (let i = 0; i < eventIds.length; i++) {
        const eventId = eventIds[i];
        const categoryMap = categoryMaps[i] || new Map<string, string>();
        const ticketMap: Record<string, string> = {};

        // Prepara o payload com todos os tickets para este evento
        const ticketsPayload = {
          data: this.ticketList.map((ticket, index) => {
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
              status_id: statusResponse.id,
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
  }

  @Action
  public async updateTickets(eventId: string) {
    try {
      const statusNewTicketResponse = await status.fetchStatusByModuleAndName({
        module: 'ticket',
        name: 'À Venda',
      });

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
      const categoryChanges = getCategoryChanges(existingCategories, this.ticketList);

      // Mapeia categorias existentes
      existingCategories.forEach((cat) => {
        categoryMap.set(cat.name, cat.id);
      });

      // Organiza operações de categoria
      this.ticketList.forEach((ticket) => {
        if (ticket.category && ticket.category.id === '-1') {
          if (!categoriesToCreate.find((c) => c.name === ticket.category.text)) {
            // Nova categoria
            categoriesToCreate.push({
              event_id: eventId,
              name: ticket.category.text,
            });
          } else if (categoryChanges.toUpdate.find((c) => c.id === ticket.category?.id)) {
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
      const displayOrders = getNextDisplayOrder(this.ticketList);

      // Organiza operações de tickets
      this.ticketList.forEach((ticket, index) => {
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
  }

  @Action
  public async fetchAndPopulateByEventId(eventId: string) {
    try {
      this.context.commit('SET_LOADING', true);

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
      
      this.context.commit('SET_TICKET_CATEGORIES', categoriesResult.data);

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

      this.context.commit('SET_TICKETS', ticketsToCommit);

      return { success: true, data: ticketsToCommit };

    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public validateTickets(): ValidationResult {
    const errors: string[] = [];
    const ticketNames = new Set<string>();

    this.ticketList.forEach((ticket, index) => {
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
  }

  @Action
  public reset() {
    this.context.commit('SET_TICKETS', []);
    this.context.commit('SET_TICKET_CATEGORIES', []);
  }

  @Action
  public async createTicketCategory(payload: {
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

      await this.fetchAndPopulateByEventId(payload.eventId);
    } catch (error) {
      console.error('Erro ao criar categoria de ingresso:', error);
      throw error;
    }
  }

  @Action
  private async createCategories(payload: {
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
  }

  @Action
  public async swapTicketsOrder(payload: {
    removedIndex: number;
    addedIndex: number;
    persist: boolean;
  }) {
    const { removedIndex, addedIndex, persist } = payload;

    // Encontra os tickets na lista completa
    const movedTicket = this.ticketList[removedIndex];
    const targetTicket = this.ticketList[addedIndex];

    // Encontra os índices reais
    const movedRealIndex = this.ticketList.findIndex(
      (t) => t.id === movedTicket.id || (t.name === movedTicket.name && !t.id)
    );

    const targetRealIndex = this.ticketList.findIndex(
      (t) => t.id === targetTicket.id || (t.name === targetTicket.name && !t.id)
    );

    // Troca os display_orders
    const movedDisplayOrder = movedTicket.display_order;
    const targetDisplayOrder = targetTicket.display_order;

    if (persist) {
      try {
        this.context.commit('UPDATE_TICKET', {
          index: movedRealIndex,
          ticket: {
            ...movedTicket,
            display_order: targetDisplayOrder,
          },
        });

        this.context.commit('UPDATE_TICKET', {
          index: targetRealIndex,
          ticket: {
            ...targetTicket,
            display_order: movedDisplayOrder,
          },
        });

        this.context.commit('SWAP_TICKETS', { removedIndex, addedIndex });

        // Atualiza o display_order de todos os tickets
        const updateData = this.ticketList.map((ticket: Ticket, index: number) => {
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
      this.context.commit('UPDATE_TICKET', {
        index: movedRealIndex,
        ticket: {
          ...movedTicket,
          display_order: targetDisplayOrder,
        },
      });

      this.context.commit('UPDATE_TICKET', {
        index: targetRealIndex,
        ticket: {
          ...targetTicket,
          display_order: movedDisplayOrder,
        },
      });

      this.context.commit('SWAP_TICKETS', { removedIndex, addedIndex });
    }
  }

  @Action
  public async fetchDeleteTicket(ticketId: string): Promise<void> {
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
      const unavailableStatus = await status.fetchStatusByModuleAndName({
        module: 'ticket',
        name: 'Indisponível',
      });

      if (!unavailableStatus) {
        throw new Error('Status "Indisponível" não encontrado');
      }

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
      const ticketIndex = this.ticketList.findIndex((t) => t.id === ticketId);
      if (ticketIndex !== -1) {
        this.context.commit('UPDATE_TICKET', {
          index: ticketIndex,
          ticket: {
            ...this.ticketList[ticketIndex],
            _deleted: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error('Erro ao remover ingresso:', error);
      throw error;
    }
  }

  @Action
  public async inactivateTicket(ticketId: string): Promise<void> {
    try {
      // Busca o status "Indisponível"
      const unavailableStatus = await status.fetchStatusByModuleAndName({
        module: 'ticket',
        name: 'Indisponível',
      });

      if (!unavailableStatus) {
        throw new Error('Status "Indisponível" não encontrado');
      }

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
  }

  @Action
  public async createSingleTicket(payload: {
    eventId: string;
    ticket: Ticket;
  }): Promise<string> {
    try {
      this.context.commit('SET_LOADING', true);

      // Busca o status "À Venda"
      const statusResponse = await status.fetchStatusByModuleAndName({
        module: 'ticket',
        name: 'À Venda',
      });

      if (!statusResponse) {
        throw new Error('Status "À Venda" não encontrado');
      }

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
      const nextOrder = getNextDisplayOrder(this.ticketList, true) as number;

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
            status_id: statusResponse.id,
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
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async updateSingleTicket(payload: {
    ticketId: string;
    ticket: Ticket;
    eventId: string;
  }): Promise<boolean> {
    try {
      this.context.commit('SET_LOADING', true);
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

      const oldTicket = this.ticketList.find((t) => t.id === payload.ticketId);

      // 5. Se a categoria antiga não está mais em uso, pode deletá-la
      if (
        oldTicket?.category?.id &&
        oldTicket.category.id !== '-1' &&
        oldTicket.category.id !== categoryId
      ) {
        // Busca outros tickets que usam a categoria antiga
        const oldCategoryId = oldTicket.category.id;
        const ticketsWithOldCategory = this.ticketList.filter(
          (t) =>
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
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async stopTicketSales(ticketId: string): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);

      // 1. Busca o status "Interrompido"
      const unavailableStatus = await status.fetchStatusByModuleAndName({
        module: 'ticket',
        name: 'Interrompido',
      });

      if (!unavailableStatus) {
        throw new Error('Status "Interrompido" não encontrado');
      }

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
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async duplicateTicket(payload: {
    ticketId: string;
    eventId: string;
  }): Promise<string> {
    try {
      this.context.commit('SET_LOADING', true);

      // 1. Encontra o ticket original
      const originalTicket = this.ticketList.find((t) => t.id === payload.ticketId);
      if (!originalTicket) {
        throw new Error('Ticket original não encontrado');
      }

      // 2. Gera nome único para o novo ticket
      const newName = generateUniqueName(originalTicket.name, this.ticketList);

      // 3. Busca próximo display_order disponível
      const nextOrder = getNextDisplayOrder(this.ticketList, true) as number;

      // 4. Busca o status "À Venda"
      const availableStatus = await status.fetchStatusByModuleAndName({
        module: 'ticket',
        name: 'À Venda',
      });

      if (!availableStatus) {
        throw new Error('Status "À Venda" não encontrado');
      }

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
      this.context.commit('SET_LOADING', false);
    }
  }
}
