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
import OpenAi from '@/store/openAi';
import Address from '@/store/address';

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
let openAi: OpenAi;
let address: Address;

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
  openAi = getModule(OpenAi, store);
  address = getModule(Address, store);
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
  openAi,
  address,
};
