import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { status } from '@/utils/store-util';
import { handleGetResponse } from '~/utils/responseHelpers';

export interface PDV {
  id?: string;
  event_id: string;
  name: string;
  status_id: string;
  status?: any;
  created_at?: string;
  updated_at?: string;
  users?: Array<{
    id: string;
    user_id: string;
    pdv_id: string;
    user?: any;
  }>;
  tickets?: Array<{
    id: string;
    ticket_id: string;
    pdv_id: string;
    ticket?: any;
  }>;
}

@Module({
  name: 'eventPdv',
  stateFactory: true,
  namespaced: true,
})
export default class EventPdv extends VuexModule {
  private pdvList: PDV[] = [];
  private isLoading: boolean = false;
  private selectedPdv: PDV | null = null;
  private statusDefault: any = null;

  public get $pdvs() {
    return this.pdvList;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  public get $selectedPdv() {
    return this.selectedPdv;
  }

  public get $statusDefault() {
    return this.statusDefault;
  }

  @Mutation
  private SET_PDVS(pdvs: PDV[]) {
    this.pdvList = pdvs;
  }

  @Mutation
  private SET_SELECTED_PDV(pdv: PDV | null) {
    this.selectedPdv = pdv;
  }

  @Mutation
  private SET_IS_LOADING(value: boolean) {
    this.isLoading = value;
  }

  @Mutation
  private SET_STATUS_DEFAULT(statusData: any) {
    this.statusDefault = statusData;
  }

  @Mutation
  private ADD_PDV(pdv: PDV) {
    this.pdvList = [...this.pdvList, pdv];
  }

  @Mutation
  private UPDATE_PDV(payload: { id: string; pdv: Partial<PDV> }) {
    const { id, pdv } = payload;
    this.pdvList = this.pdvList.map((item) => {
      if (item.id === id) {
        return { ...item, ...pdv };
      }
      return item;
    });
  }

  @Mutation
  private REMOVE_PDV(id: string) {
    this.pdvList = this.pdvList.filter((pdv) => pdv.id !== id);
  }

  @Action
  public setIsLoading(value: boolean) {
    this.context.commit('SET_IS_LOADING', value);
  }

  @Action
  public setPdvs(pdvs: PDV[]) {
    this.context.commit('SET_PDVS', pdvs);
  }

  @Action
  public setSelectedPdv(pdv: PDV | null) {
    this.context.commit('SET_SELECTED_PDV', pdv);
  }

  @Action
  public async fetchAndPopulateByEventId(eventId: string) {
    try {
      this.setIsLoading(true);

      // Buscar o status padrão para PDV
      const statusResponse = await status.fetchStatusByModuleAndName({
        module: 'pdv',
        name: 'Disponível'
      });
      
      if (statusResponse) {
        this.context.commit('SET_STATUS_DEFAULT', statusResponse);
      }

      // Buscar os PDVs do evento
      const response = await $axios.$get(`pdvs?where[event_id][v]=${eventId}&preloads[]=users.user&preloads[]=tickets.ticket&preloads[]=status`);
      
      const responseResult = handleGetResponse(response, 'PDVs não encontrados');
      
      if (responseResult && responseResult.data) {
        this.setPdvs(responseResult.data as PDV[]);
        return { success: true, data: responseResult.data };
      }
      
      this.setPdvs([]);
      return { success: true, data: [] };
    } catch (error) {
      console.error('[PDV] Error fetching PDVs:', error);
      this.setPdvs([]);
      return { success: false, error };
    } finally {
      this.setIsLoading(false);
    }
  }

  @Action
  public async createPdv(pdvData: Omit<PDV, 'id'>) {
    try {
      this.setIsLoading(true);
      
      const payload = {
        data: [pdvData]
      };
      
      const response = await $axios.$post('pdv', payload);
      
      if (response && response.body && response.body.code === 'CREATE_SUCCESS') {
        const newPdv = response.body.result.data[0];
        this.context.commit('ADD_PDV', newPdv);
        return { success: true, data: newPdv };
      }
      
      throw new Error('Falha ao criar PDV');
    } catch (error) {
      console.error('[PDV] Error creating PDV:', error);
      return { success: false, error };
    } finally {
      this.setIsLoading(false);
    }
  }

  @Action
  public async updatePdv(payload: { id: string; data: Partial<PDV> }) {
    try {
      this.setIsLoading(true);
      
      const { id, data } = payload;
      
      const updatePayload = {
        data: [{ id, ...data }]
      };
      
      const response = await $axios.$patch('pdv', updatePayload);
      
      if (response && response.body && response.body.code === 'UPDATE_SUCCESS') {
        this.context.commit('UPDATE_PDV', { id, pdv: data });
        return { success: true };
      }
      
      throw new Error('Falha ao atualizar PDV');
    } catch (error) {
      console.error('[PDV] Error updating PDV:', error);
      return { success: false, error };
    } finally {
      this.setIsLoading(false);
    }
  }

  @Action
  public async deletePdv(id: string) {
    try {
      this.setIsLoading(true);
      
      const response = await $axios.$delete(`pdv/${id}`);
      
      if (response && response.body && response.body.code === 'DELETE_SUCCESS') {
        this.context.commit('REMOVE_PDV', id);
        return { success: true };
      }
      
      throw new Error('Falha ao excluir PDV');
    } catch (error) {
      console.error('[PDV] Error deleting PDV:', error);
      return { success: false, error };
    } finally {
      this.setIsLoading(false);
    }
  }

  @Action
  public async associateUsers(payload: { pdvId: string; userIds: string[] }) {
    try {
      this.setIsLoading(true);
      
      const { pdvId, userIds } = payload;
      
      const data = userIds.map(userId => ({
        pdv_id: pdvId,
        user_id: userId
      }));
      
      const response = await $axios.$post('pdv-user', { data });
      
      if (response && response.body && response.body.code === 'CREATE_SUCCESS') {
        // Atualizar o PDV na lista após associar usuários
        await this.fetchAndPopulateByEventId(this.$pdvs.find(pdv => pdv.id === pdvId)?.event_id || '');
        return { success: true, data: response.body.result.data };
      }
      
      throw new Error('Falha ao associar usuários ao PDV');
    } catch (error) {
      console.error('[PDV] Error associating users:', error);
      return { success: false, error };
    } finally {
      this.setIsLoading(false);
    }
  }

  @Action
  public async associateTickets(payload: { pdvId: string; ticketIds: string[] }) {
    try {
      this.setIsLoading(true);
      
      const { pdvId, ticketIds } = payload;
      
      const data = ticketIds.map(ticketId => ({
        pdv_id: pdvId,
        ticket_id: ticketId
      }));
      
      const response = await $axios.$post('pdv-ticket', { data });
      
      if (response && response.body && response.body.code === 'CREATE_SUCCESS') {
        // Atualizar o PDV na lista após associar ingressos
        await this.fetchAndPopulateByEventId(this.$pdvs.find(pdv => pdv.id === pdvId)?.event_id || '');
        return { success: true, data: response.body.result.data };
      }
      
      throw new Error('Falha ao associar ingressos ao PDV');
    } catch (error) {
      console.error('[PDV] Error associating tickets:', error);
      return { success: false, error };
    } finally {
      this.setIsLoading(false);
    }
  }

  @Action
  public async removeUserAssociation(pdvUserId: string) {
    try {
      this.setIsLoading(true);
      
      const response = await $axios.$delete(`pdv-user/${pdvUserId}`);
      
      if (response && response.body && response.body.code === 'DELETE_SUCCESS') {
        // Atualiza a lista de PDVs para refletir a remoção
        const pdv = this.pdvList.find(p => p.users?.some(u => u.id === pdvUserId));
        if (pdv && pdv.event_id) {
          await this.fetchAndPopulateByEventId(pdv.event_id);
        }
        return { success: true };
      }
      
      throw new Error('Falha ao remover associação de usuário');
    } catch (error) {
      console.error('[PDV] Error removing user association:', error);
      return { success: false, error };
    } finally {
      this.setIsLoading(false);
    }
  }

  @Action
  public async removeTicketAssociation(pdvTicketId: string) {
    try {
      this.setIsLoading(true);
      
      const response = await $axios.$delete(`pdv-ticket/${pdvTicketId}`);
      
      if (response && response.body && response.body.code === 'DELETE_SUCCESS') {
        // Atualiza a lista de PDVs para refletir a remoção
        const pdv = this.pdvList.find(p => p.tickets?.some(t => t.id === pdvTicketId));
        if (pdv && pdv.event_id) {
          await this.fetchAndPopulateByEventId(pdv.event_id);
        }
        return { success: true };
      }
      
      throw new Error('Falha ao remover associação de ingresso');
    } catch (error) {
      console.error('[PDV] Error removing ticket association:', error);
      return { success: false, error };
    } finally {
      this.setIsLoading(false);
    }
  }

  @Action
  public reset() {
    this.context.commit('SET_PDVS', []);
    this.context.commit('SET_SELECTED_PDV', null);
    this.context.commit('SET_STATUS_DEFAULT', null);
  }
} 