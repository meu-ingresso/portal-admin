import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

@Module({
  name: 'loading',
  stateFactory: true,
  namespaced: true,
})
export default class Loading extends VuexModule {
  private isLoading = false;

  public get $isLoading() {
    return this.isLoading;
  }

  @Mutation
  private SET_IS_LOADING(value: boolean) {
    this.isLoading = value;
  }

  @Action
  public setIsLoading(value: boolean) {
    this.context.commit('SET_IS_LOADING', value);
  }
}
