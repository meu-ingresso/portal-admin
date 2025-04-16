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

      <v-card-text class="px-6">
        <v-form ref="form" v-model="isFormValid">
          <!-- Informações Pessoais -->
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-bold mb-4">Informações Pessoais</div>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.email"
                label="E-mail"
                outlined
                dense
                disabled
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.firstName"
                label="Nome"
                outlined
                dense
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.lastName"
                label="Sobrenome"
                outlined
                dense
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <!-- Informações Fiscais -->
          <v-row class="mt-6">
            <v-col cols="12">
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1 font-weight-bold">Dados Fiscais</div>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon
                      v-bind="attrs"
                      color="red"
                      v-on="on"
                      @click="confirmClearUserData"
                    >
                      mdi-account-remove
                    </v-icon>
                  </template>
                  Limpar Dados Fiscais
                </v-tooltip>
              </div>
            </v-col>

            <!-- Tipo de Pessoa -->
            <v-col cols="12">
              <PersonTypeSelector 
                :model-value="formData.fiscalData.personType" 
                class="mb-4" 
                @update:modelValue="updatePersonType"
              />
            </v-col>

            <!-- Dados Fiscais - PF -->
            <template v-if="formData.fiscalData.personType === 'PF'">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.fiscalData.cpf"
                  label="CPF"
                  :rules="[v => !!v || 'CPF é obrigatório']"
                  mask="###.###.###-##"
                  outlined
                  dense
                  hide-details="auto"
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
                />
              </v-col>
            </template>

            <!-- Dados Fiscais - PJ -->
            <template v-else>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.fiscalData.cnpj"
                  label="CNPJ"
                  :rules="[v => !!v || 'CNPJ é obrigatório']"
                  mask="##.###.###/####-##"
                  outlined
                  dense
                  hide-details="auto"
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
                />
              </v-col>
            </template>
          </v-row>

          <PixKeyForm
            form-inline
            :pix-key-type="formData.pix.type"
            :pix-key="formData.pix.key"
            @update:pixKeyType="formData.pix.type = $event"
            @update:pixKey="formData.pix.key = $event"
          />

          <!-- Endereço -->
          <v-row>
            <v-col cols="12">
              <div class="d-flex justify-space-between align-center mb-2">
                <h3 class="text-subtitle-1 font-weight-bold">Endereço</h3>
              </div>
            </v-col>
            <v-col cols="12" class="px-3 py-0">
              <UserAddressForm />
            </v-col>
          </v-row>

          <!-- Informações de Documentos -->
          <v-row class="mt-4">
            <v-col cols="12">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold mb-1">Documentos</h3>
                  <p class="text-caption grey--text">Documentos enviados para completude cadastral</p>
                </div>

                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon
                      v-bind="attrs"
                      color="red"
                      v-on="on"
                      @click="confirmClearDocuments"
                      >
                        mdi-file-remove
                      </v-icon>
                    </template>
                    Limpar Documentos
                  </v-tooltip>
              </div>
            </v-col>
            
            <!-- Lista de documentos -->
            <v-col v-if="documentAttachments && documentAttachments.length > 0" cols="12">
              <v-simple-table>
                <template #default>
                  <thead>
                    <tr>
                      <th class="text-left">Nome</th>
                      <th class="text-left">Data de Envio</th>
                      <th class="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(doc, index) in documentAttachments" :key="index">
                      <td>{{ getDocumentType(doc.name) }}</td>
                      <td>{{ formatDateTimeWithTimezone(doc.created_at) }}</td>
                      <td>
                        <div class="d-flex justify-end">
                          <v-btn
                            small
                            icon
                            color="primary"
                            @click="openDocument(doc)"
                          >
                            <v-icon small>mdi-eye</v-icon>
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
            
            <v-col v-else cols="12">
              <v-alert
                type="info"
                text
                dense
              >
                Nenhum documento enviado pelo usuário.
              </v-alert>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
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
      isFormValid: true,
      isSaving: false,
      showConfirmClear: false,
      showConfirmClearData: false,
      showConfirmDeleteDoc: false,
      selectedDocument: null,
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

      const notAcceptedAttachments = ['pix_key', 'profile_image', 'contact_info', 'fiscal_info', 'rejection_reason', 'account_verification'];

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
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser) {
          this.initializeForm(newUser);
          this.fetchUserDocuments();
        }
      }
    }
  },

  methods: {
    formatDateToCustomString,
    formatDateTimeWithTimezone,

    initializeForm(userData) {
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
          key: '',
          type: ''
        }
      };

      // Inicializa dados fiscais se disponíveis
      if (this.fiscalInfo) {
        const fiscalInfo = this.fiscalInfo;
        this.formData.fiscalData = {
          personType: fiscalInfo.personType || 'PF',
          cpf: fiscalInfo.cpf || '',
          firstName: fiscalInfo.firstName || '',
          lastName: fiscalInfo.lastName || '',
          cnpj: fiscalInfo.cnpj || '',
          companyName: fiscalInfo.companyName || '',
          tradeName: fiscalInfo.tradeName || '',
        };
      }

      userAddress.updateAddress({
        ...this.formData.address
      });      
    },

    async fetchUserDocuments() {
      try {
        await userDocuments.fetchDocumentStatus(this.user.id);

        // Atualiza os dados da chave PIX que vem como documento
        this.formData.pix.key = this.pixInfo?.value || '';
        this.formData.pix.type = this.pixInfo?.type || '';
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

        // Atualiza informações pessoais
        const peopleData = {
          id: this.user.people.id,
          first_name: this.formData.firstName,
          last_name: this.formData.lastName,
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

        // Atualiza os dados de people
        await user.updatePeople(peopleData);

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

    async copyPixKey() {
      if (!this.pixInfo?.value) return;
      
      try {
        await navigator.clipboard.writeText(this.pixInfo.value);
        toast.setToast({
          text: 'Chave PIX copiada com sucesso!',
          type: 'success',
          time: 2000,
        });
      } catch (error) {
        console.error('Erro ao copiar chave PIX:', error);
        toast.setToast({
          text: 'Erro ao copiar chave PIX',
          type: 'error',
          time: 2000,
        });
      }
    }
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>