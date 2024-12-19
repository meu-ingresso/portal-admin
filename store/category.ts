import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { SearchPayload } from '~/models';

@Module({
    name: 'category',
    stateFactory: true,
    namespaced: true,
})
export default class Category extends VuexModule {
    private categoryList = [];
    private isLoading: boolean = false;

    public get $categoryList() {
        return this.categoryList;
    }

    public get $isLoading() {
        return this.isLoading;
    }

    @Mutation
    private SET_CATEGORY_LIST(data: any) {
        this.categoryList = data;
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
    public async fetchCategories({ page = 1, limit = 12, search, sortBy, sortDesc }: SearchPayload) {
        
        this.setLoading(true);

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

        return await $axios
            .$get(`categories?${params.toString()}`)
            .then((response) => {
                if (response.body && response.body.code !== 'SEARCH_SUCCESS')
                    throw new Error(response);

                this.setLoading(false);
                this.context.commit('SET_CATEGORY_LIST', response.body.result.data);
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
