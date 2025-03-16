
export interface BatchOperations {
  fieldsToCreate?: any[];
  fieldsToUpdate?: any[];
  fieldsToDelete?: string[];
  optionsToCreate?: any[];
  optionsToUpdate?: any[];
  optionsToDelete?: string[];
  ticketRelationsToCreate?: any[];
  ticketRelationsToDelete?: string[];
  couponsToCreate?: any[];
  couponsToUpdate?: any[];
  couponsToDelete?: string[];
  
}
export interface ResultMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
}

export type EventType = 'Presencial' | 'Online' | 'Híbrido';

export interface CategoryOption {
  text: string;
  value: string;
  id?: string | null;
  _deleted?: boolean;
}

export interface RatingOption {
  text: string;
  value: string;
  img?: string;
}

export interface FieldSelectedOption {
  id: string;
  name: string;
}

export interface FieldTicketRelation {
  id: string;
  event_checkout_field_id: string;
  ticket_id: string;
}

export interface CustomFieldTicket {
  id: string;
  name: string;
  _deleted?: boolean;
}

export interface CouponTicket {
  id: string;
  name: string;
  _deleted?: boolean;
}

export type AvailabilityOption = 'Publico' | 'Privado' | 'Página';

export type FieldType =
  | 'CPF'
  | 'CNPJ'
  | 'TELEFONE'
  | 'DATA'
  | 'TEXTO'
  | 'PARAGRAPH'
  | 'EMAIL'
  | 'MENU_DROPDOWN'
  | 'MULTI_CHECKBOX'
  | 'TERMO';

export type FieldOption = 'required' | 'is_unique' | 'visible_on_ticket';

export type PersonType = 'PF' | 'PJ' | 'ESTRANGEIRO';

export type DiscountType = 'FIXED' | 'PERCENTAGE';

export interface GuestListMemberValidated {
  id: string;
  guest_list_member_id: string;
  validated_by: string;
  quantity: number;
  created_at: string;
}

export interface EventGuestListMember {
  id: string;
  guest_list_id: string;
  first_name: string;
  last_name: string;
  quantity: number;
  added_by: string;
  validated: boolean;
  validated_by: string;
  validated_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  guestListMemberValidated?: GuestListMemberValidated[];
}

export interface EventGuestList {
  id: string;
  event_id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  members?: EventGuestListMember[];
}

export interface Status {
  id: string;
  name: string;
  module: string;
  description: string;
  deleted_at?: string;
}

export interface CustomField {
  id?: string;
  name: string;
  type: FieldType;
  description?: string;
  is_default?: boolean;
  options: FieldOption[];
  selected_options: FieldSelectedOption[];
  person_types: PersonType[];
  tickets: CustomFieldTicket[];
  display_order?: number;
  help_text?: string;
  terms_content?: string;
  field_ids?: Record<PersonType, string>;
  _deleted?: boolean;
}

export interface Ticket {
  id?: string;
  event_id?: string;
  name: string;
  description?: string;
  price: string;
  service_fee?: number;
  total_quantity: number;
  total_sold: number;
  min_purchase: number;
  max_purchase: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  visible: boolean;
  category?: CategoryOption;
  display_order?: number;
  availability: AvailabilityOption;
  _deleted?: boolean;
  status: Status;
}

export interface Coupon {
  id?: string;
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  max_uses: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  tickets: CouponTicket[];
  _deleted?: boolean;
}

export interface EventAddress {
  id?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  deleted_at?: string;
}

export interface EventAttachment {
  id?: string;
  event_id: string;
  name: string;
  type: string;
  url: string;
  deleted_at?: string;
}

export interface Collaborator {
  id: string;
  event_id: string;
  user_id: string;
  role_id: string;
  deleted_at?: string;
}

export interface EventTotalizer {
  totalSales: string;
  totalSalesToday: string;
  totalSalesAmount: string;
  totalSalesAmountToday: string;
  totalViews: string;
}


export interface GroupEvent {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface EventDate {
  id?: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
}

export interface Event {
  id?: string;
  name: string;
  alias: string;
  description: string;
  general_information: string;
  category: CategoryOption;
  event_type: EventType | null;
  rating: RatingOption | null;
  banner?: File | string;
  backup_banner?: File | string;
  banner_id?: string;
  link_online?: string;
  link_online_id?: string;
  address?: EventAddress;
  sale_type: string;
  availability: 'Publico' | 'Privado';
  is_featured: boolean;
  absorb_service_fee: boolean;
  promoter_id?: string;
  tickets: Ticket[];
  custom_fields: CustomField[];
  coupons: Coupon[];
  attachments: EventAttachment[];
  deleted_at?: string;
  collaborators: Collaborator[];
  totalizers: EventTotalizer;
  status: Status;
  fees: {
    id: string;
    platform_fee: number;
  };
  groups: GroupEvent[];
  event_dates: EventDate[];
  group_id?: string;
}

export interface EventFormState {
  general_info: Omit<Event, 'tickets' | 'custom_fields' | 'coupons'>;
  tickets: Ticket[];
  custom_fields: CustomField[];
  coupons: Coupon[];
  current_step: number;
  is_loading: boolean;
  errors: Record<string, string[]>;
}

export interface CreateEventPayload extends Omit<Event, 'id'> {}

export interface UpdateEventPayload extends Partial<Event> {
  id: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CustomFieldApiResponse {
  id: string;
  event_id: string;
  name: string;
  type: FieldType;
  person_type: PersonType;
  required: boolean;
  is_unique: boolean;
  visible_on_ticket: boolean;
  help_text: string | null;
  display_order: number;
  deleted_at: string | null;
}

export interface CustomFieldOptionApiResponse {
  id: string;
  event_checkout_field_id: string;
  name: string;
  eventCheckoutField?: CustomFieldApiResponse;
}

export interface EventApiResponse {
  id: string;
  name: string;
  alias: string;
  description: string;
  general_information: string;
  groups: GroupEvent[];
  status_id: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
}

export interface TicketApiResponse {
  id: string;
  event_id: string;
  name: string;
  ticket_event_category_id: string;
  description: string;
  price: string;
  total_quantity: number;
  total_sold: number;
  status_id: number;
  start_date: string;
  end_date: string;
  availability: string;
  display_order: number;
  min_quantity_per_user: number;
  max_quantity_per_user: number;
  deleted_at?: string;
  event?: EventApiResponse;
}

export interface StatusApiResponse {
  id: string;
  name: string;
  module: string;
  description: string;
  deleted_at?: string;
}

export interface PeopleApiResponse {
  id: string;
  first_name: string;
  last_name: string;
  person_type: PersonType;
  tax: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface RoleApiResponse {
  id: string;
  name: string;
  description: string;
}

export interface UserApiResponse {
  id: string;
  people_id: string;
  email: string;
  alias: string;
  role_id: string;
  account_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  people?: PeopleApiResponse;
  role?: RoleApiResponse;
}

export interface PDVUserApiResponse {
  id: string;
  user_id: string;
  pdv_id: string;
  user?: UserApiResponse;
}

export interface PDVTicketApiResponse {
  id: string;
  ticket_id: string;
  pdv_id: string;
  ticket?: TicketApiResponse;
}
export interface PDVApiResponse {
  id?: string;
  event_id: string;
  name: string;
  status_id: string;
  status?: StatusApiResponse;
  created_at?: string;
  updated_at?: string;
  users?: PDVUserApiResponse[];
  tickets?: PDVTicketApiResponse[];
}


export interface PaymentApiResponse {
  id: string;
  status_id: string;
  user_id: string;
  net_value: string;
  gross_value: string;
  coupon_id: string;
  created_at: string;
  updated_at: string;
  paid_at: string;
  payment_method: string;
  status?: StatusApiResponse;
  user?: UserApiResponse;
}

export interface CustomerTicketApiResponse {
  id: string;
  ticket_id: string;
  current_owner_id: string;
  previous_owner_id: string;
  status_id: string;
  payment_id: string;
  ticket_identifier: string;
  validated: boolean;
  validated_by: string;
  validated_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  ticket?: TicketApiResponse;
  payment?: PaymentApiResponse;
  validatedBy?: UserApiResponse;
}

export interface CategoryApiResponse {
  id: string;
  name: string;
  deleted_at: string | null;
}

export interface CustomFieldTicketApiResponse {
  id: string;
  event_checkout_field_id: string;
  ticket_id: string;
  ticket?: TicketApiResponse;
  eventCheckoutField?: CustomFieldApiResponse;
}

export interface TicketFieldApiResponse {
  id: string;
  customer_ticket_id: string;
  field_id: string;
  value: string;
  customerTicket?: CustomerTicketApiResponse;
  checkoutField?: CustomFieldApiResponse;
}

export interface CouponApiResponse {
  id: string;
  event_id: string;
  status_id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  max_uses: number;
  uses: number;
  start_date: string;
  end_date: string;
}
export interface CouponTicketApiResponse {
  id: string;
  coupon_id: string;
  ticket_id: string;
  ticket: TicketApiResponse;
  deleted_at?: string;
}

export interface EventCollaboratorApiResponse {
  id: string;
  event_id: string;
  user_id: string;
  role_id: string;
  event?: EventApiResponse;
  user?: UserApiResponse;
}

export interface FieldPayload {
  id?: string;
  event_id: string;
  name: string;
  type: string;
  person_type: PersonType;
  required: boolean;
  visible_on_ticket: boolean;
  is_unique: boolean;
  help_text: string;
  display_order: number;
}

export interface CouponPayload {
  event_id: string;
  status_id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number;
  start_date: string;
  end_date: string;
}

export interface CreateCustomerTicketPayload {
  ticket_id: string;
  current_owner_id: string;
  payment_id: string;
  status_id: string;
}
