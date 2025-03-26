import { AddressPayload } from "../address";

export interface PeoplePayload {
  id?: string;
  person_type?: 'PF' | 'PJ';
  first_name?: string;
  last_name?: string;
  tax?: string;
  social_name?: string;
  fantasy_name?: string;
  address_id?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}


export interface PeopleWithRelations extends PeoplePayload {
  address: AddressPayload;
}
