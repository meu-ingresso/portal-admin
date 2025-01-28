export type EventType = 'Presencial' | 'Online' | 'Híbrido';

export interface CategoryOption {
  text: string;
  value: string;
}

export interface RatingOption {
  text: string;
  value: string;
  icon?: string;
}

export interface AvailabilityOption {
  text: string;
  value: string;
}

export interface FieldType {
  text: string;
  value: 'TEXTO' | 'number' | 'date' | 'EMAIL' | 'phone' | 'autocomplete' | 'multiselect';
}

export interface FieldOption {
  text: string;
  value: 'required' | 'is_unique' | 'visible_on_ticket';
}

export interface PersonType {
  text: string;
  value: 'PF' | 'PJ' | 'ESTRANGEIRO';
}

export interface DiscountType {
  text: string;
  value: 'FIXED' | 'PERCENTAGE';
}

export interface CustomField {
  id?: string;
  name: string;
  type: FieldType;
  description?: string;
  is_default?: boolean;
  options: FieldOption[];
  selected_options: string[];
  person_types: PersonType[];
  tickets: string[];
  order?: number;
  help_text?: string;
}

export interface Ticket {
  id?: string;
  name: string;
  description?: string;
  price: number;
  service_fee?: number;
  max_quantity: number;
  min_purchase: number;
  max_purchase: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  visible: boolean;
  category?: string;
  availability: AvailabilityOption;
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
  tickets: string[];
}

export interface EventAddress {
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
  banner?: File;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  address?: EventAddress;
  link_online?: string;
  sale_type: string;
  availability: 'Publico' | 'Privado';
  is_featured: boolean;
  absorb_service_fee: boolean;
  promoter_id?: string;
  tickets: Ticket[];
  custom_fields: CustomField[];
  coupons: Coupon[];
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

export interface CreateEventPayload extends Omit<Event, 'id'> { }

export interface UpdateEventPayload extends Partial<Event> {
  id: string;
}

export interface EventResponse {
  success: boolean;
  data?: Event;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
