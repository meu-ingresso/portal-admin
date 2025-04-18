import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
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

@Module({
  name: 'userDocuments',
  stateFactory: true,
  namespaced: true,
})
export default class UserDocuments extends VuexModule {
  private isLoading: boolean = false;
  private userAttachments: UserAttachment[] = [];

  public get $isLoading() {
    return this.isLoading;
  }

  public get $userAttachments() {
    return this.userAttachments;
  }

  public get $hasRequiredDocuments() {

    const fiscalInfo = this.$fiscalInfo;

    if (!fiscalInfo) {
      return false;
    }

    if (fiscalInfo?.personType === 'PJ') {
      return this.userAttachments.some(att => DOCUMENT_TYPES.PJ.includes(att.type));
    } else {
      return this.userAttachments.some(att => DOCUMENT_TYPES.PF.includes(att.type));
    } 
  }

  public get $hasFiscalInfo() {
    return this.userAttachments.some(att => att.name === 'fiscal_info');
  }

  public get $fiscalInfo() {
    if (this.$hasFiscalInfo) {
      return JSON.parse(this.userAttachments.find(att => att.name === 'fiscal_info')?.value || '{}');
    }

    return null;
  }

  public get $hasPixInfo() {
    return this.userAttachments.some(att => PIX_ATTACHMENT_TYPES.includes(att.type) && att.name === 'pix_key');
  }

  public get $pixInfo() {
    if (this.$hasPixInfo) {
      return this.userAttachments.find(att => PIX_ATTACHMENT_TYPES.includes(att.type) && att.name === 'pix_key');
    }
    return null;
  }

  public get $hasRejectionReason() {
    return this.userAttachments.some(att => att.name === 'documents_rejection');
  }

  public get $rejectionReason() {
    if (this.$hasRejectionReason) {
      return this.userAttachments.find(att => att.name === 'documents_rejection');
    }
    return null;
  }
  
  @Mutation
  private SET_LOADING(payload: boolean) {
    this.isLoading = payload;
  }

  @Mutation
  private SET_USER_ATTACHMENTS(payload: UserAttachment[]) {
    this.userAttachments = payload;
  }

  @Mutation
  private ADD_USER_ATTACHMENT(payload: UserAttachment) {
    this.userAttachments.push(payload);
  }

  @Mutation
  private UPDATE_USER_ATTACHMENT(payload: Partial<UserAttachment> & { id: string }) {
    const index = this.userAttachments.findIndex(att => att.id === payload.id);
    if (index !== -1) {
      this.userAttachments[index] = { ...this.userAttachments[index], ...payload };
    }
  }

  @Mutation
  private DELETE_USER_ATTACHMENT(payload: string) {
    this.userAttachments = this.userAttachments.filter(att => att.id !== payload);
  }

  @Action
  public async fetchDocumentStatus(userId: string) {
    try {

      this.context.commit('SET_USER_ATTACHMENTS', []);

      this.context.commit('SET_LOADING', true);
    
      
      if (!userId) {
        throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
      }

      const response = await $axios.$get(`user-attachments?where[user_id][v]=${userId}`);
      const { data } = handleGetResponse(response, 'Falha ao buscar documentos do usuário', null, true);
      
      if (data && Array.isArray(data)) {
        this.context.commit('SET_USER_ATTACHMENTS', data);
      }

      return null;
      
    } catch (error) {
      console.error('Erro ao buscar status de documentos:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
    }
  }

  @Action
  public async getAccountVerificationStatus(userId: string) {
    try {
      const response = await $axios.$get(`user-attachments?where[user_id][v]=${userId}&where[type][v]=account_verification`);
      const { data } = handleGetResponse(response, 'Falha ao buscar status de verificação', null, true);
      
      if (!data || !data.length) return null;
      return data[0];
    } catch (error) {
      console.error('Erro ao buscar status de verificação:', error);
      throw error;
    }
  }

  @Action
  public async getRejectionReason(userId: string) {
    try {
      const response = await $axios.$get(`user-attachments?where[user_id][v]=${userId}&where[type][v]=rejection_reason`);
      const { data } = handleGetResponse(response, 'Falha ao buscar motivo da rejeição', null, true);
      
      if (!data || !data.length) return null;
      return data[0];
    } catch (error) {
      console.error('Erro ao buscar motivo da rejeição:', error);
      throw error;
    }
  }

  @Action
  public async verifyAccount(userId: string) {
    try {
      // Busca o status atual de verificação
      const verificationStatus = await this.getAccountVerificationStatus(userId);
      
      if (verificationStatus) {
        // Atualiza o registro existente
        await this.context.dispatch('updateUserAttachment', {
          id: verificationStatus.id,
          value: 'verified'
        });
      } else {
        // Cria um novo registro
        await this.context.dispatch('createUserDocument', {
          userId,
          name: 'account_verification',
          type: 'account_verification',
          value: 'verified'
        });
      }

      // Remove o registro de rejeição se existir
      const rejectionReason = await this.context.dispatch('getRejectionReason', userId);
      if (rejectionReason) {
        await this.context.dispatch('deleteUserDocument', {
          attachmentId: rejectionReason.id
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar conta:', error);
      throw error;
    }
  }

  @Action
  public async rejectAccount(payload: { userId: string, rejectionReason: string }) {
    try {
      
      // Busca o status atual de verificação
      const verificationStatus = await this.getAccountVerificationStatus(payload.userId);
      
      if (verificationStatus) {
        // Atualiza o registro existente
        await this.context.dispatch('updateUserAttachment', {
          id: verificationStatus.id,
          value: 'rejected'
        });
      } else {
        // Cria um novo registro
        await this.context.dispatch('createUserDocument', {
          userId: payload.userId,
          name: 'account_verification',
          type: 'account_verification',
          value: 'rejected'
        });
      }

      // Adiciona ou atualiza o motivo da rejeição
      const existingRejection = await this.context.dispatch('getRejectionReason', payload.userId);
      if (existingRejection) {
        await this.context.dispatch('updateUserAttachment', {
          id: existingRejection.id,
          value: payload.rejectionReason
        });
      } else {
        await this.context.dispatch('createUserDocument', {
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
  }

  @Action
  public async createUserDocument(payload: { name: string; type: string; userId: string, value?: string }) {
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
      this.context.commit('ADD_USER_ATTACHMENT', newAttachment);
      
      return newAttachment;
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      throw error;
    }
  }

  @Action
  public async uploadUserDocument(payload: { documentFile: File, attachmentId: string }) {
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
      
      await this.context.dispatch('updateUserAttachment', {
        id: payload.attachmentId,
        value: fileUrl
      });
      
      return fileUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      throw error;
    }
  }

  @Action
  public async updateUserAttachment(payload: Partial<UserAttachment> & { id: string }) {
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
      
      this.context.commit('UPDATE_USER_ATTACHMENT', payload);
      
      return updateResponse.body.result;
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      throw error;
    }
  }

  @Action
  public async savePixInformation(payload: { userId: string, pixKey: string, pixKeyType: string }) {
    try {
      const { userId, pixKey, pixKeyType } = payload;
      
      if (!userId) {
        throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
      }
      
      let pixAttachment = this.userAttachments.find(
        att => att.name === 'pix_key' && PIX_ATTACHMENT_TYPES.includes(att.type)
      );
      
      if (pixAttachment) {

        await this.context.dispatch('updateUserAttachment', {
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
        this.context.commit('ADD_USER_ATTACHMENT', pixAttachment);
      }

      // Atualiza o status de documentos do usuário
      await this.context.dispatch('fetchDocumentStatus', userId);
      
      return pixAttachment;
    } catch (error) {
      console.error('Erro ao salvar informações de PIX:', error);
      throw error;
    }
  }

  @Action
  public async deleteUserDocument(payload: { attachmentId: string }) {
    try {
      const response = await $axios.$delete(`user-attachment/${payload.attachmentId}`);
      const { data } = handleDeleteResponse(response, 'Falha ao deletar documento', null);

      this.context.commit('DELETE_USER_ATTACHMENT', payload.attachmentId);

      return data;
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  }
} 