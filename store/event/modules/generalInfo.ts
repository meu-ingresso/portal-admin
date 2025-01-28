import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { Event, EventAddress, ValidationResult } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { status } from '@/utils/store-util';

@Module({
  name: 'generalInfo',
  stateFactory: true,
  namespaced: true,
})
export default class GeneralInfoModule extends VuexModule {
  private info: Omit<Event, 'tickets' | 'custom_fields' | 'coupons'> = {
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
  };

  @Mutation
  private UPDATE_INFO(payload: Partial<Event>) {
    this.info = { ...this.info, ...payload };
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
  public async createEventBase(): Promise<{ eventId: string; addressId?: string }> {
    try {

      // Criar endereço se o evento for presencial
      const [addressId, draftStatus] = await Promise.all([
        this.info.event_type !== 'Online' ? this.createAddress(this.info.address) : null,
        status.fetchStatusByModuleAndName('event', 'Rascunho'),
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
  public async handleEventBanner(eventId: string, banner: File) {
    if (!banner) return null;

    const bannerId = await this.createEventBanner(eventId);
    const bannerUrl = await this.uploadEventBanner(bannerId, banner);
    await this.updateEventBanner(bannerId, bannerUrl);

    return bannerId;
  }

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