import { Event, EventAddress, ValidationResult, EventAttachment, EventApiResponse, EventDate } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { splitDateTime } from '@/utils/formatters';
import { handleGetResponse } from '~/utils/responseHelpers';

interface EventGeneralInfoState {
  isLoading: boolean;
  eventList: EventApiResponse[];
  info: Omit<Event, 'tickets' | 'custom_fields' | 'coupons'>;
  selectedStatus: string | null;
  isLoadingEventStatus: boolean;
}

const defaultInfo: Omit<Event, 'tickets' | 'custom_fields' | 'coupons'> = {
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

const mockInfo: Omit<Event, 'tickets' | 'custom_fields' | 'coupons'> = {
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

export const state = (): EventGeneralInfoState => ({
  isLoading: false,
  eventList: [],
  info: process.env.USE_MOCK_DATA === 'true' ? mockInfo : defaultInfo,
  selectedStatus: null,
  isLoadingEventStatus: false,
});

export const getters = {
  $info: (state: EventGeneralInfoState) => state.info,
  $formattedLocation: (state: EventGeneralInfoState) => {
    if (state.info.address && state.info.address.deleted_at !== null) {
      return `${state.info.address.street}, ${state.info.address.number} - ${state.info.address.neighborhood}, ${state.info.address.city} - ${state.info.address.state}`;
    }
    return null;
  },
  $isLoading: (state: EventGeneralInfoState) => state.isLoading,
  $isLoadingEventStatus: (state: EventGeneralInfoState) => state.isLoadingEventStatus,
  $eventList: (state: EventGeneralInfoState) => state.eventList,
};

export const mutations = {
  SET_LOADING(state: EventGeneralInfoState, payload: boolean) {
    state.isLoading = payload;
  },

  SET_LOADING_EVENT_STATUS(state: EventGeneralInfoState, status: boolean) {
    state.isLoadingEventStatus = status;
  },

  UPDATE_INFO(state: EventGeneralInfoState, payload: Partial<Event>) {
    state.info = { ...state.info, ...payload };
  },

  UPDATE_INFO_ADDRESS(state: EventGeneralInfoState, payload: Partial<EventAddress>) {
    state.info.address = { ...state.info.address, ...payload };
  },

  SET_STATUS(state: EventGeneralInfoState, status: string) {
    state.selectedStatus = status;
  },

  ADD_EVENT_DATE(state: EventGeneralInfoState, eventDate: any) {
    state.info.event_dates.push(eventDate);
  },

  UPDATE_EVENT_DATE(state: EventGeneralInfoState, payload: { index: number; eventDate: any }) {
    state.info.event_dates[payload.index] = payload.eventDate;
  },

  REMOVE_EVENT_DATE(state: EventGeneralInfoState, index: number) {
    state.info.event_dates.splice(index, 1);
  },

  SET_EVENT_DATES(state: EventGeneralInfoState, eventDates: any[]) {
    state.info.event_dates = eventDates;
  },

  SET_GROUP_ID(state: EventGeneralInfoState, groupId: string) {
    state.info.group_id = groupId;
  },

  SET_EVENT_LIST(state: EventGeneralInfoState, events: EventApiResponse[]) {
    state.eventList = events;
  },
};

export const actions = {
  updateGeneralInfoAddress({ commit }: any, payload: Partial<EventAddress>) {
    commit('UPDATE_INFO_ADDRESS', payload);
  },

  updateGeneralInfo({ commit }: any, payload: Partial<Event>) {
    commit('UPDATE_INFO', payload);
  },

  validateGeneralInfo({ state }: any): ValidationResult {
    const errors: string[] = [];

    // Validações obrigatórias
    if (!state.info.name?.trim()) {
      errors.push('Nome do evento é obrigatório');
    }

    if (!state.info.category?.value) {
      errors.push('Categoria é obrigatória');
    }

    if (!state.info.event_type) {
      errors.push('Tipo de evento é obrigatório');
    }

    if (!state.info.rating?.value) {
      errors.push('Classificação indicativa é obrigatória');
    }

    // Validações de data
    if (state.info.event_dates.length === 0) {
      errors.push('Pelo menos uma data é obrigatória');
    } else {
      // Validar cada data
      const now = new Date();
      
      for (let i = 0; i < state.info.event_dates.length; i++) {
        const date = state.info.event_dates[i];
        
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
    if (state.info.event_type === 'Online') {
      if (!state.info.link_online?.trim()) {
        errors.push('Link do evento online é obrigatório');
      }
    } else {
      // Validações de endereço para eventos presenciais
      if (!state.info.address?.street?.trim()) {
        errors.push('Rua é obrigatória para eventos presenciais');
      }
      if (!state.info.address?.number?.trim()) {
        errors.push('Número é obrigatório para eventos presenciais');
      }
      if (!state.info.address?.neighborhood?.trim()) {
        errors.push('Bairro é obrigatório para eventos presenciais');
      }
      if (!state.info.address?.city?.trim()) {
        errors.push('Cidade é obrigatória para eventos presenciais');
      }
      if (!state.info.address?.state?.trim()) {
        errors.push('Estado é obrigatório para eventos presenciais');
      }
      if (!state.info.address?.zipcode?.trim()) {
        errors.push('CEP é obrigatório para eventos presenciais');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  async fetchAndPopulateByEventId({ commit, dispatch }: any, eventId: string) {
    try {
      commit('SET_LOADING', true);

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
        'promoter:people',
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
        await dispatch('fetchAndAddGroupEvents', { groupId, currentEventId: eventId });
      }

      commit('UPDATE_INFO', {
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
        promoter: event.promoter,
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
        id_pixel: event.id_pixel,
        id_tag_manager: event.id_tag_manager,
        id_analytics: event.id_analytics,
        id_google_ads: event.id_google_ads,
        ads_conversion_label: event.ads_conversion_label,
        // TODO: Verificar se a API retorna esses campos
        api_token_conversions: event?.api_token_conversions || '',
        api_test_event_code: event?.api_test_event_code || '',
      });

      return event;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchAndAddGroupEvents({ commit, state }: any, { groupId, currentEventId }: { groupId: string; currentEventId: string }) {
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
      const currentDates = state.info.event_dates || [];
      commit('SET_EVENT_DATES', [...currentDates, ...additionalDates]);

    } catch (error) {
      console.error('Erro ao buscar eventos do grupo:', error);
    }
  },

  async createEventBase({ state, commit, dispatch }: any): Promise<EventApiResponse[]> {
    try {
      // Criar endereço se o evento for presencial
      const [addressId, eventStatus] = await Promise.all([
        state.info.event_type !== 'Online' ? dispatch('createAddress', state.info.address) : null,
        dispatch('fetchStatusByModuleAndName', {
          module: 'event',
          name: state.selectedStatus,
        }),
      ]);

      // Preparar array com todas as datas do evento
      const eventData = state.info.event_dates.map((date: any, index: number) => {
        const startDateTime = `${date.start_date}T${date.start_time}:00.000Z`;
        const endDateTime = `${date.end_date}T${date.end_time}:00.000Z`;

        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        return {
          alias: index === 0 ? state.info.alias : `${state.info.alias}-${index}`,
          name: state.info.name,
          description: state.info.description,
          general_information: state.info.general_information,
          category_id: state.info.category?.value,
          rating_id: state.info.rating?.value,
          event_type: state.info.event_type,
          start_date: startDate.toISOString().replace('Z', '-0300'),
          end_date: endDate.toISOString().replace('Z', '-0300'),
          address_id: addressId,
          status_id: eventStatus.id,
          link_online: state.info.link_online,
          location_name: state.info.address?.location_name,
          promoter_id: state.info.promoter_id,
          sale_type: state.info.sale_type,
          availability: state.info.availability,
          is_featured: state.info.is_featured,
          absorb_service_fee: state.info.absorb_service_fee || false,
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
        commit('SET_GROUP_ID', groupId);
      }

      return eventResponse.body.result;
    } catch (error) {
      console.error('Erro ao criar evento base:', error);
      throw error;
    }
  },

  async updateAddress({ state }: any) {
    const addressResponse = await $axios.$patch('address', {
      data: [
        {
          id: state.info.address?.id,
          street: state.info.address?.street,
          number: state.info.address?.number,
          complement: state.info.address?.complement,
          neighborhood: state.info.address?.neighborhood,
          city: state.info.address?.city,
          state: state.info.address?.state,
          zipcode: state.info.address?.zipcode,
          latitude: state.info.address?.latitude,
          longitude: state.info.address?.longitude,
        },
      ],
    });

    if (!addressResponse.body || addressResponse.body.code !== 'UPDATE_SUCCESS') {
      throw new Error('Falha ao atualizar endereço');
    }

    return addressResponse.body.result;
  },

  async deleteAddress({ state }: any) {
    const addressResponse = await $axios.$delete(`address/${state.info.address?.id}`);

    if (!addressResponse.body || addressResponse.body.code !== 'DELETE_SUCCESS') {
      throw new Error('Falha ao deletar endereço');
    }

    return addressResponse.body.result;
  },

  async createEventDates({ state }: any, payload: { eventId: string; defaultDate: EventDate }) {
    try {
      if (!payload.defaultDate) return;
      
      // Corrigindo a lógica de filtro para considerar uma data como não padrão
      // apenas se for completamente diferente da data padrão
      const nonDefaultDates = state.info.event_dates.filter((date: any) => 
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
      const formattedSessions = nonDefaultDates.map((date: any) => {
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
  },

  async updateEventBase({ state, dispatch }: any, eventId: string) {
    try {
      
      const isOnline = state.info.event_type === 'Online';
      const hasAddress = state.info.address?.id;
      
      // Atualiza o endereço se existir
      if (hasAddress) {
        await dispatch('updateAddress');

        // Se o evento for online, deleta o endereço
        if (isOnline) {
          await dispatch('deleteAddress');
        }
      }

      // Obter evento principal (o que está sendo editado)
      const mainDate = state.info.event_dates.find((date: any) => date.id === eventId) || state.info.event_dates[0];
      
      const startDateTime = `${mainDate.start_date}T${mainDate.start_time}:00.000Z`;
      const endDateTime = `${mainDate.end_date}T${mainDate.end_time}:00.000Z`;

      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      // Atualizar o evento principal
      const eventResponse = await $axios.$patch('event', {
        data: [
          {
            id: eventId,
            name: state.info.name,
            address_id: state.info.address?.id,
            description: state.info.description,
            general_information: state.info.general_information,
            category_id: state.info.category?.value,
            rating_id: state.info.rating?.value,
            event_type: state.info.event_type,
            start_date: startDate.toISOString().replace('Z', '-0300'),
            end_date: endDate.toISOString().replace('Z', '-0300'),
            link_online: state.info.link_online,
            location_name: state.info.address?.location_name,
            sale_type: state.info.sale_type,
            availability: state.info.availability,
            is_featured: state.info.is_featured,
            absorb_service_fee: state.info.absorb_service_fee || false,
          },
        ],
      });

      if (!eventResponse.body || eventResponse.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar evento base');
      }

      // Cria as novas sessoes (datas) para o evento  
      await dispatch('createEventDates', { eventId, defaultDate: mainDate });
      // Atualiza ou deleta banner
      await dispatch('handleEventBanner', [eventId]);

      return eventResponse.body.result;
    } catch (error) {
      console.error('Erro ao atualizar evento base:', error);
      throw error;
    }
  },

  reset({ commit }: any) {
    commit('UPDATE_INFO', {
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
    commit('UPDATE_INFO_ADDRESS', {
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
  },

  async createAddress(_: any, address: EventAddress): Promise<string> {
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
  },

  async updatePlatformFee({ commit }: any, payload: { feeId: string; platformFee: number }) {
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

    commit('UPDATE_INFO', {
      fees: {
        id: payload.feeId,
        platform_fee: response.body.result.platform_fee,
      },
    });

    return response.body.result;
  },

  async handleLinkOnline({ state, dispatch }: any, eventIds: string[]) {
    const attachment = state.info.attachments.find(
      (attachment: EventAttachment) => attachment.name === 'link_online'
    );

    if (state.info.link_online_id) {
      if (attachment && attachment.url !== state.info.link_online) {
        await dispatch('deleteEventAttachment', attachment.id as string);
        await dispatch('createEventAttachment', {
          eventIds,
          name: 'link_online',
          type: 'link',
          url: state.info.link_online,
        });
      }
    } else if (state.info.link_online) {
      await dispatch('createEventAttachment', {
        eventIds,
        name: 'link_online',
        type: 'link',
        url: state.info.link_online,
      });
    }
  },

  async handleEventBanner({ state, dispatch }: any, eventIds: string[]) {
    if (!state.info.banner) return null;

    if (state.info.banner instanceof File && state.info.banner_id) {
      await dispatch('deleteEventAttachment', state.info.banner_id as string);
    } else if (state.info.banner === state.info.backup_banner) {
      // Se ambos forem iguais é porque não houve alteração
      return;
    }

    const bannerIds = await dispatch('createEventAttachment', {
      eventIds,
      name: 'banner',
      type: 'image',
      url: '',
    });
    const bannerUrls = await dispatch('uploadEventBanner', {
      attachmentIds: bannerIds,
      banner: state.info.banner as File,
    });
    await dispatch('updateEventAttachment', { attachmentIds: bannerIds, url: bannerUrls });

    return bannerIds;
  },

  async createEventAttachment(_: any, payload: {
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

    return attachmentResponse.body.result.map((result: any) => result.id);
  },

  async deleteEventAttachment(_: any, attachmentId: string) {
    const attachmentResponse = await $axios.$delete(`event-attachment/${attachmentId}`);

    if (!attachmentResponse.body || attachmentResponse.body.code !== 'DELETE_SUCCESS') {
      throw new Error('Failed to delete attachment.');
    }
  },

  async uploadEventBanner(_: any, payload: { attachmentIds: string[]; banner: File }) {
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

    return uploadResponse.body.result.map((result: any) => result.s3_url);
  },

  async updateEventAttachment(_: any, payload: { attachmentIds: string[]; url: string[] }) {
    const updateResponse = await $axios.$patch('event-attachment', {
      data: payload.attachmentIds.map((attachmentId, index) => ({
        id: attachmentId,
        url: payload.url[index],
      })),
    });

    if (!updateResponse.body || updateResponse.body.code !== 'UPDATE_SUCCESS') {
      throw new Error('Failed to update banner.');
    }
  },

  async updateEventStatus({ commit }: any, payload: { eventId: string; statusName: string }) {
    commit('SET_LOADING_EVENT_STATUS', true);

    try {
      // Buscar status diretamente pela API
      const statusResponse = await $axios.$get(`statuses?where[module][v]=event&where[name][v]=${payload.statusName}`);
      
      if (!statusResponse.body || statusResponse.body.code !== 'SEARCH_SUCCESS') {
        commit('SET_LOADING_EVENT_STATUS', false);
        throw new Error('Status não encontrado.');
      }

      const statusData = statusResponse.body.result.data[0];

      // Busca o grupo do evento atual
      const { data } = await $axios.get(`/event-groups?whereHas[events][event_id][v]=${payload.eventId}&preloads[]=events:status`);

      const response = handleGetResponse(data, 'Grupo do evento não encontrado', null, true);

      const eventsInGroup = response.data[0]?.events;

      if (!eventsInGroup) {
        commit('SET_LOADING_EVENT_STATUS', false);
        throw new Error('Grupo nao retornou eventos');
      }

      const onlyEmAnalise = eventsInGroup.filter((event: any) => event?.status?.name === 'Em Análise');

      if (onlyEmAnalise.length === 0) {
        commit('SET_LOADING_EVENT_STATUS', false);
        throw new Error('Não há eventos em análise no grupo');
      }

      const eventsIdToUpdate = onlyEmAnalise.map((event: any) => event?.id);

      if (!eventsIdToUpdate.includes(payload.eventId)) {
        commit('SET_LOADING_EVENT_STATUS', false);
        throw new Error('Evento nao pertence ao grupo');
      }
      
      // Atualiza o status de todos os eventos do grupo
      const updateResponse = await $axios.$patch('event', {
        data: eventsIdToUpdate.map((eventId: string) => ({
          id: eventId,
          status_id: statusData.id,
        })),
      });

      if (!updateResponse.body || updateResponse.body.code !== 'UPDATE_SUCCESS') {
        commit('SET_LOADING_EVENT_STATUS', false);
        throw new Error('Failed to update status.');
      }

      commit('UPDATE_INFO', {
        status: {
          id: statusData.id,
          name: statusData.name,
          module: statusData.module,
        },
      });

      commit('SET_LOADING_EVENT_STATUS', false);

      return updateResponse.body.result;
      
    } catch (error) {
      commit('SET_LOADING_EVENT_STATUS', false);
      throw error;
    }
  },

  setEventStatus({ commit }: any, status: string) {
    commit('SET_STATUS', status);
  },

  addEventDate({ commit }: any, eventDate: any) {
    commit('ADD_EVENT_DATE', eventDate);
  },

  updateEventDate({ commit }: any, payload: { index: number; eventDate: any }) {
    commit('UPDATE_EVENT_DATE', payload);
  },

  removeEventDate({ commit, state }: any, index: number) {
    if (state.info.event_dates.length === 1) {
      return;
    }
    commit('REMOVE_EVENT_DATE', index);
  },

  setGroupId({ commit }: any, groupId: string) {
    commit('SET_GROUP_ID', groupId);
  },

  async getGroupEvents(_: any, groupId: string): Promise<any[]> {
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
  },

  async fetchEvents({ commit }: any, params?: {
    sortBy?: string[];
    sortDesc?: boolean[];
    whereHas?: Record<string, any>;
    preloads?: string[];
  }) {
    try {
      commit('SET_LOADING', true);

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

      commit('SET_EVENT_LIST', data || []);
      return data;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async uploadEventImage(_: any, payload: { attachmentIds: string[]; imageFile: File }) {
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

    return uploadResponse.body.result.map((result: any) => result.s3_url);
  },

  async fetchStatusByModuleAndName(_: any, { module, name }: { module: string; name: string }) {
    try {
      const response = await $axios.$get(`statuses?where[module][v]=${module}&where[name][v]=${name}`);
      
      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error(`Status "${name}" não encontrado para o módulo "${module}"`);
      }

      return response.body.result.data[0];
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      throw error;
    }
  },

  async updateEventIntegrations({ commit }: any, { eventId, integrations }: { eventId: string; integrations: any }) {
    try {
      const response = await $axios.$patch('event', {
        data: [
          {
            id: eventId,
            id_pixel: integrations.id_pixel || null,
            api_token_conversions: integrations.api_token_conversions || null,
            api_test_event_code: integrations.api_test_event_code || null,
            id_tag_manager: integrations.id_tag_manager || null,
            id_analytics: integrations.id_analytics || null,
            id_google_ads: integrations.id_google_ads || null,
            ads_conversion_label: integrations.ads_conversion_label || null,
          },
        ],
      });

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar integrações do evento');
      }

      // Atualizar o estado local
      commit('UPDATE_INFO', {
        id_pixel: integrations.id_pixel,
        api_token_conversions: integrations.api_token_conversions,
        api_test_event_code: integrations.api_test_event_code,
        id_tag_manager: integrations.id_tag_manager,
        id_analytics: integrations.id_analytics,
        id_google_ads: integrations.id_google_ads,
        ads_conversion_label: integrations.ads_conversion_label,
      });

      return response.body.result;
    } catch (error) {
      console.error('Erro ao atualizar integrações do evento:', error);
      throw error;
    }
  },
};
