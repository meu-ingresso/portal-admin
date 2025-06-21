import { $axios } from '@/utils/nuxt-instance';
import { handleDeleteResponse, handleGetResponse } from '~/utils/responseHelpers';

interface UserAttachment {
  id: string;
  name: string;
  type: string;
  value: string | null;
}

// Constantes para tipos de documentos
const DOCUMENT_TYPES = {
  PF: ['document_cnh', 'document_rg_front', 'document_rg_back'],
  PJ: ['document_cnpj', 'document_social_contract']
};

const PIX_ATTACHMENT_TYPES = ['cpf', 'cnpj', 'email', 'phone', 'random'];

interface UserDocumentsState {
  isLoading: boolean;
  isLoadingAlias: boolean;
  userAttachments: UserAttachment[];
}

export const state = (): UserDocumentsState => ({
  isLoading: false,
  isLoadingAlias: false,
  userAttachments: [],
});

export const getters = {
  $isLoading: (state: UserDocumentsState) => state.isLoading,
  $isLoadingAlias: (state: UserDocumentsState) => state.isLoadingAlias,
  $userAttachments: (state: UserDocumentsState) => state.userAttachments,
  
  $hasRequiredDocuments: (state: UserDocumentsState, getters: any) => {
    const fiscalInfo = getters.$fiscalInfo;

    if (!fiscalInfo) {
      return false;
    }

    if (fiscalInfo?.personType === 'PJ') {
      return state.userAttachments.some(att => DOCUMENT_TYPES.PJ.includes(att.type));
    } else {
      return state.userAttachments.some(att => DOCUMENT_TYPES.PF.includes(att.type));
    } 
  },

  $hasFiscalInfo: (state: UserDocumentsState) => {
    return state.userAttachments.some(att => att.name === 'fiscal_info');
  },

  $fiscalInfo: (state: UserDocumentsState, getters: any) => {
    if (getters.$hasFiscalInfo) {
      return JSON.parse(state.userAttachments.find(att => att.name === 'fiscal_info')?.value || '{}');
    }

    return null;
  },

  $hasPixInfo: (state: UserDocumentsState) => {
    return state.userAttachments.some(att => PIX_ATTACHMENT_TYPES.includes(att.type) && att.name === 'pix_key');
  },

  $pixInfo: (state: UserDocumentsState, getters: any) => {
    if (getters.$hasPixInfo) {
      return state.userAttachments.find(att => PIX_ATTACHMENT_TYPES.includes(att.type) && att.name === 'pix_key');
    }
    return null;
  },

  $hasRejectionReason: (state: UserDocumentsState) => {
    return state.userAttachments.some(att => att.name === 'documents_rejection');
  },

  $rejectionReason: (state: UserDocumentsState, getters: any) => {
    if (getters.$hasRejectionReason) {
      return state.userAttachments.find(att => att.name === 'documents_rejection');
    }
    return null;
  },

  // Getters para alias customizado
  $hasCustomAlias: (state: UserDocumentsState) => {
    return state.userAttachments.some(att => att.name === 'custom_alias');
  },

  $customAlias: (state: UserDocumentsState, getters: any) => {
    if (getters.$hasCustomAlias) {
      return state.userAttachments.find(att => att.name === 'custom_alias')?.value;
    }
    return null;
  },

  $hasDisplayName: (state: UserDocumentsState) => {
    return state.userAttachments.some(att => att.name === 'display_name');
  },

  $displayName: (state: UserDocumentsState, getters: any) => {
    if (getters.$hasDisplayName) {
      return state.userAttachments.find(att => att.name === 'display_name')?.value;
    }
    return null;
  },
};

export const mutations = {
  SET_LOADING(state: UserDocumentsState, payload: boolean) {
    state.isLoading = payload;
  },

  SET_LOADING_ALIAS(state: UserDocumentsState, payload: boolean) {
    state.isLoadingAlias = payload;
  },

  SET_USER_ATTACHMENTS(state: UserDocumentsState, payload: UserAttachment[]) {
    state.userAttachments = payload;
  },

  ADD_USER_ATTACHMENT(state: UserDocumentsState, payload: UserAttachment) {
    state.userAttachments.push(payload);
  },

  UPDATE_USER_ATTACHMENT(state: UserDocumentsState, payload: Partial<UserAttachment> & { id: string }) {
    const index = state.userAttachments.findIndex(att => att.id === payload.id);
    if (index !== -1) {
      state.userAttachments[index] = { ...state.userAttachments[index], ...payload };
    }
  },

  DELETE_USER_ATTACHMENT(state: UserDocumentsState, payload: string) {
    state.userAttachments = state.userAttachments.filter(att => att.id !== payload);
  },
};

export const actions = {
  async fetchDocumentStatus({ commit }: any, userId: string) {
    try {
      commit('SET_USER_ATTACHMENTS', []);
      commit('SET_LOADING', true);
      
      if (!userId) {
        throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
      }

      const response = await $axios.$get(`user-attachments?where[user_id][v]=${userId}`);
      const { data } = handleGetResponse(response, 'Falha ao buscar documentos do usuário', null, true);
      
      if (data && Array.isArray(data)) {
        commit('SET_USER_ATTACHMENTS', data);
      }

      return null;
      
    } catch (error) {
      console.error('Erro ao buscar status de documentos:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Ação para validar alias do usuário
  async validateUserAlias({ commit }: any, payload: { alias: string, currentUserId?: string } | string) {
    try {
      commit('SET_LOADING_ALIAS', true);

      const { alias, currentUserId } = typeof payload === 'string' ? { alias: payload, currentUserId: null } : payload;

      // Buscar usuários com o alias especificado no campo alias padrão
      const userResponse = await $axios.$get('users', {
        params: {
          'where[alias][o]': '=',
          'where[alias][v]': alias,
        },
      });
      
      const { data: users } = handleGetResponse(userResponse, 'Falha ao validar alias', null, true);
      
      // Buscar user_attachments com custom_alias
      const attachmentResponse = await $axios.$get('user-attachments', {
        params: {
          'where[name][o]': '=',
          'where[name][v]': 'custom_alias',
          'where[value][o]': '=',
          'where[value][v]': alias,
        },
      });
      
      const { data: attachments } = handleGetResponse(attachmentResponse, 'Falha ao validar alias customizado', null, true);
      
      // Verificar se já existe (excluindo o próprio usuário se fornecido)
      let isValid = true;
      let conflictReason = '';
      
      if (users && users.length > 0) {
        const conflictUser = users.find(user => user.id !== currentUserId);
        if (conflictUser) {
          isValid = false;
          conflictReason = 'Alias já usado por outro usuário';
        }
      }
      
      if (isValid && attachments && attachments.length > 0) {
        const conflictAttachment = attachments.find(att => att.user_id !== currentUserId);
        if (conflictAttachment) {
          isValid = false;
          conflictReason = 'Alias customizado já usado por outro usuário';
        }
      }
      
      return {
        is_valid: isValid,
        alias,
        message: isValid ? 'Alias disponível' : conflictReason
      };
    } catch (error) {
      console.error('Erro ao validar alias do usuário:', error);
      return {
        is_valid: false,
        alias: typeof payload === 'string' ? payload : payload.alias,
        message: 'Erro ao validar alias'
      };
    } finally {
      commit('SET_LOADING_ALIAS', false);
    }
  },

  // Ação para salvar alias customizado
  async saveCustomAlias({ state, dispatch }: any, payload: { userId: string, alias: string, displayName?: string }) {
    try {
      const { userId, alias, displayName } = payload;
      
      if (!userId) {
        throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
      }
      
      // Salvar o alias customizado
      let aliasAttachment = state.userAttachments.find(
        (att: UserAttachment) => att.name === 'custom_alias'
      );
      
      if (aliasAttachment) {
        await dispatch('updateUserAttachment', {
          id: aliasAttachment.id,
          value: alias
        });
      } else {
        const newAliasAttachment = await dispatch('createUserDocument', {
          userId,
          name: 'custom_alias',
          type: 'text',
          value: alias
        });
        aliasAttachment = newAliasAttachment;
      }

      // Se foi fornecido um displayName, salvá-lo também
      if (displayName) {
        const displayNameAttachment = state.userAttachments.find(
          (att: UserAttachment) => att.name === 'display_name'
        );
        
        if (displayNameAttachment) {
          await dispatch('updateUserAttachment', {
            id: displayNameAttachment.id,
            value: displayName
          });
        } else {
          await dispatch('createUserDocument', {
            userId,
            name: 'display_name',
            type: 'text',
            value: displayName
          });
        }
      }

      return aliasAttachment;
    } catch (error) {
      console.error('Erro ao salvar alias customizado:', error);
      throw error;
    }
  },

  async getAccountVerificationStatus(_: any, userId: string) {
    try {
      const response = await $axios.$get(`user-attachments?where[user_id][v]=${userId}&where[type][v]=account_verification`);
      const { data } = handleGetResponse(response, 'Falha ao buscar status de verificação', null, true);
      
      if (!data || !data.length) return null;
      return data[0];
    } catch (error) {
      console.error('Erro ao buscar status de verificação:', error);
      throw error;
    }
  },

  async getRejectionReason(_: any, userId: string) {
    try {
      const response = await $axios.$get(`user-attachments?where[user_id][v]=${userId}&where[type][v]=rejection_reason`);
      const { data } = handleGetResponse(response, 'Falha ao buscar motivo da rejeição', null, true);
      
      if (!data || !data.length) return null;
      return data[0];
    } catch (error) {
      console.error('Erro ao buscar motivo da rejeição:', error);
      throw error;
    }
  },

  async verifyAccount({ dispatch }: any, userId: string) {
    try {
      // Busca o status atual de verificação
      const verificationStatus = await dispatch('getAccountVerificationStatus', userId);
      
      if (verificationStatus) {
        // Atualiza o registro existente
        await dispatch('updateUserAttachment', {
          id: verificationStatus.id,
          value: 'verified'
        });
      } else {
        // Cria um novo registro
        await dispatch('createUserDocument', {
          userId,
          name: 'account_verification',
          type: 'account_verification',
          value: 'verified'
        });
      }

      // Remove o registro de rejeição se existir
      const rejectionReason = await dispatch('getRejectionReason', userId);
      if (rejectionReason) {
        await dispatch('deleteUserDocument', {
          attachmentId: rejectionReason.id
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar conta:', error);
      throw error;
    }
  },

  async rejectAccount({ dispatch }: any, payload: { userId: string, rejectionReason: string }) {
    try {
      // Busca o status atual de verificação
      const verificationStatus = await dispatch('getAccountVerificationStatus', payload.userId);
      
      if (verificationStatus) {
        // Atualiza o registro existente
        await dispatch('updateUserAttachment', {
          id: verificationStatus.id,
          value: 'rejected'
        });
      } else {
        // Cria um novo registro
        await dispatch('createUserDocument', {
          userId: payload.userId,
          name: 'account_verification',
          type: 'account_verification',
          value: 'rejected'
        });
      }

      // Adiciona ou atualiza o motivo da rejeição
      const existingRejection = await dispatch('getRejectionReason', payload.userId);
      if (existingRejection) {
        await dispatch('updateUserAttachment', {
          id: existingRejection.id,
          value: payload.rejectionReason
        });
      } else {
        await dispatch('createUserDocument', {
          userId: payload.userId,
          name: 'documents_rejection',
          type: 'rejection_reason',
          value: payload.rejectionReason
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao rejeitar conta:', error);
      throw error;
    }
  },

  async createUserDocument({ commit }: any, payload: { name: string; type: string; userId: string, value?: string }) {
    try {
      const userId = payload.userId;
      
      if (!userId) {
        throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
      }
      
      const response = await $axios.$post('user-attachment', {
        data: [{
          user_id: userId,
          name: payload.name,
          type: payload.type,
          value: payload.value || null,
        }]
      });
      
      if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao criar registro de documento');
      }
      
      const newAttachment = response.body.result[0];
      commit('ADD_USER_ATTACHMENT', newAttachment);
      
      return newAttachment;
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      throw error;
    }
  },

  async uploadUserDocument({ dispatch }: any, payload: { documentFile: File, attachmentId: string }) {
    try {
      const formData = new FormData();
      formData.append('attachment_ids[]', payload.attachmentId);
      formData.append('files[]', payload.documentFile);
      
      const uploadResponse = await $axios.$post('upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!uploadResponse.body || uploadResponse.body.code !== 'CREATE_SUCCESS') {
        throw new Error('Falha ao fazer upload do documento');
      }
      
      const fileUrl = uploadResponse.body.result[0].s3_url;
      
      await dispatch('updateUserAttachment', {
        id: payload.attachmentId,
        value: fileUrl
      });
      
      return fileUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      throw error;
    }
  },

  async updateUserAttachment({ commit }: any, payload: Partial<UserAttachment> & { id: string }) {
    try {
      const updateResponse = await $axios.$patch('user-attachment', {
        data: [{
          id: payload.id,
          ...payload
        }]
      });
      
      if (!updateResponse.body || updateResponse.body.code !== 'UPDATE_SUCCESS') {
        throw new Error('Falha ao atualizar documento');
      }
      
      commit('UPDATE_USER_ATTACHMENT', payload);
      
      return updateResponse.body.result;
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      throw error;
    }
  },

  async savePixInformation({ state, commit, dispatch }: any, payload: { userId: string, pixKey: string, pixKeyType: string }) {
    try {
      const { userId, pixKey, pixKeyType } = payload;
      
      if (!userId) {
        throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
      }
      
      let pixAttachment = state.userAttachments.find(
        (att: UserAttachment) => att.name === 'pix_key' && PIX_ATTACHMENT_TYPES.includes(att.type)
      );
      
      if (pixAttachment) {
        await dispatch('updateUserAttachment', {
          id: pixAttachment.id,
          type: pixKeyType,  
          value: pixKey
        });
      } else {
        const response = await $axios.$post('user-attachment', {
          data: [{
            user_id: userId,
            name: 'pix_key',
            type: pixKeyType,
            value: pixKey
          }]
        });
        
        if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
          throw new Error('Falha ao salvar informações de PIX');
        }
        
        pixAttachment = response.body.result[0];
        commit('ADD_USER_ATTACHMENT', pixAttachment);
      }

      // Atualiza o status de documentos do usuário
      await dispatch('fetchDocumentStatus', userId);
      
      return pixAttachment;
    } catch (error) {
      console.error('Erro ao salvar informações de PIX:', error);
      throw error;
    }
  },

  async deleteUserDocument({ commit }: any, payload: { attachmentId: string }) {
    try {
      const response = await $axios.$delete(`user-attachment/${payload.attachmentId}`);
      const { data } = handleDeleteResponse(response, 'Falha ao deletar documento', null);

      commit('DELETE_USER_ATTACHMENT', payload.attachmentId);

      return data;
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  },

  // Alias para deleteUserDocument
  async deleteUserAttachment({ dispatch }: any, attachmentId: string) {
    return await dispatch('deleteUserDocument', { attachmentId });
  },
}; 