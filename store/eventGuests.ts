import { EventGuestList, EventGuestListMember, ResultMeta } from '~/models/event';
import { $axios } from '@/utils/nuxt-instance';
import { handleGetResponse, handleDeleteResponse } from '~/utils/responseHelpers';

interface EventGuestsState {
  isLoading: boolean;
  isDeleting: boolean;
  guestList: EventGuestList[];
  guestListMembers: EventGuestListMember[];
  metaGuestList: ResultMeta;
  metaGuestListMember: ResultMeta;
}

const mockGuestList: EventGuestList[] = [
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

const mockGuestListMembers: EventGuestListMember[] = [
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

export const state = (): EventGuestsState => ({
  isLoading: false,
  isDeleting: false,
  guestList: process.env.USE_MOCK_DATA === 'true' ? mockGuestList : [],
  guestListMembers: process.env.USE_MOCK_DATA === 'true' ? mockGuestListMembers : [],
  metaGuestList: {
    total: 0,
    perPage: 50,
    currentPage: 1,
    lastPage: 1,
    firstPage: 1
  },
  metaGuestListMember: {
    total: 0,
    perPage: 50,
    currentPage: 1,
    lastPage: 1,
    firstPage: 1
  },
});

export const getters = {
  $guestLists: (state: EventGuestsState) => state.guestList,
  $guestListMembers: (state: EventGuestsState) => state.guestListMembers,
  $metaGuestList: (state: EventGuestsState) => state.metaGuestList,
  $metaGuestListMember: (state: EventGuestsState) => state.metaGuestListMember,
  $isLoading: (state: EventGuestsState) => state.isLoading,
  $isDeleting: (state: EventGuestsState) => state.isDeleting,
};

export const mutations = {
  SET_LOADING(state: EventGuestsState, loading: boolean) {
    state.isLoading = loading;
  },

  SET_META_GUEST_LIST(state: EventGuestsState, meta: ResultMeta) {
    state.metaGuestList = meta;
  },

  SET_META_GUEST_LIST_MEMBER(state: EventGuestsState, meta: ResultMeta) {
    state.metaGuestListMember = meta;
  },

  SET_DELETING(state: EventGuestsState, deleting: boolean) {
    state.isDeleting = deleting;
  },

  SET_GUEST_LIST_MEMBERS(state: EventGuestsState, guestListMembers: EventGuestListMember[]) {
    state.guestListMembers = guestListMembers;
  },

  SET_GUEST_LISTS(state: EventGuestsState, guestLists: EventGuestList[]) {
    state.guestList = guestLists;
  },

  ADD_GUEST_LIST_MEMBER(state: EventGuestsState, guestListMember: EventGuestListMember) {
    state.guestListMembers = [...state.guestListMembers, guestListMember];
  },

  UPDATE_GUEST_LIST_MEMBER(state: EventGuestsState, { index, guestListMember }: { index: number; guestListMember: EventGuestListMember }) {
    const updatedList = [...state.guestListMembers];
    updatedList[index] = { ...guestListMember };
    state.guestListMembers = updatedList;
  },

  UPDATE_GUEST_LIST(state: EventGuestsState, { index, guestList }: { index: number; guestList: EventGuestList }) {
    const updatedList = [...state.guestList];
    updatedList[index] = { ...guestList };
    state.guestList = updatedList;
  },

  REMOVE_GUEST_LIST_MEMBER(state: EventGuestsState, index: number) {
    const updatedList = [...state.guestListMembers];
    updatedList[index].deleted_at = new Date().toISOString();
    state.guestListMembers = updatedList;
  },

  REMOVE_GUEST_LIST(state: EventGuestsState, index: number) {
    const updatedList = [...state.guestList];
    updatedList[index].deleted_at = new Date().toISOString();
    state.guestList = updatedList;
  },
  
  RESET_GUEST_LIST_MEMBERS(state: EventGuestsState) {
    state.guestListMembers = [];
    state.metaGuestListMember = {
      total: 0,
      perPage: 50,
      currentPage: 1,
      lastPage: 1,
      firstPage: 1
    };
  },
};

export const actions = {
  resetGuestListMembers({ commit }: any) {
    commit('RESET_GUEST_LIST_MEMBERS');
  },

  setGuestLists({ commit }: any, guestLists: EventGuestList[]) {
    commit('SET_GUEST_LISTS', guestLists);
  },

  addGuestList({ commit }: any, guestList: EventGuestList) {
    commit('ADD_GUEST_LIST', guestList);
  },

  updateGuestList({ commit }: any, payload: { index: number; guestList: EventGuestList }) {
    commit('UPDATE_GUEST_LIST', payload);
  },

  removeGuestList({ commit }: any, index: number) {
    commit('REMOVE_GUEST_LIST', index);
  },

  async fetchGuestListAndPopulateByQuery({ commit }: any, query: string): Promise<void> {
    try {
      commit('SET_LOADING', true);
      
      const response = await $axios.$get(`guest-lists?${query}`);
      const result = handleGetResponse(response, 'Lista de convidados não encontrada', null, true);

      if (result.meta) {
        commit('SET_META_GUEST_LIST', result.meta);
      }
      
      commit('SET_GUEST_LISTS', result.data || []);
    } catch (error) {
      console.error('Erro ao buscar lista de convidados:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchGuestListMemberAndPopulateByQuery({ commit }: any, query: string): Promise<void> {
    try {
      commit('SET_LOADING', true);

      const response = await $axios.$get(`guest-list-members?${query}`);
      const result = handleGetResponse(response, 'Lista de convidados não encontrada', null, true);

      if (result.meta) {
        commit('SET_META_GUEST_LIST_MEMBER', result.meta);
      }
      
      commit('SET_GUEST_LIST_MEMBERS', result.data || []);
    } catch (error) {
      console.error('Erro ao buscar lista de convidados:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createGuestList(_: any, payload: {
    event_id: string;
    name: string;
    created_by: string;
  }): Promise<string> {
    try {
      const response = await $axios.$post('guest-list', {
        data: [
          {
            event_id: payload.event_id,
            name: payload.name,
            created_by: payload.created_by
          }
        ]
      });
      
      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar lista de convidados');
      }

      return response.body.result[0].id;
    } catch (error) {
      console.error('Erro ao criar lista de convidados:', error);
      throw error;
    }
  },

  async createGuestListMember({ commit }: any, payload: {
    guest_list_id: string;
    first_name: string;
    last_name: string;
    quantity: number;
    added_by: string;
  }): Promise<string> {
    try {
      commit('SET_LOADING', true);

      const response = await $axios.$post('guest-list-member', {
        data: [
          {
            guest_list_id: payload.guest_list_id,
            first_name: payload.first_name,
            last_name: payload.last_name,
            quantity: payload.quantity,
            added_by: payload.added_by
          }
        ]
      });
      
      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar convidado');
      }

      return response.body.result[0].id;
    } catch (error) {
      console.error('Erro ao criar convidado:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchDeleteGuestList({ commit, state }: any, guestListId: string): Promise<void> {
    try {
      commit('SET_DELETING', true);

      const response = await $axios.$delete(`guest-list/${guestListId}`);
      
      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao remover lista de convidados');
      }

      const guestListIndex = state.guestList.findIndex((g: EventGuestList) => g.id === guestListId);
      if (guestListIndex !== -1) {
        commit('REMOVE_GUEST_LIST', guestListIndex); 
      }
    } catch (error) {
      console.error('Erro ao remover lista de convidados:', error);
      throw error;
    } finally {
      commit('SET_DELETING', false);
    }
  },

  async fetchDeleteGuestListMember({ commit, state }: any, guestListMemberId: string): Promise<void> {
    try {
      commit('SET_DELETING', true);

      const response = await $axios.$delete(`guest-list-member/${guestListMemberId}`);
      
      if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
        throw new Error('Falha ao remover convidado');
      }

      const guestListMemberIndex = state.guestListMembers.findIndex((g: EventGuestListMember) => g.id === guestListMemberId);
      if (guestListMemberIndex !== -1) {
        commit('REMOVE_GUEST_LIST_MEMBER', guestListMemberIndex); 
      }
    } catch (error) {
      console.error('Erro ao remover convidado:', error);
      throw error;
    } finally {
      commit('SET_DELETING', false);
    }
  },

  async validateGuestListMember({ commit }: any, payload: Array<{ id: string, quantity: number }>): Promise<void> {
    try {
      commit('SET_LOADING', true);

      const response = await $axios.$post(`guest-list-member-validated`, {
        data: payload.map(validation => ({
          guest_list_member_id: validation.id,
          quantity: validation.quantity
        }))
      });

      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao validar convidado');
      }

      return response.body.result;

    } catch (error) {
      console.error('Erro ao validar convidado:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchUpdateGuestList({ commit, state }: any, payload: { 
    id: string, 
    name: string
  }): Promise<void> {
    try {
      commit('SET_LOADING', true);

      const response = await $axios.$patch(`guest-list`, {
        data: [
          {
            id: payload.id,
            name: payload.name
          }
        ]
      });

      if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar lista de convidados');
      }

      // Atualiza o estado local
      commit('UPDATE_GUEST_LIST', {
        index: state.guestList.findIndex((g: EventGuestList) => g.id === payload.id),
        guestList: {
          id: payload.id,
          name: payload.name
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar lista de convidados:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  clearGuestListMembers({ commit }: any) {
    commit('SET_GUEST_LIST_MEMBERS', []);
    commit('SET_META_GUEST_LIST_MEMBER', {
      total: 0,
      perPage: 10,
      currentPage: 1,
      lastPage: 1,
      firstPage: 1
    });
  },

  async deleteGuestListMemberValidated(_: any, guestListMemberId: string) {
    try {
      const response = await $axios.$delete(`guest-list-member-validated/${guestListMemberId}`);

      const result = handleDeleteResponse(response, 'Falha ao remover check-in de convidado', null);

      return result;
    } catch (error) {
      console.error('Erro ao remover check-in de convidado:', error);
      throw error;
    }
  },
}; 