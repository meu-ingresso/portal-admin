/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';

import Auth from '@/store/auth';
import Toast from '@/store/toast';
import Filter from '@/store/filter';
import Loading from '@/store/loading';
import User from '@/store/user';
import Event from '@/store/event';
import Category from '@/store/category';
import Rating from '@/store/rating';
import Cep from '@/store/cep';
import EventForm from '@/store/eventForm';
import Status from '@/store/status';
import OpenAI from '@/store/openAI';
import EventGeneralInfo from '@/store/eventGeneralInfo';
import EventTickets from '@/store/eventTickets';
import EventCustomFields from '@/store/eventCustomFields';
import EventCoupons from '@/store/eventCoupons';
import EventPrincipal from '@/store/eventPrincipal';
import EventGuests from '@/store/eventGuests';
import EventCustomerTickets from '@/store/eventCustomerTickets';
import EventPdv from '@/store/eventPdv';
import Payment from '@/store/payment';
import EventCollaborators from '@/store/eventCollaborators';
import EventCheckout from '@/store/eventCheckout';
import UserDocuments from '@/store/userDocuments';
import UserAddress from '@/store/userAddress';
import Address from '@/store/address';
import Permissions from '@/store/permissions';

let auth: Auth;
let toast: Toast;
let filter: Filter;
let loading: Loading;
let user: User;
let event: Event;
let category: Category;
let rating: Rating;
let cep: Cep;
let eventForm: EventForm;
let status: Status;
let openAI: OpenAI;
let eventGeneralInfo: EventGeneralInfo;
let eventTickets: EventTickets;
let eventCustomFields: EventCustomFields;
let eventCoupons: EventCoupons;
let eventPrincipal: EventPrincipal;
let eventGuests: EventGuests;
let eventCustomerTickets: EventCustomerTickets;
let eventPdv: EventPdv;
let payment: Payment;
let eventCollaborators: EventCollaborators;
let eventCheckout: EventCheckout;
let userDocuments: UserDocuments;
let userAddress: UserAddress;
let address: Address;
let permissions: Permissions;

const initializeStores = (store: Store<any>) => {
  auth = getModule(Auth, store);
  toast = getModule(Toast, store);
  filter = getModule(Filter, store);
  loading = getModule(Loading, store);
  user = getModule(User, store);
  event = getModule(Event, store);
  category = getModule(Category, store);
  rating = getModule(Rating, store);
  cep = getModule(Cep, store);
  eventForm = getModule(EventForm, store);
  status = getModule(Status, store);
  openAI = getModule(OpenAI, store);
  eventGeneralInfo = getModule(EventGeneralInfo, store);
  eventTickets = getModule(EventTickets, store);
  eventCustomFields = getModule(EventCustomFields, store);
  eventCoupons = getModule(EventCoupons, store);
  eventPrincipal = getModule(EventPrincipal, store);
  eventGuests = getModule(EventGuests, store);
  eventCustomerTickets = getModule(EventCustomerTickets, store);
  eventPdv = getModule(EventPdv, store);
  payment = getModule(Payment, store);
  eventCollaborators = getModule(EventCollaborators, store);
  eventCheckout = getModule(EventCheckout, store);
  userDocuments = getModule(UserDocuments, store);
  userAddress = getModule(UserAddress, store);
  address = getModule(Address, store);
  permissions = getModule(Permissions, store);
};

export {
  initializeStores,
  auth,
  toast,
  filter,
  loading,
  user,
  event,
  category,
  rating,
  cep,
  eventForm,
  status,
  openAI,
  eventGeneralInfo,
  eventTickets,
  eventCustomFields,
  eventCoupons,
  eventPrincipal,
  eventGuests,
  eventCustomerTickets,
  eventPdv,
  payment,
  eventCollaborators,
  eventCheckout,
  userDocuments,
  userAddress,
  address,
  permissions,
};
