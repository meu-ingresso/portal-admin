<template>
  <v-dialog :value="show" persistent max-width="960" :fullscreen="isMobile" @input="$emit('update:show', $event)">
    <v-card class="d-flex flex-column">
      <v-card-title class="d-flex justify-space-between align-start pa-6">
        <div>
          <span class="modalTitle">Editar Usuário</span>
          <div class="text-caption grey--text">
            Cliente desde {{ formatDateToCustomString(user.created_at) }}
          </div>
        </div>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-skeleton-loader v-if="isLoadingDocumentsAndFiscalInfo" type="card-avatar, article" />

      <template v-else>
        <!-- Informações Pessoais (Somente Visualização) na parte superior -->
        <v-card-text class="pb-0 px-6">
          <v-card outlined class="pa-4 mb-4">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" size="42" class="white--text mr-3">
                {{ getInitials(formData.firstName, formData.lastName) }}
              </v-avatar>
              <div>
                <div class="d-flex align-center">
                  <span class="text-h6">{{ getFullName(formData.firstName, formData.lastName) }}</span>
                </div>
                <div class="text-subtitle-2 grey--text">{{ formData.email }}</div>
              </div>
            </div>
          </v-card>
        </v-card-text>

        <!-- Abas para Dados Fiscais, Endereço e Documentos -->
        <v-tabs v-model="activeTab" background-color="transparent" grow class="px-6">
          <v-tab>
            <v-icon left>mdi-file-document</v-icon>
            Dados Fiscais
          </v-tab>
          <v-tab>
            <v-icon left>mdi-map-marker</v-icon>
            Endereço
          </v-tab>
          <v-tab>
            <v-icon left>mdi-file-multiple</v-icon>
            Documentos
          </v-tab>
        </v-tabs>

        <v-divider></v-divider>

        <v-card-text class="px-6 pt-4">
          <v-form ref="form" v-model="isFormValid">
            <v-tabs-items v-model="activeTab">
              <!-- Tab 1: Dados Fiscais -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center mb-4">
                      <div class="text-subtitle-1 font-weight-bold">Dados Fiscais</div>
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            color="error"
                            small
                            outlined
                            v-on="on"
                            @click="confirmClearUserData"
                          >
                            <v-icon left small>mdi-account-remove</v-icon>
                            Limpar Dados
                          </v-btn>
                        </template>
                        <span>Limpar Dados Fiscais</span>
                      </v-tooltip>
                    </div>

                    <!-- Tipo de Pessoa -->
                    <v-row>
                      <v-col cols="12">
                        <PersonTypeSelector 
                          :model-value="formData.fiscalData.personType" 
                          class="mb-4" 
                          @update:modelValue="updatePersonType"
                        />
                      </v-col>
                    </v-row>

                    <!-- Dados Fiscais - PF -->
                    <v-expand-transition>
                      <div v-if="formData.fiscalData.personType === 'PF'">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="formData.fiscalData.cpf"
                              label="CPF"
                              :rules="[v => !!v || 'CPF é obrigatório']"
                              mask="###.###.###-##"
                              outlined
                              dense
                              hide-details="auto"
                              prepend-inner-icon="mdi-card-account-details"
                            />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="formData.fiscalData.firstName"
                              label="Nome (Fiscal)"
                              :rules="[v => !!v || 'Nome fiscal é obrigatório']"
                              outlined
                              dense
                              hide-details="auto"
                              prepend-inner-icon="mdi-account"
                            />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="formData.fiscalData.lastName"
                              label="Sobrenome (Fiscal)"
                              :rules="[v => !!v || 'Sobrenome fiscal é obrigatório']"
                              outlined
                              dense
                              hide-details="auto"
                              prepend-inner-icon="mdi-account-details"
                            />
                          </v-col>
                        </v-row>
                      </div>
                    </v-expand-transition>

                    <!-- Dados Fiscais - PJ -->
                    <v-expand-transition>
                      <div v-if="formData.fiscalData.personType === 'PJ'">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="formData.fiscalData.cnpj"
                              label="CNPJ"
                              :rules="[v => !!v || 'CNPJ é obrigatório']"
                              mask="##.###.###/####-##"
                              outlined
                              dense
                              hide-details="auto"
                              prepend-inner-icon="mdi-office-building"
                            />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="formData.fiscalData.companyName"
                              label="Razão Social"
                              :rules="[v => !!v || 'Razão Social é obrigatória']"
                              outlined
                              dense
                              hide-details="auto"
                              prepend-inner-icon="mdi-domain"
                            />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="formData.fiscalData.tradeName"
                              label="Nome Fantasia"
                              :rules="[v => !!v || 'Nome Fantasia é obrigatório']"
                              outlined
                              dense
                              hide-details="auto"
                              prepend-inner-icon="mdi-store"
                            />
                          </v-col>
                        </v-row>
                      </div>
                    </v-expand-transition>

                    <v-divider class="my-4"></v-divider>

                    <!-- Informações PIX -->
                    <div class="text-subtitle-1 font-weight-bold mb-3">Informações PIX</div>
                    <PixKeyForm
                      form-inline
                      :pix-key-type="formData.pix.type"
                      :pix-key="formData.pix.key"
                      @update:pixKeyType="formData.pix.type = $event"
                      @update:pixKey="formData.pix.key = $event"
                    />
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Tab 2: Endereço -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <UserAddressForm />
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Tab 3: Documentos -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center mb-3">
                      <div>
                        <div class="text-subtitle-1 font-weight-bold">Documentos</div>
                        <p class="text-caption grey--text mb-0">Documentos enviados para completude cadastral</p>
                      </div>

                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            color="error"
                            small
                            outlined
                            v-on="on"
                            @click="confirmClearDocuments"
                          >
                            <v-icon left small>mdi-file-remove</v-icon>
                            Limpar Documentos
                          </v-btn>
                        </template>
                        <span>Limpar Documentos</span>
                      </v-tooltip>
                    </div>
                    
                    <!-- Lista de documentos -->
                    <v-card v-if="documentAttachments && documentAttachments.length > 0" outlined class="mt-3">
                      <v-data-table
                        :headers="documentHeaders"
                        :items="documentAttachments"
                        hide-default-footer
                        class="elevation-0"
                      >
                        <template #[`item.name`]="{ item }">
                          {{ getDocumentType(item.name) }}
                        </template>
                        <template #[`item.created_at`]="{ item }">
                          {{ formatDateTimeWithTimezone(item.created_at) }}
                        </template>
                        <template #[`item.actions`]="{ item }">
                          <v-btn
                            small
                            icon
                            color="primary"
                            @click="openDocument(item)"
                          >
                            <v-icon small>mdi-eye</v-icon>
                          </v-btn>
                        </template>
                      </v-data-table>
                    </v-card>
                    
                    <v-alert
                      v-else
                      type="info"
                      text
                      dense
                      class="mt-3"
                    >
                      Nenhum documento enviado pelo usuário.
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-form>
        </v-card-text>
      </template>

      <v-divider></v-divider>

      <v-card-actions class="d-flex align-center justify-space-between py-4 px-6">
        <DefaultButton
          text="Cancelar"
          outlined
          @click="closeModal"
        />
        <DefaultButton
          text="Salvar"
          color="primary"
          :disabled="!isFormValid || isSaving"
          :is-loading="isSaving"
          @click="saveUser"
        />
      </v-card-actions>
    </v-card>

    <!-- Modal de confirmação para limpar documentos -->
    <ConfirmDialog
      v-model="showConfirmClear"
      title="Limpar documentos"
      message="Tem certeza que deseja limpar todos os documentos deste usuário? Esta ação forçará o usuário a realizar o upload novamente no próximo carregamento da página de eventos."
      confirm-text="Limpar"
      cancel-text="Cancelar"
      confirm-color="error"
      @confirm="clearUserDocuments"
      @cancel="showConfirmClear = false"
    />

    <!-- Modal de confirmação para limpar dados do usuário -->
    <ConfirmDialog
      v-model="showConfirmClearData"
      title="Limpar dados do usuário"
      :message="clearDataConfirmMessage"
      confirm-text="Limpar"
      cancel-text="Cancelar"
      confirm-color="error"
      @confirm="clearUserData"
      @cancel="showConfirmClearData = false"
    />

    <!-- Modal de confirmação para excluir documento específico -->
    <ConfirmDialog
      v-model="showConfirmDeleteDoc"
      title="Excluir documento"
      message="Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita."
      confirm-text="Excluir"
      cancel-text="Cancelar"
      confirm-color="error"
      @confirm="deleteDocument"
      @cancel="showConfirmDeleteDoc = false"
    />
  </v-dialog>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { formatDateToCustomString, formatDateTimeWithTimezone } from '@/utils/formatters';
import { user, userDocuments, toast, userAddress, event } from '@/store';

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      activeTab: 0,
      isFormValid: true,
      isSaving: false,
      showConfirmClear: false,
      showConfirmClearData: false,
      showConfirmDeleteDoc: false,
      selectedDocument: null,
      documentHeaders: [
        { text: 'Nome', value: 'name', align: 'start' },
        { text: 'Data de Envio', value: 'created_at', align: 'start' },
        { text: 'Ações', value: 'actions', align: 'end', sortable: false }
      ],
      formData: {
        email: '',
        firstName: '',
        lastName: '',
        fiscalData: {
          personType: 'PF',
          cpf: '',
          firstName: '',
          lastName: '',
          cnpj: '',
          companyName: '',
          tradeName: '',
        },
        pix: {
          key: '',
          type: ''
        },
        address: {
          zipcode: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: ''
        }
      }
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isLoadingDocumentsAndFiscalInfo() {
      return userDocuments.$isLoading;
    },

    userAttachments() {
      return userDocuments.$userAttachments;
    },

    pixInfo() {
      return userDocuments.$pixInfo;
    },

    fiscalInfo() {
      return userDocuments.$fiscalInfo;
    },

    documentAttachments() {
      if (!this.userAttachments || !Array.isArray(this.userAttachments)) return [];

      const notAcceptedAttachments = ['pix_key', 'profile_image', 'contact_info', 'fiscal_info', 'rejection_reason', 'account_verification', 'documents_rejection'];

      const filteredAttachments = this.userAttachments.filter(att => !notAcceptedAttachments.includes(att.name));

      return filteredAttachments.map(att => ({
        name: att.name,
        created_at: att.created_at,
        value: att.value,
        id: att.id
      }));
    },
    
    clearDataConfirmMessage() {
      return 'Tem certeza que deseja limpar os dados fiscais deste usuário? Esta ação não pode ser desfeita.';
    },

    addressData() {
      return userAddress.$address;
    }
  },

  watch: {
    show: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.fetchUserDocuments();
        }
      }
    },

    user: {
      immediate: true,
      handler(newUser) {
        if (newUser && this.show) {
          this.fetchUserDocuments();
        }
      }
    },

    fiscalInfo: {
      immediate: true,
      handler(newFiscalInfo) {
        if (newFiscalInfo && this.show) {
          this.updateFiscalData(newFiscalInfo);
        }
      }
    },

    userAttachments: {
      immediate: true,
      handler(newAttachments) {
        if (newAttachments && newAttachments.length > 0 && this.show) {
          this.initializeForm(this.user);
        }
      }
    }
  },

  methods: {
    formatDateToCustomString,
    formatDateTimeWithTimezone,

    getInitials(firstName, lastName) {
      const first = firstName ? firstName.charAt(0).toUpperCase() : '';
      const last = lastName ? lastName.charAt(0).toUpperCase() : '';
      return first + last || '?';
    },

    getFullName(firstName, lastName) {
      if (!firstName && !lastName) return 'Nome não informado';
      return `${firstName || ''} ${lastName || ''}`.trim();
    },

    initializeForm(userData) {
      if (!userData) return;

      const people = userData.people || {};
      const address = people.address || {};

      // Inicializa dados pessoais
      this.formData = {
        email: userData.email || '',
        firstName: people.first_name || '',
        lastName: people.last_name || '',
        fiscalData: {
          personType: 'PF',
          cpf: '',
          firstName: '',
          lastName: '',
          cnpj: '',
          companyName: '',
          tradeName: '',
        },
        address: {
          id: address.id || '',
          zipcode: address.zipcode || '',
          street: address.street || '',
          number: address.number || '',
          complement: address.complement || '',
          neighborhood: address.neighborhood || '',
          city: address.city || '',
          state: address.state || ''
        },
        pix: {
          key: this.pixInfo?.value || '',
          type: this.pixInfo?.type || ''
        }
      };

      // Atualiza dados fiscais se disponíveis
      if (this.fiscalInfo) {
        this.updateFiscalData(this.fiscalInfo);
      }

      userAddress.updateAddress({
        ...this.formData.address
      });      
    },

    async fetchUserDocuments() {
      try {
        await userDocuments.fetchDocumentStatus(this.user.id);
      } catch (error) {
        console.error('Erro ao buscar documentos do usuário:', error);
        toast.setToast({
          text: 'Erro ao carregar documentos',
          type: 'error'
        });
      }
    },

    updatePersonType(type) {
      this.formData.fiscalData.personType = type;
    },

    getDocumentType(name) {
      if (!name) return 'Desconhecido';
      
      if (name.includes('rg')) {
        return 'RG';
      } else if (name.includes('cnh')) {
        return 'CNH';
      } else if (name.includes('document_cnpj')) {
        return 'Cartão CNPJ';
      } else if (name.includes('document_social_contract')) {
        return 'Contrato Social';
      } else if (name.includes('pix_key')) {
        return 'Chave PIX';
      }
      
      return name;
    },

    async saveUser() {
      if (!this.$refs.form.validate()) return;

      try {
        this.isSaving = true;

        const peopleData = {
          id: this.user.people.id,
        };

        // Atualiza dados fiscais
        const fiscalInfo = {
          personType: this.formData.fiscalData.personType,
          ...(this.formData.fiscalData.personType === 'PF' 
            ? {
                cpf: this.formData.fiscalData.cpf,
                firstName: this.formData.fiscalData.firstName,
                lastName: this.formData.fiscalData.lastName
              }
            : {
                cnpj: this.formData.fiscalData.cnpj,
                companyName: this.formData.fiscalData.companyName,
                tradeName: this.formData.fiscalData.tradeName
              }
          )
        };

        // Salva dados fiscais
        const fiscalInfoDoc = this.userAttachments.find(att => att.name === 'fiscal_info');
        if (fiscalInfoDoc) {
          await userDocuments.updateUserAttachment({
            id: fiscalInfoDoc.id,
            value: JSON.stringify(fiscalInfo)
          });
        } else {
          await userDocuments.createUserDocument({
            name: 'fiscal_info',
            type: 'json',
            userId: this.user.id,
            value: JSON.stringify(fiscalInfo)
          });
        }

        // Atualiza endereço
        if (this.user.people.address_id) {
          await userAddress.updateUserAddress({ 
            addressId: this.user.people.address_id, 
            data: this.addressData 
          });
        } else if (
          this.formData.address.street && 
          this.formData.address.zipcode
        ) {
          const newAddressId = await userAddress.createUserAddress(this.addressData);
          peopleData.address_id = newAddressId;
        }

        // Atualiza os dados de people apenas se houver mudança no endereço
        if (Object.keys(peopleData).length > 1) {
          await user.updatePeople(peopleData);
        }

        // Atualiza os dados de pix
        if (this.pixInfo && this.pixInfo.id) {
          await userDocuments.updateUserAttachment({
            id: this.pixInfo.id,
            type: this.formData.pix.type,
            value: this.formData.pix.key
          });
        } else if (this.formData.pix.key) {
          await userDocuments.createUserDocument({
            name: 'pix_key',
            type: this.formData.pix.type,
            value: this.formData.pix.key,
            userId: this.user.id
          });
        }

        toast.setToast({
          text: 'Usuário atualizado com sucesso!',
          type: 'success',
          time: 3000,
        });

        this.$emit('saved');
        this.closeModal();
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        toast.setToast({
          text: 'Erro ao atualizar usuário',
          type: 'error',
          time: 3000,
        });
      } finally {
        this.isSaving = false;
      }
    },

    confirmClearDocuments() {
      this.showConfirmClear = true;
    },

    confirmClearUserData() {
      this.showConfirmClearData = true;
    },

    confirmDeleteDocument(document) {
      this.selectedDocument = document;
      this.showConfirmDeleteDoc = true;
    },

    async clearUserDocuments() {
      try {
        this.isSaving = true;
        
        // Busca os documentos atuais do usuário se ainda não foram carregados
        if (this.userAttachments.length === 0) {
          await this.fetchUserDocuments();
        }
        
        // Remove cada documento
        for (const attachment of this.documentAttachments) {
          await userDocuments.deleteUserDocument({ attachmentId: attachment.id });
        }

        await event.updatePromoterEventsFromStatusToStatus({
          userId: this.user.id,
          fromStatus: 'Em Análise',
          toStatus: 'Aguardando'
        });

        toast.setToast({
          text: 'Documentos removidos com sucesso!',
          type: 'success',
          time: 3000,
        });

        this.showConfirmClear = false;
      } catch (error) {
        console.error('Erro ao limpar documentos:', error);
        toast.setToast({
          text: 'Erro ao limpar documentos',
          type: 'error',
          time: 3000,
        });
      } finally {
        this.isSaving = false;
      }
    },

    async clearUserData() {
      try {
        this.isSaving = true;
        
        // Limpa apenas os dados fiscais
        const fiscalInfoDoc = this.userAttachments.find(att => att.name === 'fiscal_info');
        if (fiscalInfoDoc) {
          await userDocuments.deleteUserDocument({ attachmentId: fiscalInfoDoc.id });
        }

        // Reseta o formulário fiscal
        this.formData.fiscalData = {
          personType: 'PF',
          cpf: '',
          firstName: '',
          lastName: '',
          cnpj: '',
          companyName: '',
          tradeName: '',
        };

        toast.setToast({
          text: 'Dados fiscais limpos com sucesso!',
          type: 'success',
          time: 3000,
        });

        this.showConfirmClearData = false;
      } catch (error) {
        console.error('Erro ao limpar dados fiscais:', error);
        toast.setToast({
          text: 'Erro ao limpar dados fiscais',
          type: 'error',
          time: 3000,
        });
      } finally {
        this.isSaving = false;
      }
    },

    async deleteDocument() {
      if (!this.selectedDocument) return;
      
      try {
        this.isSaving = true;
        
        await userDocuments.deleteUserDocument({ attachmentId: this.selectedDocument.id });

        toast.setToast({
          text: 'Documento removido com sucesso!',
          type: 'success',
          time: 3000,
        });

        this.showConfirmDeleteDoc = false;
        this.selectedDocument = null;
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
        toast.setToast({
          text: 'Erro ao excluir documento',
          type: 'error',
          time: 3000,
        });
      } finally {
        this.isSaving = false;
      }
    },

    openDocument(document) {
      window.open(document.value, '_blank');
    },

    closeModal() {
      this.$emit('update:show', false);
    },

    updateFiscalData(fiscalInfo) {
      if (!fiscalInfo) return;

      this.formData.fiscalData = {
        personType: fiscalInfo.personType || 'PF',
        cpf: fiscalInfo.cpf || '',
        firstName: fiscalInfo.firstName || '',
        lastName: fiscalInfo.lastName || '',
        cnpj: fiscalInfo.cnpj || '',
        companyName: fiscalInfo.companyName || '',
        tradeName: fiscalInfo.tradeName || '',
      };
    },
  }
};
</script>

<style scoped>
.v-dialog > .v-card {
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.v-tab {
  text-transform: none;
  letter-spacing: normal;
}

.v-tab--active {
  font-weight: 600;
}

@media (max-width: 600px) {
  .v-tab {
    min-width: auto;
    padding: 0 8px;
  }
  
  .v-tab .v-icon + span {
    display: none;
  }
}
</style>