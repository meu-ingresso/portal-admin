export interface PostAddressPayload {
  street: string;
  zipcode: string;
  number: string;
  complement?: string;
  neighborhood: string;
  latitude?: number | null;
  longitude?: number | null;
  city: string;
  state: string;
}