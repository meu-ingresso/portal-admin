import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'openAI',
  stateFactory: true,
  namespaced: true,
})
export default class OpenAI extends VuexModule {
  @Action
  public async improveDescription(payload: any) {
    return await $axios
      .$post(`event/improve-description`, payload)
      .then((response) => {
        if (response.body && response.body.code !== 'IMPROVE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(() => {
        return {
          data: 'Error',
          code: 'IMPROVE_ERROR',
          total: 0,
        };
      });
  }
}
