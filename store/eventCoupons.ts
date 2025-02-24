import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { BatchOperations, Coupon, CouponApiResponse, CouponTicketApiResponse, TicketApiResponse, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { status } from '@/utils/store-util';
import { splitDateTime } from '@/utils/formatters';
import { handleGetResponse } from '~/utils/responseHelpers';
import { getCouponTicketRelationChanges, prepareCouponPayload, shouldUpdateCoupon } from '~/utils/couponHelpers';
@Module({
  name: 'eventCoupons',
  stateFactory: true,
  namespaced: true,
})
export default class EventCoupons extends VuexModule {

  private isLoading: boolean = false;

  private couponList: Coupon[] = [];

  private mockCouponList: Coupon[] = [
    {
      code: '123456',
      discount_type: 'PERCENTAGE',
      discount_value: '10',
      max_uses: 100,
      start_date: '2025-02-01',
      start_time: '10:00',
      end_date: '2025-02-02',
      end_time: '10:00',
      tickets: [{ name: 'Ingresso Normal', id: '123456' }, { name: 'Ingresso Vip', id: '123457' }],
    },
  ];

  constructor(module: VuexModule<ThisType<EventCoupons>, EventCoupons>) {
    super(module);
    this.couponList = process.env.USE_MOCK_DATA === 'true' ? this.mockCouponList : this.couponList;
  }

  public get $coupons() {
    return this.couponList;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  @Mutation
  private SET_LOADING(loading: boolean) {
    this.isLoading = loading;
  }

  @Mutation
  private SET_COUPONS(coupons: Coupon[]) {
    this.couponList = coupons;
  }

  @Mutation
  private ADD_COUPON(coupon: Coupon) {
    this.couponList = [...this.couponList, coupon];
  }

  @Mutation
  private UPDATE_COUPON({ index, coupon }: { index: number; coupon: Coupon }) {
    const updatedList = [...this.couponList];
    updatedList[index] = { ...coupon };
    this.couponList = updatedList;
  }

  @Mutation
  private REMOVE_COUPON(index: number) {
    const updatedList = [...this.couponList];
    updatedList[index]._deleted = true;
    this.couponList = updatedList;
  }

  @Action
  public setCoupons(coupons: Coupon[]) {
    this.context.commit('SET_COUPONS', coupons);
  }

  @Action
  public addCoupon(coupon: Coupon) {
    this.context.commit('ADD_COUPON', coupon);
  }

  @Action
  public updateCoupon(payload: { index: number; coupon: Coupon }) {
    this.context.commit('UPDATE_COUPON', payload);
  }

  @Action
  public removeCoupon(index: number) {
    this.context.commit('REMOVE_COUPON', index);
  }

  @Action
  public validateCoupons(): ValidationResult {
    const errors: string[] = [];
    const couponCodes = new Set<string>();

    this.couponList.forEach((coupon, index) => {
      // Validação de código duplicado
      if (couponCodes.has(coupon.code)) {
        errors.push(`Cupom com código "${coupon.code}" está duplicado`);
      }
      couponCodes.add(coupon.code);

      // Validações básicas
      if (!coupon.code?.trim()) {
        errors.push(`Cupom ${index + 1}: Código é obrigatório`);
      }

      if (!coupon.discount_type) {
        errors.push(`Cupom ${index + 1}: Tipo de desconto é obrigatório`);
      }

      if (!coupon.discount_value || parseFloat(coupon.discount_value) <= 0) {
        errors.push(`Cupom ${index + 1}: Valor do desconto deve ser maior que zero`);
      }

      if (coupon.discount_type === 'PERCENTAGE' && parseFloat(coupon.discount_value) > 100) {
        errors.push(`Cupom ${index + 1}: Desconto percentual não pode ser maior que 100%`);
      }

      if (!coupon.max_uses || coupon.max_uses <= 0) {
        errors.push(`Cupom ${index + 1}: Número máximo de usos deve ser maior que zero`);
      }

      // Validação de datas
      if (!coupon.start_date || !coupon.start_time) {
        errors.push(`Cupom ${index + 1}: Data e hora de início são obrigatórios`);
      }

      if (!coupon.end_date || !coupon.end_time) {
        errors.push(`Cupom ${index + 1}: Data e hora de término são obrigatórios`);
      }

      if (coupon.start_date && coupon.start_time && coupon.end_date && coupon.end_time) {
        const startDate = new Date(`${coupon.start_date}T${coupon.start_time}`);
        const endDate = new Date(`${coupon.end_date}T${coupon.end_time}`);

        if (endDate <= startDate) {
          errors.push(`Cupom ${index + 1}: Data final deve ser maior que a data inicial`);
        }
      }

      if (!coupon.tickets?.length) {
        errors.push(`Cupom ${index + 1}: Selecione pelo menos um ingresso`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  @Action
  private async executeBatchOperations(operations: BatchOperations): Promise<void> {
    const apiCalls = [];

    if (operations.couponsToCreate.length > 0) {
      apiCalls.push($axios.$post('coupon', { data: operations.couponsToCreate }));
    }

    if (operations.couponsToUpdate.length > 0) {
      apiCalls.push($axios.$patch('coupon', { data: operations.couponsToUpdate }));
    }

    if (operations.couponsToDelete.length > 0) {
      apiCalls.push($axios.$delete('coupon', { data: operations.couponsToDelete }));
    }

    if (operations.ticketRelationsToCreate.length > 0) {
      apiCalls.push($axios.$post('coupon-ticket', { data: operations.ticketRelationsToCreate }));
    }

    if (operations.ticketRelationsToDelete.length > 0) {
      apiCalls.push($axios.$delete('coupon-ticket', { data: operations.ticketRelationsToDelete }));
    }

    await Promise.all(apiCalls);
  }


  @Action
  public async createCoupons(eventId: string): Promise<void> {
    try {
      if (!this.couponList.length) {
        console.log('Nenhum cupom para criar');
        return;
      };

      const statusId = await this.getDefaultStatusId();

      // Preparar payload para criação em lote
      const couponsToCreate = this.couponList.map(coupon => 
        prepareCouponPayload(coupon, eventId, statusId)
      );

      // Criar todos os cupons de uma vez
      const couponResponse = await $axios.$post('coupon', {
        data: couponsToCreate
      });

      if (!couponResponse.body || couponResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar cupons');
      }


      if (this.couponList.some(c => c.tickets && c.tickets.length > 0)) {
        const ticketsFromEvent = await this.getEventTickets(eventId);

          // Criar relações com tickets
          const ticketRelationsToCreate: any[] = [];
          
          couponResponse.body.result.forEach((createdCoupon: CouponApiResponse) => {
            const originalCoupon = this.couponList.find(c => c.code === createdCoupon.code);
            if (originalCoupon && originalCoupon.tickets) {
              originalCoupon.tickets.forEach(ticket => {
              

                const couponTicketId = ticketsFromEvent.find(t => t.name === ticket.name)?.id;

                if (couponTicketId) {
                  ticketRelationsToCreate.push({
                    coupon_id: createdCoupon.id,
                    ticket_id: couponTicketId
                  });
                } else {
                  console.error(`Ticket ${ticket.name} não encontrado para o cupom ${createdCoupon.code}`);
                }
              });
            }
          });

          // Criar todas as relações de uma vez
          if (ticketRelationsToCreate.length > 0) {
            await $axios.$post('coupon-ticket', {
              data: ticketRelationsToCreate
            });
          }
      }

    } catch (error) {
      console.error('Erro ao criar cupons:', error);
      throw error;
    }
  }

  @Action
  public async fetchAndPopulateByEventId(eventId: string) {

    try {

      this.context.commit('SET_LOADING', true); 

      const response = await $axios.$get(`coupons?where[event_id][v]=${eventId}`);
      const resultCoupons = handleGetResponse(response, 'Cupons não encontrados', eventId, true);

      const couponPromises = resultCoupons.data.map(async (coupon: CouponApiResponse) => {
        
        const responseCouponTicket = await $axios.$get(`coupons-tickets?where[coupon_id][v]=${coupon.id}&preloads[]=ticket`);
        const resultTickets = handleGetResponse(responseCouponTicket, 'Relações de cupons com ingressos não encontradas', eventId, true);
        
        const tickets = resultTickets.data.map((couponTicket: CouponTicketApiResponse) => ({ name: couponTicket.ticket.name, id: couponTicket.ticket.id }));

        // Separar data e hora
        const startDateTime = splitDateTime(coupon.start_date);
        const endDateTime = splitDateTime(coupon.end_date);
        
        return {
          id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          max_uses: coupon.max_uses,
          start_date: startDateTime.date,
          start_time: startDateTime.time,
          end_date: endDateTime.date,
          end_time: endDateTime.time,
          tickets,
          uses: coupon.uses,
        }

      });

      const coupons = await Promise.all(couponPromises);

      this.context.commit('SET_COUPONS', coupons);

      return coupons;

    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public reset() {
    this.context.commit('SET_COUPONS', []);
  }


  @Action
  public async updateEventCoupons(eventId: string): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);

      // 1. Buscar cupons e tickets existentes
      const couponsResponse = await $axios.$get(`coupons?where[event_id][v]=${eventId}`);

      const { data: existingCoupons } = handleGetResponse(couponsResponse, 'Cupons não encontrados', eventId, true);

      const existingTickets = await this.getEventTickets(eventId);

      const operations: BatchOperations = {
        couponsToCreate: [],
        couponsToUpdate: [],
        couponsToDelete: [],
        ticketRelationsToCreate: [],
        ticketRelationsToDelete: [],
      };

      const statusId = await this.getDefaultStatusId();

      // 2. Processar cada cupom
      for (const coupon of this.couponList) {
        const existingCoupon = existingCoupons.find(
          (c: CouponApiResponse) => c.id === coupon.id
        );

        if (existingCoupon) {
          // Cupom existente
          if (coupon._deleted) {
            operations.couponsToDelete.push(coupon.id);
          } else if (shouldUpdateCoupon(existingCoupon, coupon)) {
            operations.couponsToUpdate.push({
              id: coupon.id,
              ...prepareCouponPayload(coupon, eventId, statusId)
            });
          }

          // Processar relações com tickets
          const ticketRelationsResponse = await $axios.$get(
            `coupons-tickets?where[coupon_id][v]=${coupon.id}`
          );

          const { data: existingTicketRelations } = handleGetResponse(
            ticketRelationsResponse,
            'Relações de tickets não encontradas',
            null,
            true
          );

          const relationChanges = getCouponTicketRelationChanges(
            existingTicketRelations,
            existingTickets,
            coupon.tickets
          );

          operations.ticketRelationsToDelete.push(...relationChanges.toDelete);
          operations.ticketRelationsToCreate.push(
            ...relationChanges.toCreate.map(ticket => ({
              coupon_id: coupon.id,
              ticket_id: ticket.id
            }))
          );
        } else if (!coupon._deleted) {
          // Novo cupom
          operations.couponsToCreate.push(
            prepareCouponPayload(coupon, eventId, statusId)
          );
        }
      }

      // 3. Executar todas as operações em lote
      await this.executeBatchOperations(operations);

    } catch (error) {
      console.error('Erro ao atualizar cupons:', error);
      throw new Error(`Falha ao atualizar cupons: ${error.message}`);
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }


  @Action
  private async getDefaultStatusId(): Promise<string> {
    const statusResponse = await status.fetchStatusByModuleAndName({ 
      module: 'coupon', 
      name: 'Disponível' 
    });
    return statusResponse.id;
  }

  @Action
  public async updateSingleCoupon(payload: { 
    couponId: string,
    coupon: Coupon,
    eventId: string 
  }): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);

      const operations: BatchOperations = {
        couponsToCreate: [],
        couponsToUpdate: [],
        couponsToDelete: [],
        ticketRelationsToCreate: [],
        ticketRelationsToDelete: [],
      };

      // 1. Preparar atualização do cupom

      const statusId = await this.getDefaultStatusId();

      operations.couponsToUpdate.push({
        id: payload.couponId,
        ...prepareCouponPayload(
          payload.coupon,
          payload.eventId,
          statusId
        )
      });

      // 2. Buscar e processar relações com tickets
      const ticketRelationsResponse = await $axios.$get(
        `coupons-tickets?where[coupon_id][v]=${payload.couponId}&preloads[]=ticket`
      );
      
      const { data: existingTicketRelations } = handleGetResponse(
        ticketRelationsResponse,
        'Relações de tickets não encontradas',
        null,
        true
      );

      const existingTickets = await this.getEventTickets(payload.eventId);

      const relationChanges = getCouponTicketRelationChanges(
        existingTicketRelations,
        existingTickets,
        payload.coupon.tickets
      );

      operations.ticketRelationsToDelete.push(...relationChanges.toDelete);
      operations.ticketRelationsToCreate.push(
        ...relationChanges.toCreate.map(ticket => ({
          coupon_id: payload.couponId,
          ticket_id: ticket.id
        }))
      );

      // 3. Executar todas as operações
      await this.executeBatchOperations(operations);

      // 7. Atualizar o state
      const updatedCoupon = {
        ...payload.coupon,
        id: payload.couponId
      };

      const couponIndex = this.couponList.findIndex(c => c.id === payload.couponId);
      if (couponIndex !== -1) {
        this.context.commit('UPDATE_COUPON', {
          index: couponIndex,
          coupon: updatedCoupon
        });
      }

    } catch (error) {
      console.error('Erro ao atualizar cupom:', error);
      throw new Error(`Falha ao atualizar cupom: ${error.message}`);
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async createSingleCoupon(payload: { 
    eventId: string, 
    coupon: Coupon 
  }): Promise<string> {
    try {
      this.context.commit('SET_LOADING', true);

      // 1. Buscar o status "Disponível"
      const availableStatus = await status.fetchStatusByModuleAndName({ 
        module: 'coupon', 
        name: 'Disponível' 
      });

      if (!availableStatus) {
        throw new Error('Status "Disponível" não encontrado');
      }

      // 2. Preparar dados do cupom
      const startDateTime = `${payload.coupon.start_date}T${payload.coupon.start_time}:00.000Z`;
      const endDateTime = `${payload.coupon.end_date}T${payload.coupon.end_time}:00.000Z`;

      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      // 3. Criar o cupom
      const couponResponse = await $axios.$post('coupon', {
        event_id: payload.eventId,
        status_id: availableStatus.id,
        code: payload.coupon.code,
        discount_type: payload.coupon.discount_type,
        discount_value: parseFloat(payload.coupon.discount_value.replace(',', '.')),
        max_uses: payload.coupon.max_uses,
        start_date: startDate.toISOString().replace('Z', '-0300'),
        end_date: endDate.toISOString().replace('Z', '-0300'),
      });

      if (!couponResponse.body || couponResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar cupom');
      }

      const couponId = couponResponse.body.result.id;

      // 4. Criar relações com tickets se existirem
      if (payload.coupon.tickets && payload.coupon.tickets.length > 0) {
        await Promise.all(
          payload.coupon.tickets.map(ticket =>
            $axios.$post('coupon-ticket', {
              coupon_id: couponId,
              ticket_id: ticket.id
            })
          )
        );
      }

      // 5. Atualizar o state
      const createdCoupon = {
        ...payload.coupon,
        id: couponId,
        uses: 0,
        status: {
          id: availableStatus.id,
          name: 'Disponível'
        }
      };

      this.context.commit('ADD_COUPON', createdCoupon);

      return couponId;

    } catch (error) {
      console.error('Erro ao criar cupom:', error);
      throw new Error(`Falha ao criar cupom: ${error.message}`);
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchDeleteCoupon(couponId: string): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);

      // 1. Buscar relações existentes com tickets
      const ticketRelationsResponse = await $axios.$get(
        `coupons-tickets?where[coupon_id][v]=${couponId}`
      );
      const resultTicketRelations = handleGetResponse(
        ticketRelationsResponse, 
        'Relações de tickets não encontradas', 
        null, 
        true
      );

      // 2. Deletar todas as relações existentes
      if (resultTicketRelations.data.length > 0) {
        await Promise.all(
          resultTicketRelations.data.map((relation: CouponTicketApiResponse) =>
            $axios.$delete(`coupon-ticket/${relation.id}`)
          )
        );
      }

      // 3. Deletar o cupom
      const deleteResponse = await $axios.$delete(`coupon/${couponId}`);
      
      if (!deleteResponse.body || deleteResponse.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao deletar cupom');
      }

      // 4. Remover do state
      const couponIndex = this.couponList.findIndex(c => c.id === couponId);
      if (couponIndex !== -1) {
        this.context.commit('REMOVE_COUPON', couponIndex);
      }

    } catch (error) {
      console.error('Erro ao deletar cupom:', error);
      throw new Error(`Falha ao deletar cupom: ${error.message}`);
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  private async getEventTickets(eventId: string): Promise<TicketApiResponse[]> {
    const response = await $axios.$get(`tickets?where[event_id][v]=${eventId}`);
    const { data } = handleGetResponse(response, 'Tickets não encontrados', eventId, true);
    return data;
  }

} 