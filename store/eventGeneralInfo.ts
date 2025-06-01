import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { Event, EventAddress, ValidationResult, EventAttachment, EventApiResponse, EventDate } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { status } from '@/utils/store-util';
import { splitDateTime } from '@/utils/formatters';
import { handleGetResponse } from '~/utils/responseHelpers';

@Module({
  name: 'eventGeneralInfo',
  stateFactory: true,
  namespaced: true,
})
export default class EventGeneralInfo extends VuexModule {
  private isLoading: boolean = false;
  private eventList: EventApiResponse[] = [];

  private info: Omit<Event, 'tickets' | 'custom_fields' | 'coupons'> = {
    id: '',
    name: '',
    alias: '',
    description: '',
    general_information: '',
    category: null,
    event_type: null,
    rating: null,
    sale_type: 'Ingresso',
    availability: 'Publico',
    is_featured: false,
    absorb_service_fee: false,
    banner: null,
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: '',
      location_name: '',
      latitude: null,
      longitude: null,
    },
    attachments: [],
    collaborators: [],
    totalizers: {
      totalSales: '0',
      totalSalesToday: '0',
      totalSalesAmount: '0',
      totalSalesAmountToday: '0',
      totalViews: '0',
    },
    status: null,
    fees: {
      id: '',
      platform_fee: 0,
    },
    groups: [],
    event_dates: [],
    group_id: null,
  };

  private mockInfo: Omit<Event, 'tickets' | 'custom_fields' | 'coupons'> = {
    id: null,
    name: '[MOCK] Evento de Teste',
    alias: '[MOCK] evento-de-teste',
    description: '[MOCK] Descrição do evento de teste',
    general_information: '[MOCK] Informações gerais do evento de teste',
    category: {
      text: 'E-sports',
      value: '71b34079-d36b-4c93-9785-008e80498749',
    },
    event_type: 'Presencial',
    rating: {
      img: 'https://meuingresso-attachments.s3.us-east-1.amazonaws.com/%2B14.png',
      text: 'Maiores de 14 anos',
      value: 'fdc6ed28-5d77-4383-9820-621491c5b075',
    },
    sale_type: 'Ingresso',
    availability: 'Publico',
    is_featured: false,
    absorb_service_fee: false,
    banner: null,
    address: {
      street: 'Rua da Alegria',
      number: '100',
      complement: '',
      neighborhood: 'Centro',
      city: 'Joinville',
      state: 'SC',
      zipcode: '89201-123',
      location_name: 'MeuIngresso',
      latitude: -26.304577,
      longitude: -48.849447,
    },
    link_online: '',
    promoter_id: '1',
    attachments: [],
    collaborators: [],
    totalizers: {
      totalSales: '22',
      totalSalesToday: '4',
      totalSalesAmount: 'R$ 1.000,00',
      totalSalesAmountToday: 'R$ 100,00',
      totalViews: '100',
    },
    status: {
      id: '1',
      name: 'Em análise',
      module: 'event',
      description: 'Em análise do evento',
    },
    fees: {
      id: '',
      platform_fee: 10,
    },
    groups: [],
    event_dates: [{
      id: '',
      start_date: '2025-02-01',
      start_time: '10:00',
      end_date: '2025-02-01',
      end_time: '12:00',
    }],
    group_id: null,
  };

  private selectedStatus: string = null;

  private isLoadingEventStatus: boolean = false;

  constructor(module: VuexModule<ThisType<EventGeneralInfo>, EventGeneralInfo>) {
    super(module);
    this.info = process.env.USE_MOCK_DATA === 'true' ? this.mockInfo : this.info;
  }

  public get $info() {
    return this.info;
  }

  public get $formattedLocation() {

    if (this.info.address && this.info.address.deleted_at !== null) {
      return `${this.info.address.street}, ${this.info.address.number} - ${this.info.address.neighborhood}, ${this.info.address.city} - ${this.info.address.state}`;
    }

    return null;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  public get $isLoadingEventStatus() {
    return this.isLoadingEventStatus;
  }

  public get $eventList() {
    return this.eventList;
  }

  @Mutation
  private SET_LOADING(payload: boolean) {
    this.isLoading = payload;
  }

  @Mutation
  private SET_LOADING_EVENT_STATUS(status: boolean) {
    this.isLoadingEventStatus = status;
  }

  @Mutation
  private UPDATE_INFO(payload: Partial<Event>) {
    this.info = { ...this.info, ...payload };
  }

  @Mutation
  private UPDATE_INFO_ADDRESS(payload: Partial<EventAddress>) {
    this.info.address = { ...this.info.address, ...payload };
  }

  @Mutation
  private SET_STATUS(status: string) {
    this.selectedStatus = status;
  }

  @Mutation
  private ADD_EVENT_DATE(eventDate: any) {
    this.info.event_dates.push(eventDate);
  }

  @Mutation
  private UPDATE_EVENT_DATE(payload: { index: number; eventDate: any }) {
    this.info.event_dates[payload.index] = payload.eventDate;
  }

  @Mutation
  private REMOVE_EVENT_DATE(index: number) {
    this.info.event_dates.splice(index, 1);
  }

  @Mutation
  private SET_EVENT_DATES(eventDates: any[]) {
    this.info.event_dates = eventDates;
  }

  @Mutation
  private SET_GROUP_ID(groupId: string) {
    this.info.group_id = groupId;
  }

  @Mutation
  private SET_EVENT_LIST(events: EventApiResponse[]) {
    this.eventList = events;
  }

  @Action
  public updateGeneralInfoAddress(payload: Partial<EventAddress>) {
    this.context.commit('UPDATE_INFO_ADDRESS', payload);
  }

  @Action
  public updateGeneralInfo(payload: Partial<Event>) {
    this.context.commit('UPDATE_INFO', payload);
  }

  @Action
  public validateGeneralInfo(): ValidationResult {
    const errors: string[] = [];

    // Validações obrigatórias
    if (!this.info.name?.trim()) {
      errors.push('Nome do evento é obrigatório');
    }

    if (!this.info.category?.value) {
      errors.push('Categoria é obrigatória');
    }

    if (!this.info.event_type) {
      errors.push('Tipo de evento é obrigatório');
    }

    if (!this.info.rating?.value) {
      errors.push('Classificação indicativa é obrigatória');
    }

    // Validações de data
    if (this.info.event_dates.length === 0) {
      errors.push('Pelo menos uma data é obrigatória');
    } else {
      // Validar cada data
      const now = new Date();
      
      for (let i = 0; i < this.info.event_dates.length; i++) {
        const date = this.info.event_dates[i];
        
        if (!date.start_date || !date.start_time) {
          errors.push(`Data e hora de início são obrigatórios (Data ${i+1})`);
        }
        
        if (!date.end_date || !date.end_time) {
          errors.push(`Data e hora de término são obrigatórios (Data ${i+1})`);
        }
        
        if (date.start_date && date.start_time && date.end_date && date.end_time) {
          const startDate = new Date(`${date.start_date}T${date.start_time}`);
          const endDate = new Date(`${date.end_date}T${date.end_time}`);
          
          if (startDate < now) {
            errors.push(`A data de início deve ser maior que a data atual (Data ${i+1})`);
          }
          
          if (endDate <= startDate) {
            errors.push(`A data de término deve ser maior que a data de início (Data ${i+1})`);
          }
        }
      }
    }

    // Validações específicas por tipo de evento
    if (this.info.event_type === 'Online') {
      if (!this.info.link_online?.trim()) {
        errors.push('Link do evento online é obrigatório');
      }
    } else {
      // Validações de endereço para eventos presenciais
      if (!this.info.address?.street?.trim()) {
        errors.push('Rua é obrigatória para eventos presenciais');
      }
      if (!this.info.address?.number?.trim()) {
        errors.push('Número é obrigatório para eventos presenciais');
      }
      if (!this.info.address?.neighborhood?.trim()) {
        errors.push('Bairro é obrigatório para eventos presenciais');
      }
      if (!this.info.address?.city?.trim()) {
        errors.push('Cidade é obrigatória para eventos presenciais');
      }
      if (!this.info.address?.state?.trim()) {
        errors.push('Estado é obrigatório para eventos presenciais');
      }
      if (!this.info.address?.zipcode?.trim()) {
        errors.push('CEP é obrigatório para eventos presenciais');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  @Action
  public async fetchAndPopulateByEventId(eventId: string) {
    try {
      this.context.commit('SET_LOADING', true);

      const preloads = [
        'rating',
        'status',
        'address',
        'category',
        'attachments',
        'collaborators:user:people',
        'collaborators:role',
        'status',
        'fees',
        'groups',
      ];

      const response = await $axios.$get(
        `events?where[id][v]=${eventId}&${preloads
          .map((preload) => `preloads[]=${preload}`)
          .join('&')}`
      );

      const { data } = handleGetResponse(response, 'Evento não encontrado', null, true);

      const event = data[0];

      // Separar data e hora
      const startDateTime = splitDateTime(event.start_date);
      const endDateTime = splitDateTime(event.end_date);

      const bannerAttachment = event.attachments.find(
        (attachment: EventAttachment) => attachment.name === 'banner'
      );
      const bannerUrl = bannerAttachment ? bannerAttachment.url : null;
      const bannerId = bannerAttachment ? bannerAttachment.id : null;

      const linkOnlineAttachment = event.attachments.find(
        (attachment: EventAttachment) => attachment.name === 'link_online'
      );
      const linkOnlineUrl = linkOnlineAttachment ? linkOnlineAttachment.url : null;
      const linkOnlineId = linkOnlineAttachment ? linkOnlineAttachment.id : null;

      // Capturar grupo do evento
      const groupId = event.groups && event.groups.length > 0 ? event.groups[0].id : null;

      // Criar array de datas, inicialmente com a data principal do evento
      const eventDates = [{
        id: '',
        start_date: startDateTime.date,
        start_time: startDateTime.time,
        end_date: endDateTime.date,
        end_time: endDateTime.time,
      }];

      // Buscar outras datas se pertencer a um grupo
      if (groupId) {
        await this.fetchAndAddGroupEvents(groupId, eventId);
      }

      this.context.commit('UPDATE_INFO', {
        id: event.id,
        name: event.name,
        alias: event.alias,
        description: event.description,
        general_information: event.general_information,
        category: {
          text: event.category.name,
          value: event.category.id,
        },
        event_type: event.event_type,
        rating: {
          text: event.rating.description,
          value: event.rating.id,
          img: event.rating.image,
        },
        banner: bannerUrl,
        backup_banner: bannerUrl,
        banner_id: bannerId,
        sale_type: event.sale_type,
        availability: event.availability,
        is_featured: event.is_featured,
        absorb_service_fee: event.absorb_service_fee,
        address:
          event?.address && event?.address?.deleted_at === null
            ? {
                id: event?.address?.id,
                street: event?.address?.street,
                number: event?.address?.number,
                complement: event?.address?.complement || '',
                neighborhood: event?.address?.neighborhood,
                city: event?.address?.city,
                state: event?.address?.state,
                zipcode: event?.address?.zipcode,
                location_name: event?.location_name || '',
                latitude: event?.address?.latitude ? Number(event?.address?.latitude) : null,
                longitude: event?.address?.longitude
                  ? Number(event?.address?.longitude)
                  : null,
              }
            : event?.address && event?.address?.deleted_at !== null ?
              {
                id: event?.address?.id,
                deleted_at: event?.address?.deleted_at,
              }
            : null,
        link_online: linkOnlineUrl || '',
        link_online_id: linkOnlineId || '',
        promoter_id: event.promoter_id,
        attachments: event.attachments,
        collaborators: event.collaborators,
        totalizers: event.totalizers,
        status: event.status,
        fees: {
          id: event?.fees?.id,
          platform_fee: event?.fees?.platform_fee,
        },
        groups: event?.groups,
        event_dates: eventDates,
        group_id: groupId,
      });

      return event;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchAndAddGroupEvents(groupId: string, currentEventId: string) {
    try {
      const response = await $axios.$get(
        `events?whereHas[groups][id]=${groupId}&preloads[]=status`
      );

      const { data } = handleGetResponse(response, 'Eventos do grupo não encontrados', null, true);

      // Filtrar eventos do grupo (exceto o evento atual)
      const groupEvents = data.filter((event: any) => event.id !== currentEventId);

      // Adicionar cada evento do grupo como uma data adicional
      const additionalDates = groupEvents.map((event: any) => {
        const startDateTime = splitDateTime(event.start_date);
        const endDateTime = splitDateTime(event.end_date);

        return {
          id: event.id,
          start_date: startDateTime.date,
          start_time: startDateTime.time,
          end_date: endDateTime.date,
          end_time: endDateTime.time,
          status: event.status,
        };
      });

      // Adicionar as datas ao array de datas de eventos
      const currentDates = this.info.event_dates || [];
      this.context.commit('SET_EVENT_DATES', [...currentDates, ...additionalDates]);

    } catch (error) {
      console.error('Erro ao buscar eventos do grupo:', error);
    }
  }

  @Action
  public async createEventBase(): Promise<EventApiResponse[]> {
    try {
      // Criar endereço se o evento for presencial
      const [addressId, eventStatus] = await Promise.all([
        this.info.event_type !== 'Online' ? this.createAddress(this.info.address) : null,
        status.fetchStatusByModuleAndName({
          module: 'event',
          name: this.selectedStatus,
        }),
      ]);

      // Preparar array com todas as datas do evento
      const eventData = this.info.event_dates.map((date, index) => {
        const startDateTime = `${date.start_date}T${date.start_time}:00.000Z`;
        const endDateTime = `${date.end_date}T${date.end_time}:00.000Z`;

        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        return {
          alias: index === 0 ? this.info.alias : `${this.info.alias}-${index}`,
          name: this.info.name,
          description: this.info.description,
          general_information: this.info.general_information,
          category_id: this.info.category?.value,
          rating_id: this.info.rating?.value,
          event_type: this.info.event_type,
          start_date: startDate.toISOString().replace('Z', '-0300'),
          end_date: endDate.toISOString().replace('Z', '-0300'),
          address_id: addressId,
          status_id: eventStatus.id,
          link_online: this.info.link_online,
          location_name: this.info.address?.location_name,
          promoter_id: this.info.promoter_id,
          sale_type: this.info.sale_type,
          availability: this.info.availability,
          is_featured: this.info.is_featured,
          absorb_service_fee: this.info.absorb_service_fee || false,
        };
      });

      // Enviar todas as datas de uma vez
      const eventResponse = await $axios.$post('event', {
        data: eventData,
      });

      if (!eventResponse.body || eventResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar evento');
      }

      // Capturar o ID do grupo (se existir)
      let groupId = null;
      if (eventResponse.body.result[0].group_id) {
        groupId = eventResponse.body.result[0].group_id;
        this.context.commit('SET_GROUP_ID', groupId);
      }

      return eventResponse.body.result;
    } catch (error) {
      console.error('Erro ao criar evento base:', error);
      throw error;
    }
  }

  @Action
  private async updateAddress() {
    const addressResponse = await $axios.$patch('address', {
      data: [
        {
          id: this.info.address?.id,
          street: this.info.address?.street,
          number: this.info.address?.number,
          complement: this.info.address?.complement,
          neighborhood: this.info.address?.neighborhood,
          city: this.info.address?.city,
          state: this.info.address?.state,
          zipcode: this.info.address?.zipcode,
          latitude: this.info.address?.latitude,
          longitude: this.info.address?.longitude,
        },
      ],
    });

    if (!addressResponse.body || addressResponse.body.code !== 'UPDATE_SUCCESS') {
      throw new Error('Falha ao atualizar endereço');
    }

    return addressResponse.body.result;
  }

  @Action
  private async deleteAddress() {
    const addressResponse = await $axios.$delete(`address/${this.info.address?.id}`);

    if (!addressResponse.body || addressResponse.body.code !== 'DELETE_SUCCESS') {
      throw new Error('Falha ao deletar endereço');
    }

    return addressResponse.body.result;
  }

  @Action
  private async createEventDates(payload: { eventId: string; defaultDate: EventDate }) {
    try {
      if (!payload.defaultDate) return;
      
      // Corrigindo a lógica de filtro para considerar uma data como não padrão
      // apenas se for completamente diferente da data padrão
      const nonDefaultDates = this.info.event_dates.filter((date) => 
        !(date.start_date === payload.defaultDate.start_date && 
          date.start_time === payload.defaultDate.start_time && 
          date.end_date === payload.defaultDate.end_date && 
          date.end_time === payload.defaultDate.end_time)
      );
      
      // Se não houver datas não padrão, não é necessário chamar a API
      if (nonDefaultDates.length === 0) {
        return [];
      }

      // Formatando as datas no mesmo padrão usado em updateEventBase
      const formattedSessions = nonDefaultDates.map((date) => {
        const startDateTime = `${date.start_date}T${date.start_time}:00.000Z`;
        const endDateTime = `${date.end_date}T${date.end_time}:00.000Z`;
        
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);
        
        return {
          start_date: startDate.toISOString().replace('Z', '-0300'),
          end_date: endDate.toISOString().replace('Z', '-0300')
        };
      });

      const eventDatesResponse = await $axios.$post('event/sessions', {
        eventUuid: payload.eventId,
        sessions: formattedSessions
      });

      if (!eventDatesResponse.body || eventDatesResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar sessões de evento');
      }

      return eventDatesResponse.body.result;
    } catch (error) {
      console.error('Erro ao criar sessões de evento:', error);
      throw error;
    }
  }

  @Action
  public async updateEventBase(eventId: string) {
    try {
      
      const isOnline = this.info.event_type === 'Online';
      const hasAddress = this.info.address?.id;
      
      // Atualiza o endereço se existir
      if (hasAddress) {
        await this.updateAddress();

        // Se o evento for online, deleta o endereço
        if (isOnline) {
          await this.deleteAddress();
        }
      }

      // Obter evento principal (o que está sendo editado)
      const mainDate = this.info.event_dates.find(date => date.id === eventId) || this.info.event_dates[0];
      
      const startDateTime = `${mainDate.start_date}T${mainDate.start_time}:00.000Z`;
      const endDateTime = `${mainDate.end_date}T${mainDate.end_time}:00.000Z`;

      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      // Atualizar o evento principal
      const eventResponse = await $axios.$patch('event', {
        data: [
          {
            id: eventId,
            name: this.info.name,
            address_id: this.info.address?.id,
            description: this.info.description,
            general_information: this.info.general_information,
            category_id: this.info.category?.value,
            rating_id: this.info.rating?.value,
            event_type: this.info.event_type,
            start_date: startDate.toISOString().replace('Z', '-0300'),
            end_date: endDate.toISOString().replace('Z', '-0300'),
            link_online: this.info.link_online,
            location_name: this.info.address?.location_name,
            sale_type: this.info.sale_type,
            availability: this.info.availability,
            is_featured: this.info.is_featured,
            absorb_service_fee: this.info.absorb_service_fee || false,
          },
        ],
      });

      if (!eventResponse.body || eventResponse.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar evento base');
      }

      // Cria as novas sessoes (datas) para o evento  
      await this.createEventDates({ eventId, defaultDate: mainDate });
      // Atualiza ou deleta banner
      await this.handleEventBanner([eventId]);

      return eventResponse.body.result;
    } catch (error) {
      console.error('Erro ao atualizar evento base:', error);
      throw error;
    }
  }


  @Action
  public reset() {
    this.context.commit('UPDATE_INFO', {
      id: '',
      name: '',
      alias: '',
      description: '',
      general_information: '',
      category: null,
      event_type: null,
      rating: null,
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      sale_type: 'Ingresso',
      availability: 'Publico',
      is_featured: false,
      absorb_service_fee: false,
      address: null,
      link_online: '',
      banner: null,
      backup_banner: null,
      collaborators: [],
      status: null,
      event_dates: [],
      group_id: null,
    });
    this.context.commit('UPDATE_INFO_ADDRESS', {
      id: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: '',
      location_name: '',
      latitude: null,
      longitude: null,
    });
  }

  @Action
  private async createAddress(address: EventAddress): Promise<string> {
    try {
      const addressResponse = await $axios.$post('address', {
        data: [
          {
            street: address.street,
            number: address.number,
            complement: address.complement || '',
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode,
            latitude: address.latitude || null,
            longitude: address.longitude || null,
          },
        ],
      });

      if (!addressResponse.body || addressResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar endereço');
      }

      return addressResponse.body.result[0].id;
    } catch (error) {
      console.error('Erro ao criar endereço:', error);
      throw error;
    }
  }

  @Action
  public async updatePlatformFee(payload: { feeId: string; platformFee: number }) {
    const response = await $axios.$patch('event-fee', {
      data: [
        {
          id: payload.feeId,
          platform_fee: payload.platformFee,
        },
      ],
    });

    if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
      throw new Error('Falha ao atualizar taxa negociada');
    }

    this.context.commit('UPDATE_INFO', {
      fees: {
        id: payload.feeId,
        platform_fee: response.body.result.platform_fee,
      },
    });

    return response.body.result;
  }

  @Action
  public async handleLinkOnline(eventIds: string[]) {
    const attachment = this.$info.attachments.find(
      (attachment: EventAttachment) => attachment.name === 'link_online'
    );

    if (this.$info.link_online_id) {
      if (attachment && attachment.url !== this.$info.link_online) {
        await this.deleteEventAttachment(attachment.id as string);
        await this.createEventAttachment({
          eventIds,
          name: 'link_online',
          type: 'link',
          url: this.$info.link_online,
        });
      }
    } else if (this.$info.link_online) {
      await this.createEventAttachment({
        eventIds,
        name: 'link_online',
        type: 'link',
        url: this.$info.link_online,
      });
    }
  }

  @Action
  public async handleEventBanner(eventIds: string[]) {
    if (!this.$info.banner) return null;

    if (this.info.banner instanceof File && this.$info.banner_id) {
      await this.deleteEventAttachment(this.$info.banner_id as string);
    } else if (this.info.banner === this.info.backup_banner) {
      // Se ambos forem iguais é porque não houve alteração
      return;
    }

    const bannerIds = await this.createEventAttachment({
      eventIds,
      name: 'banner',
      type: 'image',
      url: '',
    });
    const bannerUrls = await this.uploadEventBanner({
      attachmentIds: bannerIds,
      banner: this.$info.banner as File,
    });
    await this.updateEventAttachment({ attachmentIds: bannerIds, url: bannerUrls });

    return bannerIds;
  }

  @Action
  private async createEventAttachment(payload: {
    eventIds: string[];
    name: string;
    type: string;
    url: string;
  }) {
    const attachmentResponse = await $axios.$post('event-attachment', {
      data: payload.eventIds.map((eventId) => ({
        event_id: eventId,
        name: payload.name,
        type: payload.type,
        url: payload.url,
      })),
    });

    if (!attachmentResponse.body || attachmentResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error('Failed to create attachment.');
    }

    return attachmentResponse.body.result.map((result) => result.id);
  }

  @Action
  private async deleteEventAttachment(attachmentId: string) {
    const attachmentResponse = await $axios.$delete(`event-attachment/${attachmentId}`);

    if (!attachmentResponse.body || attachmentResponse.body.code !== 'DELETE_SUCCESS') {
      throw new Error('Failed to delete attachment.');
    }
  }

  @Action
  private async uploadEventBanner(payload: { attachmentIds: string[]; banner: File }) {
    const formData = new FormData();
    
    payload.attachmentIds.forEach((attachmentId) => {
      formData.append('attachment_ids[]', attachmentId);
      formData.append('files[]', payload.banner);
    });

    const uploadResponse = await $axios.$post('upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!uploadResponse.body || uploadResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error('Failed to upload banner.');
    }

    return uploadResponse.body.result.map((result) => result.s3_url);
  }

  @Action
  private async updateEventAttachment(payload: { attachmentIds: string[]; url: string[] }) {
    const updateResponse = await $axios.$patch('event-attachment', {
      data: payload.attachmentIds.map((attachmentId, index) => ({
        id: attachmentId,
        url: payload.url[index],
      })),
    });

    if (!updateResponse.body || updateResponse.body.code !== 'UPDATE_SUCCESS') {
      throw new Error('Failed to update banner.');
    }
  }

  @Action
  private async updateEventStatus(payload: { eventId: string; statusName: string }) {
    this.context.commit('SET_LOADING_EVENT_STATUS', true);

    const statusResponse = await status.fetchStatusByModuleAndName({
      module: 'event',
      name: payload.statusName,
    });

    const updateResponse = await $axios.$patch('event', {
      data: [
        {
          id: payload.eventId,
          status_id: statusResponse.id,
        },
      ],
    });

    if (!updateResponse.body || updateResponse.body.code !== 'UPDATE_SUCCESS') {
      this.context.commit('SET_LOADING_EVENT_STATUS', false);
      throw new Error('Failed to update status.');
    }

    this.context.commit('UPDATE_INFO', {
      status: {
        id: statusResponse.id,
        name: statusResponse.name,
        module: statusResponse.module,
      },
    });

    this.context.commit('SET_LOADING_EVENT_STATUS', false);

    return updateResponse.body.result;
  }

  @Action
  public setEventStatus(status: string) {
    this.context.commit('SET_STATUS', status);
  }

  @Action
  public addEventDate(eventDate: any) {
    this.context.commit('ADD_EVENT_DATE', eventDate);
  }

  @Action
  public updateEventDate(payload: { index: number; eventDate: any }) {
    this.context.commit('UPDATE_EVENT_DATE', payload);
  }

  @Action
  public removeEventDate(index: number) {
    if (this.info.event_dates.length === 1) {
      return;
    }
    this.context.commit('REMOVE_EVENT_DATE', index);
  }

  @Action
  public setGroupId(groupId: string) {
    this.context.commit('SET_GROUP_ID', groupId);
  }

  @Action
  private async getGroupEvents(groupId: string): Promise<any[]> {
    try {
      if (!groupId) return [];
      
      const response = await $axios.$get(
        `events?whereHas[groups][id]=${groupId}&preloads[]=status`
      );

      const { data } = handleGetResponse(response, 'Eventos do grupo não encontrados', null, true);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar eventos do grupo:', error);
      return [];
    }
  }

  @Action
  public async fetchEvents(params?: {
    sortBy?: string[];
    sortDesc?: boolean[];
    whereHas?: Record<string, any>;
    preloads?: string[];
  }) {
    try {
      this.context.commit('SET_LOADING', true);

      // Construir a query string
      const queryParams: string[] = [];

      // Adicionar ordenação
      if (params?.sortBy?.length) {
        params.sortBy.forEach((field, index) => {
          queryParams.push(`sort[${field}]=${params.sortDesc?.[index] ? 'desc' : 'asc'}`);
        });
      }

      // Adicionar whereHas conditions
      if (params?.whereHas) {
        Object.entries(params.whereHas).forEach(([key, conditions]) => {
          Object.entries(conditions).forEach(([field, value]) => {
            queryParams.push(`whereHas[${key}][${field}]=${value}`);
          });
        });
      }

      // Adicionar preloads
      if (params?.preloads?.length) {
        params.preloads.forEach(preload => {
          queryParams.push(`preloads[]=${preload}`);
        });
      }

      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      
      const response = await $axios.$get(`events${queryString}`);
      const { data } = handleGetResponse(response, 'Eventos não encontrados', null, true);

      this.context.commit('SET_EVENT_LIST', data || []);
      return data;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async uploadEventImage(payload: { attachmentIds: string[]; imageFile: File }) {
    const formData = new FormData();
    
    payload.attachmentIds.forEach((attachmentId) => {
      formData.append('attachment_ids[]', attachmentId);
      formData.append('files[]', payload.imageFile);
    });

    const uploadResponse = await $axios.$post('upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!uploadResponse.body || uploadResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error('Failed to upload event image.');
    }

    return uploadResponse.body.result.map((result) => result.s3_url);
  }
}
