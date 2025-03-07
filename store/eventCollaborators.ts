import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { toast } from '@/store';
import { EventCollaboratorApiResponse } from '@/models/event';
import { handleGetResponse } from '~/utils/responseHelpers';

interface CollaboratorFilters {
  eventId: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

@Module({
  name: 'eventCollaborators',
  stateFactory: true,
  namespaced: true,
})
export default class EventCollaborators extends VuexModule {
  private isLoading: boolean = false;
  private collaborators: EventCollaboratorApiResponse[] = [];
  private meta = {
    total: 0,
    page: 1,
    limit: 10,
  };

  public get $isLoading() {
    return this.isLoading;
  }

  public get $collaborators() {
    return this.collaborators;
  }

  public get $meta() {
    return this.meta;
  }

  @Mutation
  private SET_LOADING(payload: boolean) {
    this.isLoading = payload;
  }

  @Mutation
  private SET_COLLABORATORS(payload: EventCollaboratorApiResponse[]) {
    this.collaborators = payload;
  }

  @Mutation
  private SET_META(payload: any) {
    this.meta = payload;
  }

  @Action
  public async fetchCollaborators(params: CollaboratorFilters): Promise<EventCollaboratorApiResponse[]> {
    try {
      this.context.commit('SET_LOADING', true);

      const queryParams: any = {
        preloads: [
          'user:people',
          'event',
          'role',
        ],
        'whereHas[event][event_id][v]': params.eventId,
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || '-created_at',
      };

      if (params.search) {
        queryParams['whereHas[user][people][first_name][o]'] = `LIKE`;
        queryParams['whereHas[user][people][first_name][v]'] = `%${params.search}%`;
      }

      const response = await $axios.$get(`event-collaborators`, { params: queryParams });
      const { data, meta } = handleGetResponse(response, 'Erro ao carregar colaboradores', params.eventId, true);

      this.context.commit('SET_COLLABORATORS', data || []);
      this.context.commit('SET_META', meta);
      return data || [];
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.setToast({
        text: 'Erro ao carregar colaboradores',
        type: 'error',
        time: 5000,
      });
      return [];
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async validateEmails(emails: string[]): Promise<{ [email: string]: boolean }> {
    try {
      const validationResults: { [email: string]: boolean } = {};
      
      // Check each email individually to determine if it exists
      for (const email of emails) {
        try {
          const userResponse = await $axios.$get('users', {
            params: {
              'preloads[]': 'people',
              'whereHas[people][email][v]': email,
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
  }

  @Action
  public async addCollaborators(payload: { 
    eventId: string;
    collaborators: { email: string; role: string }[];
  }): Promise<{ success: boolean, invalidEmails?: string[] }> {
    try {
      this.context.commit('SET_LOADING', true);
      
      // First validate all emails
      const emails = payload.collaborators.map(c => c.email);
      const emailValidationResults = await this.validateEmails(emails);
      
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
              'preloads[]': 'people',
              'whereHas[people][email][v]': collaborator.email,
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
      toast.setToast({
        text: error.response?.data?.message || 'Erro ao adicionar colaboradores',
        type: 'error',
        time: 5000,
      });
      return { success: false };
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async deleteCollaborator(payload: { id: string; eventId: string }): Promise<boolean> {
    try {
      this.context.commit('SET_LOADING', true);
      
      await $axios.$delete(`event-collaborator/${payload.id}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      toast.setToast({
        text: error.response?.data?.message || 'Erro ao remover colaborador',
        type: 'error',
        time: 5000,
      });
      return false;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }
} 