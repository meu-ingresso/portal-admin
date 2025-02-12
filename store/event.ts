import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload } from '~/models';
import { formatRealValue } from '~/utils/formatters';

async function getStatusByModuleName(module, name) {
  const response = await $axios.$get(
    `statuses?where[module][v]=${module}&where[name][v]=${name}`
  );

  if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
    throw new Error(`Falha ao buscar status do módulo: ${module}.`);
  }

  return response.body.result.data[0];
}

async function createAddress(eventPayload) {
  const addressResponse = await $axios.$post('address', {
    street: eventPayload.address.street,
    zipcode: eventPayload.address.cep,
    number: eventPayload.address.number,
    complement: eventPayload.address.complement || '',
    neighborhood: eventPayload.address.neighborhood,
    latitude: eventPayload.address.latitude || null,
    longitude: eventPayload.address.longitude || null,
    city: eventPayload.address.city,
    state: eventPayload.address.state,
  });

  if (!addressResponse.body || addressResponse.body.code !== 'CREATE_SUCCESS') {
    throw new Error('Failed to create address.');
  }

  return addressResponse.body.result.id;
}

async function createEvent(payload) {
  // Combina data e hora em uma única string ISO
  const startDateTime = `${payload.startDate}T${payload.startTime}:00.000Z`;
  const endDateTime = `${payload.endDate}T${payload.endTime}:00.000Z`;

  // Converte para Date para manipulação
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  const eventResponse = await $axios.$post('event', {
    alias: payload.alias,
    name: payload.eventName,
    description: payload.general_information,
    status_id: payload.statusId,
    address_id: payload.addressId,
    category_id: payload.category.value,
    rating_id: payload.rating.value,
    start_date: startDate.toISOString().replace('Z', '-0300'),
    end_date: endDate.toISOString().replace('Z', '-0300'),
    general_information: payload.general_information,
    location_name: payload.address?.location_name,
    availability: payload.availability,
    sale_type: payload.sale_type,
    event_type: payload.event_type,
    promoter_id: payload.promoter_id || '',
    is_featured: payload.is_featured,
    absorb_service_fee: payload.absorb_service_fee || false,
  });

  if (!eventResponse.body || eventResponse.body.code !== 'CREATE_SUCCESS') {
    throw new Error('Failed to create event.');
  }

  return eventResponse.body.result.id;
}

async function createEventBanner(eventId) {
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

async function updateEventBanner(attachmentId, bannerUrl) {
  const updateResponse = await $axios.$patch('event-attachment', {
    id: attachmentId,
    url: bannerUrl,
  });

  if (!updateResponse.body || updateResponse.body.code !== 'UPDATE_SUCCESS') {
    throw new Error('Failed to update banner.');
  }
}

async function uploadEventBanner(attachmentId, banner) {
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

async function createCategory(eventId, categoryName, categoryMap) {
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

async function createSingleTicket(eventId, ticket, statusId, categoryId, index) {
  const ticketPrice = parseFloat(ticket.price.replace(',', '.'));

  // Converte as datas para o timezone correto
  const startDateTime = `${ticket.open_date}T${ticket.start_time}:00.000Z`;
  const endDateTime = `${ticket.close_date}T${ticket.end_time}:00.000Z`;

  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  const payload: any = {
    event_id: eventId,
    name: ticket.name,
    total_quantity: ticket.max_quantity,
    remaining_quantity: ticket.max_quantity,
    price: ticketPrice,
    status_id: statusId,
    start_date: startDate.toISOString().replace('Z', '-0300'),
    end_date: endDate.toISOString().replace('Z', '-0300'),
    availability: ticket.availability.value,
    display_order: index + 1,
    min_quantity_per_user: ticket.min_purchase,
    max_quantity_per_user: ticket.max_purchase,
  };

  if (categoryId) {
    payload.ticket_event_category_id = categoryId;
  }

  const ticketResponse = await $axios.$post('ticket', payload);

  if (!ticketResponse.body || ticketResponse?.body?.code !== 'CREATE_SUCCESS') {
    throw new Error(`Falha ao criar ingresso: ${ticket.name}`);
  }

  return ticketResponse?.body?.result?.id;
}

async function createTicketsAndCategories(eventId, tickets) {
  try {
    const ticketMap = {};
    const categoryMap = new Map();

    const statusResponse = await getStatusByModuleName('ticket', 'Disponível');

    const ticketPromises = tickets.map(async (ticket, index) => {
      try {
        const categoryId = await createCategory(eventId, ticket.category, categoryMap);

        const ticketId = await createSingleTicket(
          eventId,
          ticket,
          statusResponse.id,
          categoryId,
          index
        );

        ticketMap[ticket.name] = ticketId;
      } catch (error) {
        throw new Error(`Erro ao processar ingresso ${ticket.name}: ${error.message}`);
      }
    });

    await Promise.all(ticketPromises);
    return ticketMap;
  } catch (error) {
    console.error('Erro ao criar ingressos e categorias:', error);
    throw error;
  }
}

function getCustomFieldOptions(customField) {
  return {
    isRequired: customField.options.some((option) => option.value === 'required'),
    visibleOnTicket: customField.options.some(
      (option) => option.value === 'visible_on_ticket'
    ),
    isUnique: customField.options.some((option) => option.value === 'is_unique'),
  };
}

async function createSingleCustomField(eventId, customField, personType, index) {
  const { isRequired, visibleOnTicket, isUnique } = getCustomFieldOptions(customField);

  const fieldResponse = await $axios.$post('event-checkout-field', {
    event_id: eventId,
    name: customField.name,
    type: customField.type.value,
    person_type: personType.value,
    required: isRequired,
    is_unique: isUnique,
    visible_on_ticket: visibleOnTicket,
    help_text: customField.help_text || '',
    display_order: customField.display_order || index + 1,
  });

  if (!fieldResponse.body || fieldResponse.body.code !== 'CREATE_SUCCESS') {
    throw new Error(`Falha ao criar campo personalizado: ${customField.name}`);
  }

  return fieldResponse.body.result.id;
}

function updateFieldTicketMap(fieldTicketMap, ticketNames, fieldId) {
  for (const ticketName of ticketNames) {
    if (!fieldTicketMap[ticketName]) {
      fieldTicketMap[ticketName] = [];
    }
    fieldTicketMap[ticketName].push(fieldId);
  }
}

async function createCustomFields(eventId, customFields) {
  const fieldTicketMap = {};

  try {
    const fieldPromises = customFields.flatMap((customField, index) => {
      return customField.personTypes.map(async (personType) => {
        try {
          const fieldId = await createSingleCustomField(
            eventId,
            customField,
            personType,
            index
          );

          return {
            fieldId,
            tickets: customField.tickets,
          };
        } catch (error) {
          throw new Error(
            `Erro ao processar campo ${customField.name}: ${error.message}`
          );
        }
      });
    });

    const results = await Promise.all(fieldPromises);

    results.forEach(({ fieldId, tickets }) => {
      updateFieldTicketMap(fieldTicketMap, tickets, fieldId);
    });

    return fieldTicketMap;
  } catch (error) {
    console.error('Erro ao criar campos personalizados:', error);
    throw error;
  }
}

async function createSingleFieldTicketRelation(fieldId, ticketId) {
  const response = await $axios.$post('event-checkout-field-ticket', {
    event_checkout_field_id: fieldId,
    ticket_id: ticketId,
  });

  if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
    throw new Error(`Falha ao vincular campo ${fieldId} ao ingresso ${ticketId}`);
  }

  return response.body.result;
}

async function createEventCheckoutFieldTicketRelations(fieldTicketMap, ticketMap) {
  try {
    const relations = Object.entries(fieldTicketMap).flatMap(([ticketName, fieldIds]) => {
      const ticketId = ticketMap[ticketName];
      if (!ticketId) {
        throw new Error(`Ingresso não encontrado: ${ticketName}`);
      }

      return (fieldIds as string[]).map((fieldId) => ({
        fieldId,
        ticketId,
        ticketName,
      }));
    });

    await Promise.all(
      relations.map(async ({ fieldId, ticketId, ticketName }) => {
        try {
          await createSingleFieldTicketRelation(fieldId, ticketId);
        } catch (error) {
          throw new Error(
            `Falha ao criar relação entre campo ${fieldId} e ingresso ${ticketName}: ${error.message}`
          );
        }
      })
    );
  } catch (error) {
    console.error('Erro ao criar relações entre campos e ingressos:', error);
    throw error;
  }
}

async function createCouponTicketRelations(couponTicketMap, ticketMap) {
  try {
    const relationsPromises = [];

    for (const [ticketName, couponIds] of Object.entries(couponTicketMap)) {
      const ticketId = ticketMap[ticketName];

      (couponIds as any[]).forEach((couponId) => {
        relationsPromises.push(
          $axios.$post('coupon-ticket', {
            coupon_id: couponId,
            ticket_id: ticketId,
          })
        );
      });
    }

    await Promise.all(relationsPromises);
  } catch (error) {
    console.error('Error in createCouponTicketRelations:', error);
    throw new Error('Failed to create coupon-ticket relations.');
  }
}

async function createCouponsWithTickets(eventId, coupons, statusId) {
  const couponTicketMap = {}; // Mapeia cupom -> ingressos

  const couponPromises = coupons.map(async (coupon) => {
    const couponDiscountValue = parseFloat(coupon.discountValue.replace(',', '.'));

    // Converte as datas para o timezone correto
    const startDateTime = `${coupon.start_date}T${coupon.start_time}:00.000Z`;
    const endDateTime = `${coupon.end_date}T${coupon.end_time}:00.000Z`;

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    const couponResponse = await $axios.$post('coupon', {
      event_id: eventId,
      status_id: statusId,
      code: coupon.code,
      discount_value: couponDiscountValue,
      discount_type: coupon.discountType.value,
      max_uses: coupon.maxUses,
      start_date: startDate.toISOString().replace('Z', '-0300'),
      end_date: endDate.toISOString().replace('Z', '-0300'),
    });

    if (!couponResponse.body || couponResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error('Failed to event coupon.');
    }

    const couponId = couponResponse.body.result.id;

    // Relaciona o campo aos ingressos especificados
    coupon.tickets.forEach((ticketName) => {
      if (!couponTicketMap[ticketName]) {
        couponTicketMap[ticketName] = [];
      }
      couponTicketMap[ticketName].push(couponId);
    });
  });

  await Promise.all(couponPromises);

  return couponTicketMap;
}

async function createCouponsWithoutTickets(eventId, coupons, statusId) {
  const couponPromises = coupons.map(async (coupon) => {
    const couponDiscountValue = parseFloat(coupon.discountValue.replace(',', '.'));

    // Converte as datas para o timezone correto
    const startDateTime = `${coupon.start_date}T${coupon.start_time}:00.000Z`;
    const endDateTime = `${coupon.end_date}T${coupon.end_time}:00.000Z`;

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    const couponResponse = await $axios.$post('coupon', {
      event_id: eventId,
      status_id: statusId,
      code: coupon.code,
      discount_value: couponDiscountValue,
      discount_type: coupon.discountType.value,
      max_uses: coupon.maxUses,
      start_date: startDate.toISOString().replace('Z', '-0300'),
      end_date: endDate.toISOString().replace('Z', '-0300'),
    });

    if (!couponResponse.body || couponResponse.body.code !== 'CREATE_SUCCESS') {
      throw new Error('Failed to event coupon.');
    }
  });

  await Promise.all(couponPromises);
}

async function handleEventBanner(eventId, banner) {
  if (!banner) return null;

  const bannerId = await createEventBanner(eventId);
  const bannerUrl = await uploadEventBanner(bannerId, banner);
  await updateEventBanner(bannerId, bannerUrl);

  return bannerId;
}

async function handleCoupons(eventId, coupons) {
  if (!coupons.length) return {};

  const statusResponse = await getStatusByModuleName('coupon', 'Disponível');

  const [couponsWithTickets, couponsWithoutTickets] = coupons.reduce(
    (acc, coupon) => {
      acc[coupon.tickets.length > 0 ? 0 : 1].push(coupon);
      return acc;
    },
    [[], []]
  );

  const results = await Promise.all([
    couponsWithTickets.length > 0
      ? createCouponsWithTickets(eventId, couponsWithTickets, statusResponse.id)
      : {},
    couponsWithoutTickets.length > 0
      ? createCouponsWithoutTickets(eventId, couponsWithoutTickets, statusResponse.id)
      : null,
  ]);

  return results[0];
}

function validateEventData(eventPayload) {
  if (eventPayload.event_type !== 'Online' && !eventPayload.address) {
    throw new Error('Endereço é obrigatório para eventos presenciais');
  }

  if (eventPayload.tickets?.length > 0) {
    const ticketNames = new Set();
    for (const ticket of eventPayload.tickets) {
      if (ticketNames.has(ticket.name)) {
        throw new Error(`Nome de ingresso duplicado: ${ticket.name}`);
      }
      ticketNames.add(ticket.name);
    }
  }
}

@Module({
  name: 'event',
  stateFactory: true,
  namespaced: true,
})
export default class Event extends VuexModule {
  private eventList = [];
  private isLoading: boolean = false;
  private isLoadingAlias: boolean = false;
  private isSaving: boolean = false;
  private isEditing: boolean = false;
  private isDeleting: boolean = false;
  private progressTitle: string = '';

  public get $eventList() {
    return this.eventList;
  }

  private defaultFields = [
    {
      name: 'Nome Completo',
      type: { text: 'Texto', value: 'TEXTO' },
      is_default: true,
      options: [
        { text: 'Obrigatório', value: 'required' },
        { text: 'Visível no ingresso', value: 'visible_on_ticket' },
      ],
      person_types: [
        { text: 'Pessoa Física (PF)', value: 'PF' },
        { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
        { text: 'Estrangeiro', value: 'ESTRANGEIRO' },
      ],
      tickets: [],
    },
    {
      name: 'Email',
      type: { text: 'Email', value: 'EMAIL' },
      is_default: true,
      options: [
        { text: 'Obrigatório', value: 'required' },
        { text: 'Visível na Impressão', value: 'visible_on_ticket' },
      ],
      person_types: [
        { text: 'Pessoa Física (PF)', value: 'PF' },
        { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
        { text: 'Estrangeiro', value: 'ESTRANGEIRO' },
      ],
      tickets: [],
    },
  ];

  private event: any = {
    location_name: '',
    description: '',
    start_date: '',
    end_date: '',
    name: '',
    alias: '',
    event_type: '',
    rating: {
      value: '',
      text: '',
      img: '',
    },
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: '',
      cep: '',
    },
    is_featured: false,
    absorb_service_fee: false,
    tickets: [],
    coupons: [],
    collaborators: [],
    attachments: [],
    customFields: [...this.defaultFields],
    link_online: '',
    sale_type: 'Ingresso',
    availability: 'Público',
    promoter_id: null,
    status_id: '',
    rating_id: '',
    category_id: '',
    general_information: '',
  };

  private copyEvent: any = {
    location_name: '',
    description: 'teste',
    category_id: '',
    rating_id: '',
    start_date: '',
    end_date: '',
    name: '',
    event_type: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: '',
      cep: '',
    },
  };

  public get $event() {
    if (!this.event) return null;

    return {
      ...this.event,

      location: `${this.event.address.street}, ${this.event.address.number} - ${this.event.address.neighborhood}, ${this.event.address.city} - ${this.event.address.state}`,
    };
  }

  public get $isLoading() {
    return this.isLoading;
  }

  public get $isLoadingAlias() {
    return this.isLoadingAlias;
  }

  public get $isSaving() {
    return this.isSaving;
  }

  public get $isEditing() {
    return this.isEditing;
  }

  public get $isDeleting() {
    return this.isDeleting;
  }

  public get $progressTitle() {
    return this.progressTitle;
  }

  @Mutation
  private SET_EVENT_LIST(data: any) {
    this.eventList = data.map((event: any) => ({
      ...event,
      location: `${event.address.street}, ${event.address.number} - ${event.address.neighborhood}, ${event.address.city} - ${event.address.state}`,
    }));
  }

  @Mutation
  private SET_EVENT(data: any) {
    const ticketsTypes = data.tickets.map((ticket) => ticket.name);

    const ticketSales = data.tickets.filter(
      (ticket) => ticket.total_quantity > ticket.remaining_quantity
    );

    this.event = {
      ...data,
      title: data.name,
      statusText: data.status.name,
      date: data.start_date,
      statistics: [
        {
          title: 'Visualizações',
          value: `${data.totalizers.totalViews === 0 ? 'Nenhuma' : `${data.totalizers.totalViews}`
            }`,
        },
        { title: 'Visibilidade', value: data.availability },
        {
          title: 'Tipos de ingressos',
          value: `${ticketsTypes.length === 0 ? 'Nenhum' : `${ticketsTypes.length}`}`,
        },
        {
          title: 'Cupons de Desconto',
          value: `${data.coupons.length === 0 ? 'Nenhum' : `${data.coupons.length}`}`,
        },
      ],
      sales: [
        { title: 'Ingressos Vendidos', value: ticketSales.length },
        {
          title: 'Vendas',
          value: formatRealValue(data.totalizers.totalSalesAmout),
        },
      ],
      promoters: data.collaborators.length,
      tickets: data.tickets.map((ticket) => ({
        ...ticket,
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        sold: ticket.total_quantity - ticket.remaining_quantity,
        total: ticket.total_quantity,
        status: ticket.status.name,
        hasSales: ticket.total_quantity > ticket.remaining_quantity,
        eventPromoter: data.promoter_id,
      })),
    };

    this.copyEvent = {
      ...this.event,
    };
  }

  @Mutation
  private SET_IS_LOADING(value: boolean) {
    this.isLoading = value;
  }

  @Mutation
  private SET_IS_LOADING_ALIAS(value: boolean) {
    this.isLoadingAlias = value;
  }

  @Mutation
  private SET_IS_SAVING(value: boolean) {
    this.isSaving = value;
  }

  @Mutation
  private SET_IS_EDITING(value: boolean) {
    this.isEditing = value;
  }

  @Mutation
  private SET_IS_DELETING(value: boolean) {
    this.isDeleting = value;
  }

  @Mutation
  private SET_PROGRESS_TITLE(value: string) {
    this.progressTitle = value;
  }

  @Action
  public setLoading(value: boolean) {
    this.context.commit('SET_IS_LOADING', value);
  }

  @Action
  public setEditing(value: boolean) {
    this.isEditing = value;
  }

  @Action
  public setDeleting(value: boolean) {
    this.isDeleting = value;
  }

  @Action
  public setProgressTitle(value: string) {
    this.context.commit('SET_PROGRESS_TITLE', value);
  }

  @Action
  public setSaving(value: boolean) {
    this.context.commit('SET_IS_SAVING', value);
  }

  @Action
  public setLoadingAlias(value: boolean) {
    this.context.commit('SET_IS_LOADING_ALIAS', value);
  }

  @Mutation
  private RESET() {
    this.event = {
      id: undefined,
      location_name: '',
      description: '',
      category_id: '',
      rating_id: '',
      start_date: '',
      end_date: '',
      name: '',
      event_type: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
        cep: '',
      },
      availability: '',
      sale_type: '',
      promoter_id: '',
      is_featured: false,
      absorb_service_fee: false,
    };
    this.copyEvent = { ...this.event };
  }

  @Action
  public setEvent(data: any) {
    this.context.commit('SET_EVENT', data);
  }

  @Action
  public async fetchEvents({
    page = 1,
    limit = 12,
    search,
    sortBy,
    sortDesc,
  }: SearchPayload) {
    this.setLoading(true);

    const preloads = [
      'rating',
      'tickets:status',
      'status',
      'address',
      'category',
      'attachments',
      'coupons',
      'collaborators',
    ];

    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    sortBy.forEach((field: string, index: number) => {
      const order = sortDesc[index] ? 'desc' : 'asc';
      params.append('orderBy[]', `${field}:${order}`);
    });

    if (search) {
      params.append('search[name][o]', '_LIKE_');
      params.append('search[name][v]', encodeURIComponent(String(search)));
    }

    preloads.forEach((preload) => params.append('preloads[]', preload));

    return await $axios
      .$get(`events?${params.toString()}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.setLoading(false);
        this.context.commit('SET_EVENT_LIST', response.body.result.data);
        return response;
      })
      .catch(() => {
        this.setLoading(false);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getById(eventId: string) {
    this.setLoading(true);

    const preloads = [
      'rating',
      'tickets:status',
      'status',
      'address',
      'category',
      'attachments',
      'collaborators',
      'coupons',
    ];

    return await $axios
      .$get(
        `events?where[id][v]=${eventId}&${preloads
          .map((preload) => `preloads[]=${preload}`)
          .join('&')}`
      )
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.setLoading(false);

        this.context.commit('SET_EVENT', response.body.result.data[0]);
        return response;
      })
      .catch(() => {
        this.setLoading(false);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async validateAlias(alias: string) {
    this.setLoadingAlias(true);

    return await $axios
      .$get(`event/validate-alias/${alias}`)
      .then((response) => {
        if (response.body && response.body.code !== 'VALIDATE_SUCCESS')
          throw new Error(response);

        this.setLoadingAlias(false);

        return response.body.result;
      })
      .catch(() => {
        this.setLoadingAlias(false);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async postEvent(eventPayload) {
    try {
      this.setSaving(true);

      // Validação inicial dos dados
      await validateEventData(eventPayload);

      this.setProgressTitle('Salvando endereço');
      // Cria endereço e evento em paralelo
      const [addressId, draftStatus] = await Promise.all([
        eventPayload.event_type !== 'Online' ? createAddress(eventPayload) : null,
        getStatusByModuleName('event', 'Rascunho'),
      ]);

      this.setProgressTitle('Criando evento');
      // Cria o evento
      const eventId = await createEvent({
        ...eventPayload,
        addressId,
        statusId: draftStatus.id,
      });

      this.setProgressTitle('Processando Ingressos e Cupons');
      // Processa banner, tickets e cupons em paralelo
      const [, ticketMap, fieldTicketMap, couponTicketMap] = await Promise.all([
        handleEventBanner(eventId, eventPayload.banner),

        eventPayload.tickets?.length > 0
          ? createTicketsAndCategories(eventId, eventPayload.tickets)
          : {},

        eventPayload.customFields?.length > 0 && eventPayload.tickets?.length > 0
          ? createCustomFields(eventId, eventPayload.customFields)
          : {},

        eventPayload.coupons?.length > 0
          ? handleCoupons(eventId, eventPayload.coupons)
          : {},
      ]);

      // Cria relações em paralelo se necessário
      if (Object.keys(ticketMap).length > 0) {
        this.setProgressTitle('Finalizando configurações');
        const relationPromises = [];

        if (Object.keys(fieldTicketMap).length > 0) {
          relationPromises.push(
            createEventCheckoutFieldTicketRelations(fieldTicketMap, ticketMap)
          );
        }

        if (Object.keys(couponTicketMap).length > 0) {
          relationPromises.push(createCouponTicketRelations(couponTicketMap, ticketMap));
        }

        if (relationPromises.length > 0) {
          await Promise.all(relationPromises);
        }
      }

      this.setSaving(false);
      return { success: true, eventId };
    } catch (error) {
      this.setSaving(false);
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  @Action
  public async fetchEventStatuses(payload) {
    try {
      const { status } = payload;

      const response = await $axios.$get(
        `statuses?where[name][v]=${status}&where[module][v]=event`,
        payload
      );

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error('Falha ao buscar lista de status de eventos.');
      }

      return { success: true, data: response.body.result.data[0] };
    } catch (error) {
      console.error('Error fetching event statuses:', error);
      throw error;
    }
  }

  @Action
  public async updateEvent(payload) {
    try {
      const response = await $axios.$patch('event', payload);

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar o evento.');
      }
      return { success: true, data: response.body.result };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  @Action
  public async deleteEvent(payload) {
    try {
      const { eventId } = payload;

      const response = await $axios.$delete(`event/${eventId}`);

      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao atualizar o evento.');
      }

      return { success: true, data: response.body.result };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  @Action
  public reset() {
    this.context.commit('RESET');
  }
}
