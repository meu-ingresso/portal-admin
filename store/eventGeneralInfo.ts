import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { Event, EventAddress, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { status } from '@/utils/store-util';
import { splitDateTime } from '@/utils/formatters';

@Module({
  name: 'eventGeneralInfo',
  stateFactory: true,
  namespaced: true,
})
export default class EventGeneralInfo extends VuexModule {

  private isLoading: boolean = false;

  private info: Omit<Event, 'tickets' | 'custom_fields' | 'coupons'> = {
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
      img:"https://meuingresso-attachments.s3.us-east-1.amazonaws.com/%2B14.png",
      text: 'Maiores de 14 anos',
      value: 'fdc6ed28-5d77-4383-9820-621491c5b075',
    },
    start_date: '2025-02-01',
    start_time: '10:00',
    end_date: '2025-02-01',
    end_time: '12:00',
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
  };

  constructor(module: VuexModule<ThisType<EventGeneralInfo>, EventGeneralInfo>) {
    super(module);
    this.info = process.env.USE_MOCK_DATA === 'true' ? this.mockInfo : this.info;
  }

  public get $info() {
    return this.info;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  @Mutation
  private SET_LOADING(payload: boolean) {
    this.isLoading = payload;
  }

  @Mutation
  private UPDATE_INFO(payload: Partial<Event>) {
    this.info = { ...this.info, ...payload };
  }

  @Mutation
  private UPDATE_INFO_ADDRESS(payload: Partial<EventAddress>) {
    this.info.address = { ...this.info.address, ...payload };
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
    if (!this.info.start_date || !this.info.start_time) {
      errors.push('Data e hora de início são obrigatórios');
    }

    if (!this.info.end_date || !this.info.end_time) {
      errors.push('Data e hora de término são obrigatórios');
    }

    if (this.info.start_date && this.info.start_time && this.info.end_date && this.info.end_time) {
      const startDate = new Date(`${this.info.start_date}T${this.info.start_time}`);
      const endDate = new Date(`${this.info.end_date}T${this.info.end_time}`);
      const now = new Date();

      if (startDate < now) {
        errors.push('A data de início deve ser maior que a data atual');
      }

      if (endDate <= startDate) {
        errors.push('A data de término deve ser maior que a data de início');
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
        'collaborators',
      ];

      const response = await $axios.$get(
        `events?where[id][v]=${eventId}&${preloads
          .map((preload) => `preloads[]=${preload}`)
          .join('&')}`
      );

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Evento não encontrado');
      }

      const event = response.body.result.data[0];

      // Separar data e hora
      const startDateTime = splitDateTime(event.start_date);
      const endDateTime = splitDateTime(event.end_date);

      const attachmentBanner = event.attachments.find((attachment) => attachment.name === 'banner')?.image_url;

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
        start_date: startDateTime.date,
        start_time: startDateTime.time,
        end_date: endDateTime.date,
        end_time: endDateTime.time,
        banner: attachmentBanner,
        sale_type: event.sale_type,
        availability: event.availability,
        is_featured: event.is_featured,
        absorb_service_fee: event.absorb_service_fee,
        address: event.address ? {
          street: event.address.street,
          number: event.address.number,
          complement: event.address.complement || '',
          neighborhood: event.address.neighborhood,
          city: event.address.city,
          state: event.address.state,
          zipcode: event.address.zipcode,
          location_name: event.location_name || '',
          latitude: event.address.latitude ? Number(event.address.latitude) : null,
          longitude: event.address.longitude ? Number(event.address.longitude) : null,
        } : null,
        link_online: event.link_online || '',
        promoter_id: event.promoter_id,
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
  public async createEventBase(): Promise<{ eventId: string; addressId?: string }> {
    try {

      // Criar endereço se o evento for presencial
      const [addressId, draftStatus] = await Promise.all([
        this.info.event_type !== 'Online' ? this.createAddress(this.info.address) : null,
        status.fetchStatusByModuleAndName({ module: 'event', name: 'Rascunho' }),
      ]);

      // Criar evento base
      const startDateTime = `${this.info.start_date}T${this.info.start_time}:00.000Z`;
      const endDateTime = `${this.info.end_date}T${this.info.end_time}:00.000Z`;

      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      const eventResponse = await $axios.$post('event', {
        alias: this.info.alias,
        name: this.info.name,
        description: this.info.description,
        general_information: this.info.general_information,
        category_id: this.info.category?.value,
        rating_id: this.info.rating?.value,
        event_type: this.info.event_type,
        start_date: startDate.toISOString().replace('Z', '-0300'),
        end_date: endDate.toISOString().replace('Z', '-0300'),
        address_id: addressId,
        status_id: draftStatus.id,
        link_online: this.info.link_online,
        location_name: this.info.address?.location_name,
        promoter_id: this.info.promoter_id,
        sale_type: this.info.sale_type,
        availability: this.info.availability,
        is_featured: this.info.is_featured,
        absorb_service_fee: this.info.absorb_service_fee || false,
      });

      if (!eventResponse.body || eventResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar evento');
      }

      return {
        eventId: eventResponse.body.result.id,
        addressId,
      };
    } catch (error) {
      console.error('Erro ao criar evento base:', error);
      throw error;
    }
  }

  @Action
  public reset() {
    this.context.commit('UPDATE_INFO', {
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
    });
  }

  @Action
  private async createAddress(address: EventAddress): Promise<string> {
    try {
      const addressResponse = await $axios.$post('address', {
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        latitude: address.latitude || null,
        longitude: address.longitude || null,
      });

      if (!addressResponse.body || addressResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar endereço');
      }

      return addressResponse.body.result.id;
    } catch (error) {
      console.error('Erro ao criar endereço:', error);
      throw error;
    }
  }

  @Action
  public async handleEventBanner(eventId: string) {
    if (!this.$info.banner) return null;

    const bannerId = await this.createEventBanner(eventId);
    const bannerUrl = await this.uploadEventBanner(bannerId, this.$info.banner);
    await this.updateEventBanner(bannerId, bannerUrl);

    return bannerId;
  }

  @Action
  private async createEventBanner(eventId: string) {
    const attachmentResponse = await $axios.$post('event-attachment', {
      event_id: eventId,
      name: 'banner',
      type: 'image',
      url: '',
    });

    if (!attachmentResponse.body || attachmentResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error('Failed to create attachment.');
    }

    return attachmentResponse.body.result.id;
  }

  @Action
  private async uploadEventBanner(attachmentId: string, banner: File) {
    const formData = new FormData();
    formData.append('event_attachment_id', attachmentId);
    formData.append('file', banner);

    const uploadResponse = await $axios.$post('upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!uploadResponse.body || uploadResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error('Failed to upload banner.');
    }

    return uploadResponse.body.result.s3_url;
  }

  @Action
  private async updateEventBanner(attachmentId: string, bannerUrl: string) {
    const updateResponse = await $axios.$patch('event-attachment', {
      id: attachmentId,
      image_url: bannerUrl,
    });

    if (!updateResponse.body || updateResponse.body.code !== 'UPDATE_SUCCESS') {
      throw new Error('Failed to update banner.');
    }
  }
} 