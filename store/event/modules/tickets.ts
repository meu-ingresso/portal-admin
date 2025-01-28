import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { Ticket, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'tickets',
  stateFactory: true,
  namespaced: true,
})
export default class TicketsModule extends VuexModule {
  private ticketList: Ticket[] = [];

  public get $tickets() {
    return this.ticketList;
  }

  @Mutation
  private SET_TICKETS(tickets: Ticket[]) {
    this.ticketList = tickets;
  }

  @Mutation
  private ADD_TICKET(ticket: Ticket) {
    this.ticketList.push(ticket);
  }

  @Mutation
  private UPDATE_TICKET({ index, ticket }: { index: number; ticket: Ticket }) {
    this.ticketList[index] = ticket;
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
      const statusResponse = await this.getStatusByModuleName('ticket', 'Disponível');
      const categoryMap = new Map<string, string>();
      for (const ticket of this.ticketList) {

        const categoryId = await this.createCategory(eventId, ticket.category, categoryMap);

        // Combina data e hora em uma única string ISO
        const startDateTime = `${ticket.start_date}T${ticket.start_time}:00.000Z`;
        const endDateTime = `${ticket.end_date}T${ticket.end_time}:00.000Z`;

        // Converte para Date para manipulação
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        const ticketResponse = await $axios.$post('ticket', {
          event_id: eventId,
          name: ticket.name,
          total_quantity: ticket.max_quantity,
          remaining_quantity: ticket.max_quantity,
          price: parseFloat(ticket.price.toString().replace(',', '.')),
          status_id: statusResponse.id,
          start_date: startDate.toISOString().replace('Z', '-0300'),
          end_date: endDate.toISOString().replace('Z', '-0300'),
          availability: ticket.availability.value,
          min_quantity_per_user: ticket.min_purchase,
          max_quantity_per_user: ticket.max_purchase,
          category_id: categoryId,
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

      if (!ticket.price || ticket.price < 0) {
        errors.push(`Ticket ${index + 1}: Preço deve ser maior ou igual a zero`);
      }

      if (!ticket.max_quantity || ticket.max_quantity <= 0) {
        errors.push(`Ticket ${index + 1}: Quantidade máxima deve ser maior que zero`);
      }

      if (!ticket.min_purchase || ticket.min_purchase <= 0) {
        errors.push(`Ticket ${index + 1}: Quantidade mínima deve ser maior que zero`);
      }

      if (ticket.max_purchase > ticket.max_quantity) {
        errors.push(
          `Ticket ${index + 1}: Quantidade máxima por compra não pode ser maior que a quantidade total`
        );
      }

      // Validação de datas
      if (!ticket.start_date || !ticket.start_time) {
        errors.push(`Ticket ${index + 1}: Data e hora de início são obrigatórios`);
      }

      if (!ticket.end_date || !ticket.end_time) {
        errors.push(`Ticket ${index + 1}: Data e hora de término são obrigatórios`);
      }

      if (ticket.start_date && ticket.start_time && ticket.end_date && ticket.end_time) {
        const startDate = new Date(`${ticket.start_date}T${ticket.start_time}`);
        const endDate = new Date(`${ticket.end_date}T${ticket.end_time}`);

        if (endDate <= startDate) {
          errors.push(`Ticket ${index + 1}: Data final deve ser maior que a data inicial`);
        }
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

  private async getStatusByModuleName(module: string, name: string) {
    const response = await $axios.$get(
      `statuses?where[module][v]=${module}&where[name][v]=${name}`
    );

    if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
      throw new Error(`Falha ao buscar status do módulo: ${module}`);
    }

    return response.body.result.data[0];
  }

  private async createCategory(eventId: string, categoryName: string, categoryMap: Map<string, string>) {
    if (!categoryName) return null;

    const existingCategoryId = categoryMap.get(categoryName);
    if (existingCategoryId) return existingCategoryId;

    const categoryResponse = await $axios.$post('ticket-event-category', {
      event_id: eventId,
      name: categoryName,
    });

    if (!categoryResponse.body || categoryResponse?.body?.code !== 'CREATE_SUCCESS') {
      throw new Error(`Falha ao criar categoria de ingresso: ${categoryName}`);
    }

    const categoryId = categoryResponse?.body?.result?.id;
    categoryMap.set(categoryName, categoryId);

    return categoryId;
  }

}