/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

@Module({
  name: 'filter',
  stateFactory: true,
  namespaced: true,
})
export default class Filter extends VuexModule {
  private filters: any = {
    bob: [
      {
        text: 'Vendedor',
        selected: [],
        items: [],
      },
      {
        text: 'Cliente',
        selected: [],
        items: [],
      },
      {
        text: 'Pricing',
        selected: [],
        items: [],
      },
      {
        text: 'Origem',
        selected: [],
        items: [],
      },
      {
        text: 'Destino',
        selected: [],
        items: [],
      },
      {
        text: 'Produto',
        selected: [],
        items: [],
      },
      {
        text: 'Target Batido',
        selected: [],
        items: [],
      },
    ],
  };

  public get $filters() {
    return this.filters;
  }

  @Mutation
  private MOUNT_FILTERS(filters) {
    this.filters[filters.type] = filters.items;
  }

  @Action
  public mountFilters(filters) {
    this.context.commit('MOUNT_FILTERS', filters);
  }

  @Action
  public reset() {
    this.context.commit('RESET');
  }
}
