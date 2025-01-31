import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { Ticket, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { status } from '@/utils/store-util';

@Module({
  name: 'eventTickets',
  stateFactory: true,
  namespaced: true,
})
export default class EventTickets extends VuexModule {
  private ticketList: Ticket[] = [];

  private mockTicketList: Ticket[] = [
    {
      name: 'Ingresso Normal',
      price: "100",
      quantity: 100,
      min_purchase: 1,
      max_purchase: '10',
      start_date: '2025-02-01',
      start_time: '10:00',
      end_date: '2025-02-01',
      end_time: '12:00',
      availability: 'Publico',
      category: 'Ingresso Normal',
      visible: true,
    },
    {
      name: 'Ingresso Vip',
      price: "200",
      quantity: 50,
      min_purchase: 1,
      max_purchase: '5',
      start_date: '2025-02-01',
      start_time: '10:00',
      end_date: '2025-02-01',
      end_time: '12:00',
      availability: 'Publico',
      category: 'Ingresso Vip',
      visible: true,
    },
  ];

  constructor(module: VuexModule<ThisType<EventTickets>, EventTickets>) {
    super(module);
    this.ticketList = process.env.USE_MOCK_DATA === 'true' ? this.mockTicketList : [];
  }


  public get $tickets() {
    return this.ticketList;
  }

  public get $ticketCategories() {
    return this.ticketList.map((ticket) => ticket.category);
  }

  @Mutation
  private SET_TICKETS(tickets: Ticket[]) {
    this.ticketList = tickets;
  }

  @Mutation
  private ADD_TICKET(ticket: Ticket) {
    this.ticketList = [...this.ticketList, ticket];
  }

  @Mutation
  private UPDATE_TICKET({ index, ticket }: { index: number; ticket: Ticket }) {
      // Criar uma nova referência do array para garantir reatividade
    const updatedList = [...this.ticketList];
    updatedList[index] = { ...ticket };
    this.ticketList = updatedList;
  }

  @Mutation
  private REMOVE_TICKET(index: number) {
    this.ticketList.splice(index, 1);
  }


  @Action
  public setTickets(tickets: Ticket[]) {
    this.context.commit('SET_TICKETS', tickets);
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
  public async createTickets(eventId: string): Promise<Record<string, string>> {
    try {
      const ticketMap: Record<string, string> = {};
      const statusResponse = await status.fetchStatusByModuleAndName({ module: 'ticket', name: 'Disponível' });
      const categoryMap = new Map<string, string>();
      for (const [index, ticket] of this.ticketList.entries()) {

        const categoryId = await this.createCategory({ eventId, categoryName: ticket.category, categoryMap });

        // Combina data e hora em uma única string ISO
        const startDateTime = `${ticket.start_date}T${ticket.start_time}:00.000Z`;
        const endDateTime = `${ticket.end_date}T${ticket.end_time}:00.000Z`;

        // Converte para Date para manipulação
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        const ticketResponse = await $axios.$post('ticket', {
          event_id: eventId,
          name: ticket.name,
          total_quantity: ticket.quantity,
          remaining_quantity: ticket.quantity,
          price: parseFloat(ticket.price.toString().replace(',', '.')),
          status_id: statusResponse.id,
          start_date: startDate.toISOString().replace('Z', '-0300'),
          end_date: endDate.toISOString().replace('Z', '-0300'),
          availability: ticket.availability,
          min_quantity_per_user: ticket.min_purchase,
          max_quantity_per_user: ticket.max_purchase,
          category_id: categoryId,
          display_order: ticket.display_order || index + 1,
        });

        if (!ticketResponse.body || ticketResponse.body.code !== 'CREATE_SUCCESS') {
          throw new Error(`Falha ao criar ingresso: ${ticket.name}`);
        }

        ticketMap[ticket.name] = ticketResponse.body.result.id;
      }

      return ticketMap;
    } catch (error) {
      console.error('Erro ao criar ingressos:', error);
      throw error;
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

      if (!ticket.quantity || Number(ticket.quantity) <= 0) {
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
  }

  @Action
  private async createCategory(payload: { eventId: string, categoryName: string, categoryMap: Map<string, string> }) {
    if (!payload.categoryName) return null;

    const existingCategoryId = payload.categoryMap.get(payload.categoryName);
    if (existingCategoryId) return existingCategoryId;

    const categoryResponse = await $axios.$post('ticket-event-category', {
      event_id: payload.eventId,
      name: payload.categoryName,
    });

    if (!categoryResponse.body || categoryResponse?.body?.code !== 'CREATE_SUCCESS') {
      throw new Error(`Falha ao criar categoria de ingresso: ${payload.categoryName}`);
    }

    const categoryId = categoryResponse?.body?.result?.id;
    payload.categoryMap.set(payload.categoryName, categoryId);

    return categoryId;
  }

}