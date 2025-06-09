import { $axios } from '@/utils/nuxt-instance';
import { EventCollaboratorApiResponse } from '@/models/event';
import { handleGetResponse } from '~/utils/responseHelpers';

interface CollaboratorFilters {
  eventId: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

interface EventCollaboratorsState {
  isLoading: boolean;
  collaborators: EventCollaboratorApiResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export const state = (): EventCollaboratorsState => ({
  isLoading: false,
  collaborators: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
  },
});

export const getters = {
  $isLoading: (state: EventCollaboratorsState) => state.isLoading,
  $collaborators: (state: EventCollaboratorsState) => state.collaborators,
  $meta: (state: EventCollaboratorsState) => state.meta,
};

export const mutations = {
  SET_LOADING(state: EventCollaboratorsState, payload: boolean) {
    state.isLoading = payload;
  },

  SET_COLLABORATORS(state: EventCollaboratorsState, payload: EventCollaboratorApiResponse[]) {
    state.collaborators = payload;
  },

  SET_META(state: EventCollaboratorsState, payload: any) {
    state.meta = payload;
  },
};

export const actions = {
  async fetchCollaborators({ commit, dispatch }: any, params: CollaboratorFilters): Promise<EventCollaboratorApiResponse[]> {
    try {
      commit('SET_LOADING', true);

      const queryParams: any = {
        preloads: [
          'user:people',
          'event',
          'role',
        ],
        'whereHas[event][event_id][v]': params.eventId,
        page: params.page || 1,
        limit: params.limit || 9999,
        sort: params.sort || '-created_at',
      };

      if (params.search) {
        queryParams['search[email][o]'] = `LIKE`;
        queryParams['search[email][v]'] = `%${params.search}%`;
      }

      const response = await $axios.$get(`event-collaborators`, { params: queryParams });
      const { data, meta } = handleGetResponse(response, 'Erro ao carregar colaboradores', params.eventId, true);

      commit('SET_COLLABORATORS', data || []);
      commit('SET_META', meta);
      return data || [];
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      dispatch('toast/setToast', {
        text: 'Erro ao carregar colaboradores',
        type: 'error',
        time: 5000,
      }, { root: true });
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async validateEmails(_: any, emails: string[]): Promise<{ [email: string]: boolean }> {
    try {
      const validationResults: { [email: string]: boolean } = {};
      
      // Check each email individually to determine if it exists
      for (const email of emails) {
        try {
          const userResponse = await $axios.$get('users', {
            params: {
              'where[email][v]': email,
            },
          });
          
          const user = userResponse.body.result.data[0];

          validationResults[email] = user && user.id;
        } catch (error) {
          console.error(`Error validating email ${email}:`, error);
          validationResults[email] = false;
        }
      }
      
      return validationResults;
    } catch (error) {
      console.error('Error validating emails:', error);
      throw error;
    }
  },

  async addCollaborators({ commit, dispatch }: any, payload: { 
    eventId: string;
    collaborators: { email: string; role: string }[];
  }): Promise<{ success: boolean, invalidEmails?: string[] }> {
    try {
      commit('SET_LOADING', true);
      
      // First validate all emails
      const emails = payload.collaborators.map(c => c.email);
      const emailValidationResults = await dispatch('validateEmails', emails);
      
      // Gather invalid emails
      const invalidEmails = Object.entries(emailValidationResults)
        .filter(([_, isValid]) => !isValid)
        .map(([email]) => email);
      
      // If any emails are invalid, return early with the list of invalid emails
      if (invalidEmails.length > 0) {
        return { 
          success: false, 
          invalidEmails 
        };
      }
      
      const collaboratorPayloads = await Promise.all(
        payload.collaborators.map(async (collaborator) => {
          const userResponse = await $axios.$get('users', {
            params: {
              'where[email][v]': collaborator.email,
            },
          });

          const userId = userResponse.body.result.data[0]?.id;

          return {
            event_id: payload.eventId,
            user_id: userId,
            role_id: collaborator.role,
          };
        })
      );

      await $axios.$post('event-collaborator', {
        data: collaboratorPayloads,
      });

      
      return { success: true };
    } catch (error) {
      console.error('Error adding collaborators:', error);
      dispatch('toast/setToast', {
        text: error.response?.data?.message || 'Erro ao adicionar colaboradores',
        type: 'error',
        time: 5000,
      }, { root: true });
      return { success: false };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteCollaborator({ commit, dispatch }: any, payload: { id: string; eventId: string }): Promise<boolean> {
    try {
      commit('SET_LOADING', true);
      
      await $axios.$delete(`event-collaborator/${payload.id}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      dispatch('toast/setToast', {
        text: error.response?.data?.message || 'Erro ao remover colaborador',
        type: 'error',
        time: 5000,
      }, { root: true });
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },
}; 