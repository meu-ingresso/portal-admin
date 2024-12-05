/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { $axios } from '@/utils/nuxt-instance';

import { trimPayloadStrings } from '@/utils/formatters';

interface CreatePayload {
  seller_id: String;
  customer: String;
  modal_id: String;
  trade: String;
  origin: String;
  destiny: String;
  volume: Number;
  product: String;
  container_id: String;
  seller_target?: Number;
  seller_freetime_origin: Number;
  seller_freetime_destiny: Number;
  seller_note: String;
  is_active: Boolean;
}

interface UpdatePayload {
  customer?: String;
  modal_id?: String;
  trade?: String;
  origin?: String;
  destiny?: String;
  volume?: Number;
  product?: String;
  container_id?: String;
  seller_target?: Number;
  seller_freetime_origin?: Number;
  seller_freetime_destiny?: Number;
  seller_note?: String;
  shipowner_id: String;
  freight: Number;
  ens_bl?: Number;
  pricing_target: String;
  pricing_freetime_origin: Number;
  pricing_freetime_destiny: Number;
  pricing_note: String;
  user_id: String;
  is_active: Boolean;
}

@Module({ name: 'bob', stateFactory: true, namespaced: true })
export default class Bob extends VuexModule {
  private bob: any = {
    id: '',
    seller_id: '',
    customer: '',
    modal_id: '',
    trade: '',
    origin: '',
    destiny: '',
    volume: undefined,
    product: '',
    container_id: '',
    seller_target: undefined,
    seller_freetime_origin: undefined,
    seller_freetime_destiny: undefined,
    seller_note: '',
    shipowner_id: '',
    freight: undefined,
    ens_bl: undefined,
    pricing_target: '',
    pricing_freetime_origin: undefined,
    pricing_freetime_destiny: undefined,
    pricing_note: '',
    user_id: '',
    is_active: true,
  };

  private copyBob: any = {
    id: '',
    seller_id: '',
    customer: '',
    modal_id: '',
    trade: '',
    origin: '',
    destiny: '',
    volume: undefined,
    product: '',
    container_id: '',
    seller_target: undefined,
    seller_freetime_origin: undefined,
    seller_freetime_destiny: undefined,
    seller_note: '',
    shipowner_id: '',
    freight: undefined,
    ens_bl: undefined,
    pricing_target: '',
    pricing_freetime_origin: undefined,
    pricing_freetime_destiny: undefined,
    pricing_note: '',
    user_id: '',
    is_active: true,
  };

  private bobList = [];
  private bobCustomerList = [];
  private bobSellerList = [];
  private bobPricerList = [];
  private bobOriginList = [];
  private bobDestinyList = [];
  private bobProductList = [];

  public get $bob() {
    return this.bob;
  }

  public get $bobList() {
    return this.bobList;
  }

  public get $bobCustomerList() {
    return this.bobCustomerList;
  }

  public get $bobSellerList() {
    return this.bobSellerList;
  }

  public get $bobPricerList() {
    return this.bobPricerList;
  }

  public get $bobOriginList() {
    return this.bobOriginList;
  }

  public get $bobDestinyList() {
    return this.bobDestinyList;
  }

  public get $bobProductList() {
    return this.bobProductList;
  }

  @Mutation
  private SET_BOB(payload: any) {
    this.bob = payload;
    this.copyBob = { ...this.bob };
  }

  @Mutation
  private SET_BOB_LIST(data: any) {
    this.bobList = data;
  }

  @Mutation
  private SET_CUSTOMER_LIST(data: any) {
    this.bobCustomerList = data;
  }

  @Mutation
  private SET_SELLER_LIST(data: any) {
    this.bobSellerList = data;
  }

  @Mutation
  private SET_PRICER_LIST(data: any) {
    this.bobPricerList = data;
  }

  @Mutation
  private SET_ORIGIN_LIST(data: any) {
    this.bobOriginList = data;
  }

  @Mutation
  private SET_DESTINY_LIST(data: any) {
    this.bobDestinyList = data;
  }

  @Mutation
  private SET_PRODUCT_LIST(data: any) {
    this.bobProductList = data;
  }

  @Mutation
  private RESET() {
    this.bob = {
      id: '',
      seller_id: '',
      customer: '',
      modal_id: '',
      trade: '',
      origin: '',
      destiny: '',
      volume: undefined,
      product: '',
      container_id: '',
      seller_target: undefined,
      seller_freetime_origin: undefined,
      seller_freetime_destiny: undefined,
      seller_note: '',
      shipowner_id: '',
      freight: undefined,
      ens_bl: undefined,
      pricing_target: '',
      pricing_freetime_origin: undefined,
      pricing_freetime_destiny: undefined,
      pricing_note: '',
      user_id: '',
      is_active: true,
    };
    this.copyBob = { ...this.bob };
  }

  @Action
  public async create(payload: CreatePayload) {
    const trimmedPayload = trimPayloadStrings(payload);

    return await $axios
      .$post('bob', trimmedPayload)
      .then((response) => {
        if (response.body && response.body.code !== 'CREATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public async update(payload: UpdatePayload) {
    return await $axios
      .$patch('bob', payload)
      .then((response) => {
        if (response.body && response.body.code !== 'UPDATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public async get(bob_id: string) {
    return await $axios
      .$get(
        `bobs?where[id][v]=${bob_id}&preloads[]=seller&preloads[]=user&preloads[]=container&preloads[]=modal&preloads[]=shipowner`
      )
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_BOB', response.body.result.data[0]);

        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getActiveBobs({ page, limit, monthWhere, yearWhere, sortBy, sortDesc }) {
    let filter = '';
    let orderAux = '';

    filter += page ? `page=${page}&` : '';
    filter += limit ? `limit=${limit}&` : '';

    for (let i = 0; i < sortBy.length; i++) {
      const sortDescAux = sortDesc[i] ? 'desc' : 'asc';
      orderAux += `&orderBy[]=${sortBy[i]}:${sortDescAux}`;
    }

    const status = await $axios
      .$get(
        `bobs?where[year_effective][v]=${yearWhere}&where[month_effective][v]=${monthWhere}&${filter}preloads[]=seller&preloads[]=user&preloads[]=container&preloads[]=modal&preloads[]=shipowner${orderAux}`
      )
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_BOB_LIST', response.body.result.data);

        return {
          data: response.body.result.data,
          code: response.body.code,
          total: response.body.result.meta.total,
        };
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'SEARCH_NOTFOUND',
          total: 0,
        };
      });
    return status;
  }

  @Action
  public async filterCustomers() {
    return await $axios
      .$get(`filter/customers`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_CUSTOMER_LIST', response.body.result);

        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async filterSellers() {
    return await $axios
      .$get(`filter/sellers`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_SELLER_LIST', response.body.result);

        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async filterPricers() {
    return await $axios
      .$get(`filter/pricers`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_PRICER_LIST', response.body.result);

        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async filterOrigins() {
    return await $axios
      .$get(`filter/origins`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_ORIGIN_LIST', response.body.result);

        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async filterDestinies() {
    return await $axios
      .$get(`filter/destinies`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_DESTINY_LIST', response.body.result);

        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async filterProducts() {
    return await $axios
      .$get(`filter/products`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_PRODUCT_LIST', response.body.result);

        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public reset() {
    this.context.commit('RESET');
  }
}
