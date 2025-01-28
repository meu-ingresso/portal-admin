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
import OpenAI from '~/store/openAI';
import GeneralInfo from '@/store/event/modules/generalInfo';
import Tickets from '@/store/event/modules/tickets';
import CustomFields from '@/store/event/modules/customFields';
import Coupons from '@/store/event/modules/coupons';

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
let generalInfo: GeneralInfo;
let tickets: Tickets;
let customFields: CustomFields;
let coupons: Coupons;

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
  generalInfo = getModule(GeneralInfo, store);
  tickets = getModule(Tickets, store);
  customFields = getModule(CustomFields, store);
  coupons = getModule(Coupons, store);
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
  generalInfo,
  tickets,
  customFields,
  coupons,
};
