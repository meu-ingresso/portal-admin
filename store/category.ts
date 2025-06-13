import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload } from '~/models';

function buildSearchParams({
  page,
  limit,
  search,
  sortBy,
  sortDesc,
}: SearchPayload): URLSearchParams {
  const params = new URLSearchParams();

  params.append('page', page.toString());
  params.append('limit', limit.toString());

  sortBy.forEach((field: string, index: number) => {
    const order = sortDesc[index] ? 'desc' : 'asc';
    params.append('orderBy[]', `${field}:${order}`);
  });

  if (search) {
    params.append('search[name][o]', '_LIKE_');
    params.append('search[name][v]', encodeURIComponent(String(search)));
  }

  return params;
}

interface CategoryState {
  categoryList: any[];
  isLoading: boolean;
}

export const state = (): CategoryState => ({
  categoryList: [],
  isLoading: false,
});

export const getters = {
  $categoryList: (state: CategoryState) => state.categoryList,
  $isLoading: (state: CategoryState) => state.isLoading,
};

export const mutations = {
  SET_CATEGORY_LIST(state: CategoryState, data: any) {
    state.categoryList = data;
  },

  SET_IS_LOADING(state: CategoryState, value: boolean) {
    state.isLoading = value;
  },
};

export const actions = {
  setLoading({ commit }: any, value: boolean) {
    commit('SET_IS_LOADING', value);
  },

  async fetchCategories({ commit, dispatch }: any, {
    page = 1,
    limit = 12,
    search,
    sortBy,
    sortDesc,
  }: SearchPayload) {
    dispatch('setLoading', true);

    const params = buildSearchParams({ page, limit, search, sortBy, sortDesc });

    const response = await $axios.$get(`categories?${params.toString()}`);

    if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
      throw new Error('Invalid response format');
    }

    commit('SET_CATEGORY_LIST', response.body.result.data);
    return response;
  },
};
