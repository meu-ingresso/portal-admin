import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';

@Module({
  name: 'headSoft',
  stateFactory: true,
  namespaced: true,
})
export default class headSoft extends VuexModule {
  private productList = [];
  private originList = [];
  private destinyList = [];
  private customerList = [];
  private crmDataList = [];
  private customerData = {};
  private customerTotalizer = {};
  private customerApproval = [];
  private customerContacts = [];
  private customerFollowUps = [];
  private customerLogisticContracts = [];
  private taskGroups = [];
  private enterprises = [];
  private isLoadingTotalizer = false;
  private isLoadingApproval = false;
  private isLoadingContacts = false;
  private isLoadingFollowUps = false;

  public get $productList() {
    return this.productList;
  }

  public get $originList() {
    return this.originList;
  }

  public get $destinyList() {
    return this.destinyList;
  }

  public get $customerList() {
    return this.customerList;
  }

  public get $crmDataList() {
    return this.crmDataList;
  }

  public get $customerData() {
    return this.customerData;
  }

  public get $customerTotalizer() {
    return this.customerTotalizer;
  }

  public get $customerApproval() {
    return this.customerApproval;
  }

  public get $customerContacts() {
    return this.customerContacts;
  }

  public get $customerFollowUps() {
    return this.customerFollowUps;
  }

  public get $customerLogisticContracts() {
    return this.customerLogisticContracts;
  }

  public get $taskGroups() {
    return this.taskGroups;
  }

  public get $enterprises() {
    return this.enterprises;
  }

  public get $isLoadingTotalizer() {
    return this.isLoadingTotalizer;
  }

  public get $isLoadingApproval() {
    return this.isLoadingApproval;
  }

  public get $isLoadingContacts() {
    return this.isLoadingContacts;
  }

  public get $isLoadingFollowUps() {
    return this.isLoadingFollowUps;
  }

  @Mutation
  private RESET_CUSTOMER() {
    this.customerData = {};
    this.customerTotalizer = {};
    this.customerApproval = [];
    this.customerContacts = [];
    this.customerFollowUps = [];
  }

  @Mutation
  private SET_PRODUCT_LIST(data: any) {
    return (this.productList = data.map((item: any) => ({
      value: item.IdMercadoria,
      text: item.Nome,
    })));
  }

  @Mutation
  private SET_ORIGIN_LIST(data: any) {
    return (this.originList = data.map((item: any) => ({
      value: item.IdOrigem_Destino,
      text: item.Nome,
    })));
  }

  @Mutation
  private SET_DESTINY_LIST(data: any) {
    return (this.destinyList = data.map((item: any) => ({
      value: item.IdOrigem_Destino,
      text: item.Nome,
    })));
  }

  @Mutation
  private SET_CUSTOMER_LIST(data: any) {
    return (this.customerList = data.map((item: any) => ({
      value: item.IdOrigem_Destino,
      text: item.Nome_Fantasia,
    })));
  }

  @Mutation
  private SET_CRM_LIST(data: any) {
    return (this.crmDataList = data);
  }

  @Mutation
  private SET_IS_LOADING_TOTALIZER(status: boolean) {
    return (this.isLoadingTotalizer = status);
  }

  @Mutation
  private SET_IS_LOADING_APPROVAL(status: boolean) {
    return (this.isLoadingApproval = status);
  }

  @Mutation
  private SET_IS_LOADING_CONTACTS(status: boolean) {
    return (this.isLoadingContacts = status);
  }

  @Mutation
  private SET_IS_LOADING_FOLLOW(status: boolean) {
    return (this.isLoadingFollowUps = status);
  }

  @Mutation
  private SET_CUSTOMER_DATA(data: any) {
    return (this.customerData = data);
  }

  @Mutation
  private SET_CUSTOMER_TOTALIZER(data: any) {
    const totals = data.reduce(
      (acc, item) => {
        acc.Total_Processos += item.Total_Processos;
        acc.Total_TEUS += item.Total_TEUS;
        acc.Total_Tons += item.Total_Tons === null ? 0 : item.Total_Tons;
        return acc;
      },
      { Total_Processos: null, Total_TEUS: null, Total_Tons: null }
    );

    return (this.customerTotalizer = totals);
  }

  @Mutation
  private SET_CUSTOMER_APPROVAL(data: any) {
    return (this.customerApproval = data);
  }

  @Mutation
  private SET_CUSTOMER_FOLLOW(data: any) {
    return (this.customerFollowUps = data);
  }

  @Mutation
  private SET_LOGISTIC_CONTRACTS(data: any) {
    return (this.customerLogisticContracts = data);
  }

  @Mutation
  private SET_TASK_GROUPS(data: any) {
    return (this.taskGroups = data);
  }

  @Mutation
  private SET_ENTERPRISES(data: any) {
    return (this.enterprises = data);
  }

  @Mutation
  private SET_CUSTOMER_CONTACTS(data: any) {
    return (this.customerContacts = data.filter((item) => {
      return (
        item.Contato &&
        item.Contato.trim() !== '.' &&
        item.Contato.trim() !== '' &&
        item.Contato.trim() !== 'null' &&
        item.Email &&
        item.Email.trim() !== '' &&
        item.Email.trim() !== '.'
      );
    }));
  }

  @Action
  public async getProducts(queryParam: string) {
    return await $axios
      .$get(`products/${queryParam}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_PRODUCT_LIST', response.body.result);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getOriginPorts(queryParam: string) {
    return await $axios
      .$get(`ports/${queryParam}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_ORIGIN_LIST', response.body.result);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getDestinyPorts(queryParam: string) {
    return await $axios
      .$get(`ports/${queryParam}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_DESTINY_LIST', response.body.result);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getCustomers(queryParam: string) {
    const teste = queryParam.replace(/[^\p{L}\p{N}\s.-]/gu, '');

    return await $axios
      .$get(`customers/${teste}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_CUSTOMER_LIST', response.body.result);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getCrmData(idsErp: string) {
    return await $axios
      .$get(`crm/${idsErp}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_CRM_LIST', response.body.result);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getCustomerData(IdPessoa: number) {
    return await $axios
      .$get(`crm/customer/${IdPessoa}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_CUSTOMER_DATA', response.body.result[0]);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getCustomerTotalizer(IdPessoa: number) {
    this.context.commit('SET_IS_LOADING_TOTALIZER', true);

    return await $axios
      .$get(`crm/customer/totalizer/${IdPessoa}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_CUSTOMER_TOTALIZER', response.body.result);

        this.context.commit('SET_IS_LOADING_TOTALIZER', false);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getCustomerApproval(IdPessoa: number) {
    this.context.commit('SET_IS_LOADING_APPROVAL', true);

    return await $axios
      .$get(`crm/customer/approval/${IdPessoa}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_CUSTOMER_APPROVAL', response.body.result);
        this.context.commit('SET_IS_LOADING_APPROVAL', false);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getCustomerContacts(IdPessoa: number) {
    this.context.commit('SET_IS_LOADING_CONTACTS', true);

    return await $axios
      .$get(`crm/customer/contacts/${IdPessoa}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_CUSTOMER_CONTACTS', response.body.result);
        this.context.commit('SET_IS_LOADING_CONTACTS', false);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getTaskGroups() {
    return await $axios
      .$get(`/crm/followups/groups`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_TASK_GROUPS', response.body.result);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getEnterpriseSystem() {
    return await $axios
      .$get(`/crm/followups/enterprises`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_ENTERPRISES', response.body.result);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async sendFollowUpMail(payload) {
    return await $axios
      .$post('/sendmail/followup', payload)
      .then((response) => {
        if (response && response !== 'E-mail enviado com sucesso')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public async createFollowUp(payload) {
    return await $axios
      .$post('/crm/followup', payload)
      .then((response) => {
        if (response.body && response.body.code !== 'CREATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public async updateFollowUp(payload) {
    return await $axios
      .$patch('/crm/followup', payload)
      .then((response) => {
        if (response.body && response.body.code !== 'UPDATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public async improveFollowUp(description) {
    return await $axios
      .$post('/crm/improve/followup', { description })
      .then((response) => {
        if (response.body && response.body.code !== 'CREATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public async getCustomerFollowups(IdPessoa: number) {
    this.context.commit('SET_IS_LOADING_FOLLOW', true);

    return await $axios
      .$get(`crm/customer/followups/${IdPessoa}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_CUSTOMER_FOLLOW', response.body.result);
        this.context.commit('SET_IS_LOADING_FOLLOW', false);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async getLogisticContract(IdPessoa: number) {
    return await $axios
      .$get(`logistic/contract/${IdPessoa}`)
      .then((response) => {
        if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
          throw new Error(response);
        }

        this.context.commit('SET_LOGISTIC_CONTRACTS', response.body.result);

        return response;
      })
      .catch((err) => {
        console.error(err);
        return {
          data: 'Error',
          code: 'FIND_NOTFOUND',
          total: 0,
        };
      });
  }

  @Action
  public async updateCrmData(payload: any) {
    return await $axios
      .$patch('crm', payload)
      .then((response) => {
        if (response.body && response.body.code !== 'UPDATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public async updateFav(payload: any) {
    return await $axios
      .$patch('crm/favorite', payload)
      .then((response) => {
        if (response.body && response.body.code !== 'UPDATE_SUCCESS')
          throw new Error(response);

        return response;
      })
      .catch(({ response }) => {
        return response;
      });
  }

  @Action
  public resetCustomer() {
    this.context.commit('RESET_CUSTOMER');
  }

  @Action
  public setLoaderFollow(status) {
    this.context.commit('SET_IS_LOADING_FOLLOW', status);
  }
}
