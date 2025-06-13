import { $axios } from '@/utils/nuxt-instance';

export const actions = {
  async improveDescription(_: any, payload: any) {
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
  },
};
