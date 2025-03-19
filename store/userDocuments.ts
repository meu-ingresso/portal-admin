import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { $axios } from '@/utils/nuxt-instance';
import { user } from '@/utils/store-util';
import { handleGetResponse } from '~/utils/responseHelpers';

interface UserAttachment {
  id: string;
  name: string;
  type: string;
  value: string | null;
}

interface BankInfo {
  bank: string;
  agency: string;
  account: string;
  accountType: string;
  ownerDocument: string;
  pixKey: string;
}

interface DocumentInfo {
  hasSubmittedDocuments: boolean;
  personType: string;
  bankInfo: BankInfo;
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
    bankInfo: {
      bank: '',
      agency: '',
      account: '',
      accountType: '',
      ownerDocument: '',
      pixKey: '',
    }
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
      return this.userAttachments.some(
        att => att.type === 'document_cnpj' || att.type === 'cnpj'
      );
    } else {
      return this.userAttachments.some(
        att => att.type === 'document_identification' || 
               att.type.includes('document') ||
               att.type === 'cnh' || 
               att.type === 'rg' || 
               att.type === 'passport'
      );
    }
  }

  public get $hasBankInfo() {
    const { bank, agency, account, accountType, ownerDocument, pixKey } = this.documentInfo.bankInfo;
    return Boolean(bank && agency && account && accountType && ownerDocument && pixKey);
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

  @Mutation
  private UPDATE_BANK_INFO(payload: Partial<BankInfo>) {
    this.documentInfo.bankInfo = { ...this.documentInfo.bankInfo, ...payload };
  }

  @Action
  public updateDocumentInfo(payload: Partial<DocumentInfo>) {
    this.context.commit('UPDATE_DOCUMENT_INFO', payload);
  }

  @Action
  public updateBankInfo(payload: Partial<BankInfo>) {
    this.context.commit('UPDATE_BANK_INFO', payload);
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
        
        const bankInfo: Partial<BankInfo> = {};
        
        data.forEach(attachment => {
          if (attachment.type === 'bank_info') {
            try {
              const bankData = JSON.parse(attachment.value || '{}');
              
              if (bankData.account_type) {
                bankData.accountType = bankData.account_type;
                delete bankData.account_type;
              }
              
              if (bankData.owner_document) {
                bankData.ownerDocument = bankData.owner_document;
                delete bankData.owner_document;
              }
              
              if (bankData.pix_key) {
                bankData.pixKey = bankData.pix_key;
                delete bankData.pix_key;
              }
              
              Object.assign(bankInfo, bankData);
            } catch (e) {
               console.error('Erro ao processar informações bancárias:', e);
            }
          }
        });
        
        if (Object.keys(bankInfo).length > 0) {
          this.context.commit('UPDATE_BANK_INFO', bankInfo);
        }
        
        const hasRequiredDocuments = this.$hasRequiredDocuments;
        const hasBankInfo = this.$hasBankInfo;
        
        this.context.commit('UPDATE_DOCUMENT_INFO', {
          hasSubmittedDocuments: hasRequiredDocuments && hasBankInfo
        });
      }
      
      return {
        attachments: this.userAttachments,
        hasRequiredDocuments: this.$hasRequiredDocuments,
        hasBankInfo: this.$hasBankInfo,
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
  public async createUserDocument(payload: { name: string; type: string; userId: string }) {
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
          value: null,
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
  public async saveBankInformation(userId: string) {
    try {
      
      if (!userId) {
        throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
      }
      
      let bankAttachment = this.userAttachments.find(att => att.type === 'bank_info');
      
      const { bank, agency, account, accountType, ownerDocument, pixKey } = this.documentInfo.bankInfo;
      
      const bankData = JSON.stringify({
        bank,
        agency,
        account,
        account_type: accountType,
        owner_document: ownerDocument,
        pix_key: pixKey,
      });
      
      if (bankAttachment) {
        await this.context.dispatch('updateUserAttachment', {
          id: bankAttachment.id,
          value: bankData
        });
      } else {
        const response = await $axios.$post('user-attachment', {
          data: [{
            user_id: userId,
            name: 'Informações Bancárias',
            type: 'bank_info',
            value: bankData
          }]
        });
        
        if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
          throw new Error('Falha ao salvar informações bancárias');
        }
        
        bankAttachment = response.body.result[0];
        this.context.commit('ADD_USER_ATTACHMENT', bankAttachment);
      }
      
      if (this.$hasRequiredDocuments && this.$hasBankInfo) {
        this.context.commit('UPDATE_DOCUMENT_INFO', {
          hasSubmittedDocuments: true
        });
      }
      
      return bankAttachment;
    } catch (error) {
      console.error('Erro ao salvar informações bancárias:', error);
      throw error;
    }
  }
} 