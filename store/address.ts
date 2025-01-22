import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { PostAddressPayload } from '~/models';


@Module({
  name: 'address',
  stateFactory: true,
  namespaced: true,
})
export default class Address extends VuexModule {
  private isLoading: boolean = false;

  public get $isLoading() {
    return this.isLoading;
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
  public async postAddress(postAddressPayload: PostAddressPayload) {
    this.setLoading(true);

    try {
      const response = await $axios.$post('address', postAddressPayload);

      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Failed to create address.');
      }

      return {
        success: true,
        data: response.body.result,
        message: 'Address created successfully'
      };
    } catch (error) {
      console.error('Error creating address:', error);

      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    } finally {
      this.setLoading(false);
    }
  }
}
