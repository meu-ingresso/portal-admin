import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload } from '~/models';

@Module({
  name: 'rating',
  stateFactory: true,
  namespaced: true,
})
export default class Rating extends VuexModule {
  private ratingList = [];
  private isLoading: boolean = false;

  public get $ratingList() {
    return this.ratingList;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  @Mutation
  private SET_RATING_LIST(data: any) {
    this.ratingList = data;
  }

  @Mutation
  private SET_IS_LOADING(value: boolean) {
    this.isLoading = value;
  }

  @Action
  public setLoading(value: boolean) {
    this.context.commit('SET_IS_LOADING', value);
  }

  @Action
  public async fetchRatings({
    page = 1,
    limit = 12,
    search,
    sortBy,
    sortDesc,
  }: SearchPayload) {
    this.setLoading(true);

    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (sortBy) {
      sortBy.forEach((field: string, index: number) => {
        const order = sortDesc[index] ? 'desc' : 'asc';
        params.append('orderBy[]', `${field}:${order}`);
      });
    }

    if (search) {
      params.append('search[name][o]', '_LIKE_');
      params.append('search[name][v]', encodeURIComponent(String(search)));
    }

    return await $axios
      .$get(`ratings?${params.toString()}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS')
          throw new Error(response);

        this.setLoading(false);
        this.context.commit('SET_RATING_LIST', response.body.result.data);
        return response;
      })
      .catch(() => {
        this.setLoading(false);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }
}
