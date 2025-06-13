import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload } from '~/models';

interface RatingState {
  ratingList: any[];
  isLoading: boolean;
}

export const state = (): RatingState => ({
  ratingList: [],
  isLoading: false,
});

export const getters = {
  $ratingList: (state: RatingState) => state.ratingList,
  $isLoading: (state: RatingState) => state.isLoading,
};

export const mutations = {
  SET_RATING_LIST(state: RatingState, data: any) {
    state.ratingList = data;
  },

  SET_IS_LOADING(state: RatingState, value: boolean) {
    state.isLoading = value;
  },
};

export const actions = {
  setLoading({ commit }: any, value: boolean) {
    commit('SET_IS_LOADING', value);
  },

  async fetchRatings({ commit, dispatch }: any, {
    page = 1,
    limit = 12,
    search,
    sortBy,
    sortDesc,
  }: SearchPayload) {
    dispatch('setLoading', true);

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

        dispatch('setLoading', false);
        commit('SET_RATING_LIST', response.body.result.data);
        return response;
      })
      .catch(() => {
        dispatch('setLoading', false);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  },
};
