/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { $axios } from '@/utils/nuxt-instance';

@Module({ name: 'tariff', stateFactory: true, namespaced: true })
export default class User extends VuexModule {
  private tariff: any = {
    destiny: null,
    shipowner: null,

    rateDestiny: null,
  };

  private tariffList = [];
  private tariffRateList = [];
  private tariffChildRateList = [];
  private tariffsDestinyList = [];
  private tariffNumbersList = [];
  private tariffCurrencyList = [];

  public get $tariff() {
    return this.tariff;
  }

  public get $tariffList() {
    return this.tariffList;
  }

  public get $tariffRateList() {
    return this.tariffRateList;
  }

  public get $tariffChildRateList() {
    return this.tariffChildRateList;
  }

  public get $tariffsDestinyList() {
    return this.tariffsDestinyList;
  }

  public get $tariffNumbersList() {
    return this.tariffNumbersList;
  }

  public get $tariffCurrencyList() {
    return this.tariffCurrencyList;
  }

  @Mutation
  private SET_TARIFF(payload: any) {
    this.tariff = payload;
  }

  @Mutation
  private SET_TARIFF_LIST(data: any) {
    this.tariffList = data;
  }

  @Mutation
  private SET_TARIFF_RATES_LIST(data: any) {
    this.tariffRateList = data;
  }

  @Mutation
  private SET_TARIFF_RATES_CHILD_LIST(data: any) {
    this.tariffChildRateList = data;
  }

  @Mutation
  private SET_TARIFFS_DESTINY(data: any) {
    this.tariffsDestinyList = data.map((item) => {
      return {
        value: item.IdOrigem_Destino,
        text: item.Nome,
      };
    });
  }

  @Mutation
  private SET_TARIFF_NUMBERS(data: any) {
    this.tariffNumbersList = data.map((item) => {
      return {
        value: item.IdTarifario_Origem_Destino,
        text: item.Numero,
      };
    });
  }

  @Mutation
  private SET_TARIFF_CURRENCIES(data: any) {
    this.tariffCurrencyList = data.map((item) => {
      return {
        value: item.IdMoeda,
        text: item.Nome,
      };
    });
  }

  @Mutation
  private RESET() {
    this.tariff = {};
    this.tariffList = [];
    this.tariffRateList = [];
    this.tariffChildRateList = [];
    this.tariffsDestinyList = [];
  }

  @Mutation
  private RESET_CHILD_RATE_LIST() {
    this.tariffChildRateList = [];
  }

  @Action
  public async getTariffsDestiny() {
    return await $axios
      .$get(`tariffs/destiny`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_TARIFFS_DESTINY', response.body.result);

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
  public async getTariffNumbers() {
    return await $axios
      .$get(`tariff/numbers`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_TARIFF_NUMBERS', response.body.result);

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
  public async getCurrencies() {
    return await $axios
      .$get(`tariff/currencies`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_TARIFF_CURRENCIES', response.body.result);

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
  public async getTariffs() {
    const destiny = this.tariff.destiny;
    const shipowner = this.tariff.shipowner || 0;

    return await $axios
      .$get(`tariffs/${destiny}/${shipowner}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.context.commit('SET_TARIFF_LIST', response.body.result);

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
  public async getTariffsByNumber(payload) {
    return await $axios
      .$post(`tariffs`, payload)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

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
  public async getTariffRates(data): Promise<any> {
    try {
      const response = await $axios.$post(`tariff/rates`, data.payload);

      if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
        throw new Error(`Search failed -> ${response}`);
      }

      if (data.mode === 'RATE_PARENT') {
        const formattedResult = response.body.result.map((item, idx) => ({
          ...item,
          class: idx % 2 === 0 ? '' : 'bg-gray',
          checked: false,
        }));

        this.context.commit('SET_TARIFF_RATES_LIST', formattedResult);
      } else {
        const formattedResult = response.body.result.map((item) => {
          return {
            ...item,
            DataForHeader: JSON.parse(item.DataForHeader),
          };
        });

        this.context.commit('SET_TARIFF_RATES_CHILD_LIST', formattedResult);
      }

      return response;
    } catch (error) {
      return {
        data: 'Error',
        code: 'FIND_NOTFOUND',
        total: 0,
      };
    }
  }

  @Action
  public async createTariffRates(payload): Promise<any> {
    try {
      const response = await $axios.$post(`unify/tariff/rate`, payload);

      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error(`create failed -> ${response}`);
      }

      return response;
    } catch (error) {
      console.error('Erro ao criar tarifário -> ', error);
      return error;
    }
  }

  @Action
  public reset() {
    this.context.commit('RESET');
  }

  @Action
  public resetChildRateList() {
    this.context.commit('RESET_CHILD_RATE_LIST');
  }
}
