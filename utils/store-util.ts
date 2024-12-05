/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';

import Auth from '@/store/auth';
import Toast from '@/store/toast';
import Filter from '@/store/filter';
import Loading from '@/store/loading';
import User from '@/store/user';
import Bob from '@/store/bob';
import Modal from '@/store/modal';
import Container from '@/store/container';
import Shipowner from '@/store/shipowner';
import HeadSoft from '@/store/headSoft';
import Role from '@/store/role';
import Permission from '@/store/permission';
import RolePermission from '@/store/rolePermission';
import Tariff from '@/store/tariff';

let auth: Auth;
let toast: Toast;
let filter: Filter;
let loading: Loading;
let user: User;
let bob: Bob;
let modal: Modal;
let container: Container;
let shipowner: Shipowner;
let headSoft: HeadSoft;
let role: Role;
let permission: Permission;
let rolePermission: RolePermission;
let tariff: Tariff;

const initializeStores = (store: Store<any>) => {
  auth = getModule(Auth, store);
  toast = getModule(Toast, store);
  filter = getModule(Filter, store);
  loading = getModule(Loading, store);
  user = getModule(User, store);
  bob = getModule(Bob, store);
  modal = getModule(Modal, store);
  container = getModule(Container, store);
  shipowner = getModule(Shipowner, store);
  headSoft = getModule(HeadSoft, store);
  role = getModule(Role, store);
  permission = getModule(Permission, store);
  rolePermission = getModule(RolePermission, store);
  tariff = getModule(Tariff, store);
};

export {
  initializeStores,
  auth,
  toast,
  filter,
  loading,
  user,
  bob,
  modal,
  container,
  shipowner,
  headSoft,
  role,
  permission,
  rolePermission,
  tariff,
};
