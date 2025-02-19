import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { EventGuestList, EventGuestListMember, ResultMeta } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse } from '~/utils/responseHelpers';
@Module({
  name: 'eventGuests',
  stateFactory: true,
  namespaced: true,
})
export default class EventGuests extends VuexModule {

  private isLoading: boolean = false;

  private isDeleting: boolean = false;

  private guestList: EventGuestList[] = [];

  private guestListMembers: EventGuestListMember[] = [];

  private metaGuestList: ResultMeta = {
    total: 0,
    perPage: 50,
    currentPage: 1,
    lastPage: 1,
    firstPage: 1
  };

  private metaGuestListMember: ResultMeta = {
    total: 0,
    perPage: 50,
    currentPage: 1,
    lastPage: 1,
    firstPage: 1
  };

  private mockGuestList: EventGuestList[] = [
    {
      id: '123456',
      event_id: '123456',
      name: 'John Doe',
      created_by: '123456',
      created_at: '2025-02-01',
      updated_at: '2025-02-01',
      deleted_at: '2025-02-01',
    },
  ];

  private mockGuestListMembers: EventGuestListMember[] = [
    {
      id: '123456',
      guest_list_id: '123456',
      first_name: 'John',
      last_name: 'Doe',
      quantity: 1,
      added_by: '123456',
      validated: false,
      validated_by: '123456',
      validated_at: '2025-02-01',
      created_at: '2025-02-01',
      updated_at: '2025-02-01',
      deleted_at: '2025-02-01',
    },
  ];

  constructor(module: VuexModule<ThisType<EventGuests>, EventGuests>) {
    super(module);
    this.guestList = process.env.USE_MOCK_DATA === 'true' ? this.mockGuestList : this.guestList;
    this.guestListMembers = process.env.USE_MOCK_DATA === 'true' ? this.mockGuestListMembers : this.guestListMembers;
  }

  public get $guestLists() {
    return this.guestList;
  }

  public get $guestListMembers() {
    return this.guestListMembers;
  }

  public get $metaGuestList() {
    return this.metaGuestList;
  }

  public get $metaGuestListMember() {
    return this.metaGuestListMember;
  }

  public get $isLoading() {
    return this.isLoading;
  }

  public get $isDeleting() {
    return this.isDeleting;
  }

  @Mutation
  private SET_LOADING(loading: boolean) {
    this.isLoading = loading;
  }

  @Mutation
  private SET_META_GUEST_LIST(meta: ResultMeta) {
    this.metaGuestList = meta;
  }

  @Mutation
  private SET_META_GUEST_LIST_MEMBER(meta: ResultMeta) {
    this.metaGuestListMember = meta;
  }

  @Mutation
  private SET_DELETING(deleting: boolean) {
    this.isDeleting = deleting;
  }

  @Mutation
  private SET_GUEST_LIST_MEMBERS(guestListMembers: EventGuestListMember[]) {
    this.guestListMembers = guestListMembers;
  }

  @Mutation
  private SET_GUEST_LISTS(guestLists: EventGuestList[]) {
    this.guestList = guestLists;
  }

  @Mutation
  private ADD_GUEST_LIST_MEMBER(guestListMember: EventGuestListMember) {
    this.guestListMembers = [...this.guestListMembers, guestListMember];
  }

  @Mutation
  private UPDATE_GUEST_LIST_MEMBER({ index, guestListMember }: { index: number; guestListMember: EventGuestListMember }) {
    const updatedList = [...this.guestListMembers];
    updatedList[index] = { ...guestListMember };
    this.guestListMembers = updatedList;
  }

  @Mutation
  private UPDATE_GUEST_LIST({ index, guestList }: { index: number; guestList: EventGuestList }) {
    const updatedList = [...this.guestList];
    updatedList[index] = { ...guestList };
    this.guestList = updatedList;
  }

  @Mutation
  private REMOVE_GUEST_LIST_MEMBER(index: number) {
    const updatedList = [...this.guestListMembers];
    updatedList[index].deleted_at = new Date().toISOString();
    this.guestListMembers = updatedList;
  }

  @Mutation
  private REMOVE_GUEST_LIST(index: number) {
    const updatedList = [...this.guestList];
    updatedList[index].deleted_at = new Date().toISOString();
    this.guestList = updatedList;
  }
  
  @Mutation
  private RESET_GUEST_LIST_MEMBERS() {
    this.guestListMembers = [];
    this.metaGuestListMember = {
      total: 0,
      perPage: 50,
      currentPage: 1,
      lastPage: 1,
      firstPage: 1
    };
  }

  @Action
  public resetGuestListMembers() {
    this.context.commit('RESET_GUEST_LIST_MEMBERS');
  }

  @Action
  public setGuestLists(guestLists: EventGuestList[]) {
    this.context.commit('SET_GUEST_LISTS', guestLists);
  }

  @Action
  public addGuestList(guestList: EventGuestList) {
    this.context.commit('ADD_GUEST_LIST', guestList);
  }

  @Action
  public updateGuestList(payload: { index: number; guestList: EventGuestList }) {
    this.context.commit('UPDATE_GUEST_LIST', payload);
  }

  @Action
  public removeGuestList(index: number) {
    this.context.commit('REMOVE_GUEST_LIST', index);
  }

  @Action
  public async fetchGuestListAndPopulateByQuery(query: string): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);
      
      const response = await $axios.$get(`guest-lists?${query}`);
      const result = handleGetResponse(response, 'Lista de convidados não encontrada', null, true);

      if (result.meta) {
        this.context.commit('SET_META_GUEST_LIST', result.meta);
      }
      
      this.context.commit('SET_GUEST_LISTS', result.data || []);
    } catch (error) {
      console.error('Erro ao buscar lista de convidados:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchGuestListMemberAndPopulateByQuery(query: string): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);

      const response = await $axios.$get(`guest-list-members?${query}`);
      const result = handleGetResponse(response, 'Lista de convidados não encontrada', null, true);

      if (result.meta) {
        this.context.commit('SET_META_GUEST_LIST_MEMBER', result.meta);
      }
      
      this.context.commit('SET_GUEST_LIST_MEMBERS', result.data || []);
    } catch (error) {
      console.error('Erro ao buscar lista de convidados:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async createGuestList(payload: {
    event_id: string;
    name: string;
    created_by: string;
  }): Promise<string> {
    try {
      // this.context.commit('SET_LOADING', true);

      const response = await $axios.$post('guest-list', payload);
      
      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar lista de convidados');
      }

      return response.body.result.id;
    } catch (error) {
      console.error('Erro ao criar lista de convidados:', error);
      throw error;
    } finally {
      // this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async createGuestListMember(payload: {
    guest_list_id: string;
    first_name: string;
    last_name: string;
    quantity: number;
    added_by: string;
  }): Promise<string> {
    try {
      this.context.commit('SET_LOADING', true);

      const response = await $axios.$post('guest-list-member', payload);
      
      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar convidado');
      }

      return response.body.result.id;
    } catch (error) {
      console.error('Erro ao criar convidado:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchDeleteGuestList(guestListId: string): Promise<void> {
    try {
      this.context.commit('SET_DELETING', true);

        const response = await $axios.$delete(`guest-list/${guestListId}`);
      
      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao remover lista de convidados');
      }

      const guestListIndex = this.guestList.findIndex(g => g.id === guestListId);
      if (guestListIndex !== -1) {
        this.context.commit('REMOVE_GUEST_LIST', guestListIndex); 
      }
    } catch (error) {
      console.error('Erro ao remover lista de convidados:', error);
      throw error;
    } finally {
      this.context.commit('SET_DELETING', false);
    }
  }

  @Action
  public async fetchDeleteGuestListMember(guestListMemberId: string): Promise<void> {
    try {
      this.context.commit('SET_DELETING', true);

        const response = await $axios.$delete(`guest-list-member/${guestListMemberId}`);
      
      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao remover convidado');
      }

      const guestListMemberIndex = this.guestListMembers.findIndex(g => g.id === guestListMemberId);
      if (guestListMemberIndex !== -1) {
        this.context.commit('REMOVE_GUEST_LIST_MEMBER', guestListMemberIndex); 
      }
    } catch (error) {
      console.error('Erro ao remover convidado:', error);
      throw error;
    } finally {
      this.context.commit('SET_DELETING', false);
    }
  }

  @Action
  public async validateGuestListMember(payload: { 
    memberId: string, 
    validatedBy: string, 
    validated: boolean
  }): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);

      const response = await $axios.$put(`guest-list-member/${payload.memberId}`, {
        validated: payload.validated,
        validated_by: payload.validatedBy,
        validated_at: new Date().toISOString()
      });

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao validar convidado');
      }

      // Atualiza o estado local
      this.context.commit('UPDATE_GUEST_LIST_MEMBER', {
        index: this.guestListMembers.findIndex(g => g.id === payload.memberId),
        guestListMember: {
          id: payload.memberId,
          validated: payload.validated,
          validated_by: payload.validatedBy,
          validated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Erro ao validar convidado:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async fetchUpdateGuestList(payload: { 
    id: string, 
    name: string
  }): Promise<void> {
    try {
      this.context.commit('SET_LOADING', true);

      const response = await $axios.$patch(`guest-list`, {
        id: payload.id,
        name: payload.name
      });

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar lista de convidados');
      }

      // Atualiza o estado local
      this.context.commit('UPDATE_GUEST_LIST', {
        index: this.guestList.findIndex(g => g.id === payload.id),
        guestList: {
          id: payload.id,
          name: payload.name
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar lista de convidados:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }


} 