import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { user } from '@/utils/store-util';
import { handleDeleteResponse, handleGetResponse } from '~/utils/responseHelpers';

interface UserAttachment {
  id: string;
  name: string;
  type: string;
  value: string | null;
}

interface DocumentInfo {
  hasSubmittedDocuments: boolean;
  personType: string;
}

@Module({
  name: 'userDocuments',
  stateFactory: true,
  namespaced: true,
})
export default class UserDocuments extends VuexModule {
  private isLoading: boolean = false;
  private userAttachments: UserAttachment[] = [];
  private documentInfo: DocumentInfo = {
    hasSubmittedDocuments: false,
    personType: 'PF',
  };

  public get $isLoading() {
    return this.isLoading;
  }

  public get $documentInfo() {
    return this.documentInfo;
  }

  public get $userAttachments() {
    return this.userAttachments;
  }

  public get $hasRequiredDocuments() {
    if (this.documentInfo.personType === 'PJ') {
      return this.userAttachments.some(att => att.type === 'document_cnpj');
    } else {
      return this.userAttachments.some(att => att.type.includes('document_cnh') || att.type.includes('document_rg'));
    } 
  }

  public get $hasPixInfo() {
    // Verifica se há algum anexo que seja um tipo de chave PIX
    const pixAttachmentTypes = ['cpf', 'cnpj', 'email', 'phone', 'random'];
    return this.userAttachments.some(att => pixAttachmentTypes.includes(att.type) && att.name === 'Pix Key');
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
  private UPDATE_DOCUMENT_INFO(payload: Partial<DocumentInfo>) {
    this.documentInfo = { ...this.documentInfo, ...payload };
  }

  @Action
  public updateDocumentInfo(payload: Partial<DocumentInfo>) {
    this.context.commit('UPDATE_DOCUMENT_INFO', payload);
  }

  @Action
  public async fetchDocumentStatus(userId: string) {
    try {
      this.context.commit('SET_LOADING', true);
    
      
      if (!userId) {
        throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
      }

      const responseUser = await user.get(userId);

      const personType = responseUser?.people?.person_type || 'PF';
      this.context.commit('UPDATE_DOCUMENT_INFO', { personType });
      
      const response = await $axios.$get(`user-attachments?where[user_id][v]=${userId}`);
      const { data } = handleGetResponse(response, 'Falha ao buscar documentos do usuário', null, true);
      
      if (data && Array.isArray(data)) {
        this.context.commit('SET_USER_ATTACHMENTS', data);
        
        const hasRequiredDocuments = this.$hasRequiredDocuments;
        const hasPixInfo = this.$hasPixInfo;
        
        this.context.commit('UPDATE_DOCUMENT_INFO', {
          hasSubmittedDocuments: hasRequiredDocuments && hasPixInfo
        });
      }
      
      return {
        attachments: this.userAttachments,
        hasRequiredDocuments: this.$hasRequiredDocuments,
        hasPixInfo: this.$hasPixInfo,
        personType
      };
    } catch (error) {
      console.error('Erro ao buscar status de documentos:', error);
      throw error;
    } finally {
      this.context.commit('SET_LOADING', false);
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
      
      // Verifica se já existe um attachment para PIX
      let pixAttachment = this.userAttachments.find(
        att => att.name === 'Pix Key' && ['cpf', 'cnpj', 'email', 'phone', 'random'].includes(att.type)
      );
      
      // Se existir, atualizamos com os novos valores
      if (pixAttachment) {

        await this.context.dispatch('updateUserAttachment', {
          id: pixAttachment.id,
          type: pixKeyType,  // Atualizamos o tipo para o novo pixKeyType
          value: pixKey      // Armazenamos o valor da chave PIX diretamente
        });
      } else {
        // Se não existir, criamos um novo
        const response = await $axios.$post('user-attachment', {
          data: [{
            user_id: userId,
            name: 'Pix Key',
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
      
      if (this.$hasRequiredDocuments && this.$hasPixInfo) {
        this.context.commit('UPDATE_DOCUMENT_INFO', {
          hasSubmittedDocuments: true
        });
      }
      
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

      return data;
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  }
} 