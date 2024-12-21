import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
    name: 'cep',
    stateFactory: true,
    namespaced: true,
})
export default class Cep extends VuexModule {
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
    public async fetchCep(cep: string) {

        this.setLoading(true);

        return await $axios
            .$get(`https://viacep.com.br/ws/${cep}/json/`)
            .then((response) => {
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
