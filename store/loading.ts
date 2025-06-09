interface LoadingState {
  isLoading: boolean;
}

export const state = (): LoadingState => ({
  isLoading: false,
});

export const getters = {
  $isLoading: (state: LoadingState) => state.isLoading,
};

export const mutations = {
  SET_IS_LOADING(state: LoadingState, value: boolean) {
    state.isLoading = value;
  },
};

export const actions = {
  setIsLoading({ commit }: any, value: boolean) {
    commit('SET_IS_LOADING', value);
  },
};
