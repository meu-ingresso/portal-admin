<template>
  <div class="required-doc-wrapper">
    <!-- Overlay for closing drawer -->
    <div v-if="showDocumentDialog" class="drawer-overlay" @click="closeDocumentDialog"></div>

    <v-navigation-drawer :value="showDocumentDialog" fixed right :width="isMobile ? '100%' : '600'" class="doc-drawer"
      @input="$emit('update:showDocumentDialog', $event)">
      <v-sheet class="d-flex flex-column fill-height">
        <!-- Drawer Header -->
        <v-toolbar flat dense class="flex-shrink-0 drawer-header">
          <div class="d-flex align-center">
            <span class="modalTitle">Dados Cadastrais</span>
          </div>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDocumentDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <!-- Warning Disclaimer -->
        <v-sheet class="pa-4 flex-shrink-0">
          <div class="d-flex align-start">
            <v-icon color="warning" class="mr-3">mdi-alert-circle</v-icon>
            <div>
              <p class="text-subtitle-1 font-weight-medium mb-2">NOTAS FISCAIS</p>
              <p class="text-body-2 mb-0">
                A partir de agora, <strong>todas as notas fiscais</strong> dos seus eventos e conteúdos digitais, em
                andamento e futuros, <strong>serão emitidas para os dados cadastrados</strong> nessa etapa.
              </p>
            </div>
          </div>
        </v-sheet>

        <!-- Rejection Disclaimer (if applicable) -->
        <v-sheet v-if="rejectionReason" class="pa-4 error lighten-4 flex-shrink-0">
          <div class="d-flex align-start">
            <v-icon color="error" class="mr-3">mdi-close-circle</v-icon>
            <div>
              <p class="text-subtitle-1 font-weight-medium mb-2">DADOS REJEITADOS</p>
              <p class="text-body-2">{{ rejectionReason }}</p>
            </div>
          </div>
        </v-sheet>

        <!-- Scrollable Content Area -->
        <div class="drawer-scrollable-content flex-grow-1 overflow-auto">
          <v-stepper v-model="currentStep" class="elevation-0">
            <!-- Stepper Header -->
            <v-stepper-header class="stepper-header-sticky">
              <v-stepper-step :complete="currentStep > 1" :step="1" :editable="isStepComplete(1)"
                @click="isStepComplete(1) && (currentStep = 1)">
                Dados Pessoais
              </v-stepper-step>
              <v-stepper-step :complete="currentStep > 2" :step="2" :editable="isStepComplete(1)"
                @click="isStepComplete(1) && (currentStep = 2)">
                Endereço
              </v-stepper-step>
              <v-stepper-step :complete="currentStep > 3" :step="3" :editable="isStepComplete(1) && isStepComplete(2)"
                @click="isStepComplete(1) && isStepComplete(2) && (currentStep = 3)">
                Chave PIX
              </v-stepper-step>
              <v-stepper-step :step="4" :editable="isStepComplete(1) && isStepComplete(2) && isStepComplete(3)"
                @click="isStepComplete(1) && isStepComplete(2) && isStepComplete(3) && (currentStep = 4)">
                Documentos
              </v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
              <!-- Step 1: Personal Information -->
              <v-stepper-content step="1" class="pa-4 no-border no-margin">
                <v-container>
                  <PersonTypeSelector :model-value="personType" @update:modelValue="personType = $event" />
                  <p class="text-body-1 grey--text text--darken-2 mb-6">
                    Os dados devem ser de acordo com seu documento oficial, sem abreviatura.
                  </p>
                  <PhysicalPersonForm v-if="personType === 'PF'" :cpf="cpf" :first-name="firstName"
                    :last-name="lastName" :form-submitted="formSubmitted" @update:cpf="cpf = $event"
                    @update:firstName="firstName = $event" @update:lastName="lastName = $event" />
                  <LegalPersonForm v-else :cnpj="cnpj" :company-name="companyName" :trade-name="tradeName"
                    :form-submitted="formSubmitted" @update:cnpj="cnpj = $event"
                    @update:companyName="companyName = $event" @update:tradeName="tradeName = $event" />
                </v-container>
              </v-stepper-content>

              <!-- Step 2: Address Information -->
              <v-stepper-content step="2" class="pa-4 no-border no-margin">
                <v-container>
                  <p class="text-body-1 grey--text text--darken-2 mb-6">
                    Informe seu endereço para emissão de nota fiscal e comprovantes.
                  </p>
                  <UserAddressForm :people-id="people.id" />
                </v-container>
              </v-stepper-content>

              <!-- Step 3: Payment Information -->
              <v-stepper-content step="3" class="pa-4 no-border no-margin">
                <v-container>
                  <p class="text-body-1 grey--text text--darken-2 mb-6">
                    Informe sua chave PIX para receber os valores das vendas.
                  </p>
                  <PixKeyForm :pix-key-type="pixKeyType" :pix-key="bankInfo.pixKey" :form-submitted="formSubmitted"
                    @update:pixKeyType="pixKeyType = $event" @update:pixKey="bankInfo.pixKey = $event" />
                </v-container>
              </v-stepper-content>

              <!-- Step 4: Document Upload -->
              <v-stepper-content step="4" class="pa-4 no-border no-margin">
                <v-container>
                  <p class="text-body-1 grey--text text--darken-2 mb-6">
                    Envie os documentos necessários para validação da sua conta:
                  </p>
                  <DocumentUploadForm v-model="documentUploadData" :person-type="personType"
                    @update:modelValue="updateDocumentUploadData" @error="handleDocumentError" />
                </v-container>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </div>

        <!-- Fixed Action Bar -->
        <v-sheet class="drawer-actions pa-2">
          <v-container>
            <div class="d-flex" :class="currentStep === 1 ? 'justify-end' : 'justify-space-between'">
              <DefaultButton v-if="currentStep > 1" outlined text="Voltar" @click="previousStep" />
              <DefaultButton :text="primaryActionText" :disabled="!isStepValid || (currentStep === 4 && isUploading)"
                :is-loading="currentStep === 4 && isUploading" @click="handlePrimaryAction" />
            </div>
          </v-container>
        </v-sheet>
      </v-sheet>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { onFormatCPF, onFormatCNPJ } from '@/utils/formatters';
import { PRODUCER_ROLE } from '@/utils/permissions-config';

const DOCUMENT_TYPES = {
  PF: {
    CNH: 'CNH',
    RG: 'RG'
  },
  PJ: {
    CNPJ: 'CNPJ',
    CONTRATO: 'ContratoSocial'
  }
};

const DOCUMENT_TYPE_MAPPING = {
  CNH: 'document_cnh',
  RG_FRONT: 'document_rg_front',
  RG_BACK: 'document_rg_back',
  CNPJ: 'document_cnpj',
  CONTRATO_SOCIAL: 'document_social_contract'
};

export default {
  props: {
    showDocumentDialog: {
      type: Boolean,
      default: false,
    },
    hasDocumentInfo: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      currentStep: 1,
      personType: 'PF',
      cpf: '',
      firstName: '',
      lastName: '',
      cnpj: '',
      companyName: '',
      tradeName: '',
      formSubmitted: false,
      pixKeyType: 'cpf',
      bankInfo: {
        pixKey: ''
      },
      documentUploadData: {
        pfDocuments: [],
        pjDocument: null,
        documentType: null,
        isValid: false
      },
      isUploading: false,
      documentError: false,
      rejectionReason: '',
      isInitialized: false
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    userId() {
      return this.$auth.user?.id;
    },

    people() {
      return this.$store.getters['user/$people'];
    },

    stepTitle() {
      switch (this.currentStep) {
        case 1:
          return 'Informações pessoais';
        case 2:
          return 'Informações de endereço';
        case 3:
          return 'Informações de pagamento';
        case 4:
          return 'Documentos';
        default:
          return '';
      }
    },

    isStep1Valid() {
      return this.validatePersonalInfo();
    },

    isStep2Valid() {
      return this.$store.getters['userAddress/$addressIsValid'];
    },

    isStep3Valid() {
      return this.validatePixKey(this.bankInfo.pixKey);
    },

    isStep4Valid() {
      return this.documentUploadData?.isValid && !this.documentError;
    },

    isStepValid() {
      const stepValidations = {
        1: this.isStep1Valid,
        2: this.isStep2Valid,
        3: this.isStep3Valid,
        4: this.isStep4Valid
      };
      return stepValidations[this.currentStep] || false;
    },

    currentAddress() {
      return this.$store.getters['userAddress/$address'];
    },

    primaryActionText() {
      return this.currentStep === 4 ? 'Concluir' : 'Continuar';
    },

  },

  watch: {
    showDocumentDialog: {
      immediate: true,
      async handler(newVal) {
        if (newVal && !this.isInitialized) {
          await this.initializeData();
          this.isInitialized = true;
        } else if (!newVal) {
          this.resetPixKeyInfo();
        }
      }
    },

    personType() {
      this.resetDocumentUploadData();
    }
  },

  methods: {

    async initializeData() {
      try {
        await this.fetchDocumentStatus();

        this.loadPersonalInfo();
        this.loadPixInfo();
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        this.handleError('Erro ao carregar dados iniciais');
      }
    },

    validatePersonalInfo() {
      const validations = {
        PF: () => {
          const cpfValid = this.cpf && /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(this.cpf);
          const namesValid = this.firstName?.length >= 2 && this.lastName?.length >= 2;
          return cpfValid && namesValid;
        },
        PJ: () => {
          const cnpjValid = this.cnpj && /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(this.cnpj);
          const namesValid = this.companyName?.length >= 3 && this.tradeName?.length >= 2;
          return cnpjValid && namesValid;
        }
      };

      return validations[this.personType]?.() || false;
    },

    validatePixKey(pixKey) {
      if (!pixKey) return false;

      const validations = {
        cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^(\(\d{2}\)\s\d{5}-\d{4}|\+55\d{2}\d{9})$/,
        random: /.+/
      };

      return validations[this.pixKeyType]?.test(pixKey) || false;
    },

    isStepComplete(stepNumber) {
      const stepValidations = {
        1: this.isStep1Valid,
        2: this.isStep2Valid,
        3: this.isStep3Valid,
        4: this.isStep4Valid
      };
      return stepValidations[stepNumber] || false;
    },

    nextStep() {
      this.formSubmitted = true;

      if (!this.isStepValid) return;

      if (this.currentStep < 4) {
        this.currentStep += 1;
        this.formSubmitted = false;
      }
    },

    previousStep() {
      this.currentStep -= 1;
      this.formSubmitted = false;
    },

    async handleDocumentUpload() {
      try {
        const uploadMethods = {
          PF: this.handlePFDocumentUpload,
          PJ: this.handlePJDocumentUpload
        };

        await uploadMethods[this.personType]();
      } catch (error) {
        console.error('Erro ao fazer upload dos documentos:', error);
        throw new Error('Erro ao fazer upload dos documentos');
      }
    },

    async handlePFDocumentUpload() {
      const { documentType, pfDocuments } = this.documentUploadData;

      if (documentType === DOCUMENT_TYPES.PF.CNH && pfDocuments.length > 0) {
        await this.uploadSingleDocument('CNH', DOCUMENT_TYPE_MAPPING.CNH, pfDocuments[0]);
      } else if (documentType === DOCUMENT_TYPES.PF.RG && pfDocuments.length > 0) {
        const uploads = [];

        if (pfDocuments[0]) {
          uploads.push(this.uploadSingleDocument('RG - Frente', DOCUMENT_TYPE_MAPPING.RG_FRONT, pfDocuments[0]));
        }

        if (pfDocuments[1]) {
          uploads.push(this.uploadSingleDocument('RG - Verso', DOCUMENT_TYPE_MAPPING.RG_BACK, pfDocuments[1]));
        }

        await Promise.all(uploads);
      }
    },

    async handlePJDocumentUpload() {
      const { documentType, pjDocument } = this.documentUploadData;
      if (!pjDocument) return;

      const isContrato = documentType === DOCUMENT_TYPES.PJ.CONTRATO;
      const docType = isContrato ? DOCUMENT_TYPE_MAPPING.CONTRATO_SOCIAL : DOCUMENT_TYPE_MAPPING.CNPJ;
      const docName = isContrato ? 'Contrato Social' : 'Cartão CNPJ';

      await this.uploadSingleDocument(docName, docType, pjDocument);
    },

    async uploadSingleDocument(name, type, file) {
      const document = await this.$store.dispatch('userDocuments/createUserDocument', {
        name,
        type,
        userId: this.userId
      });

      await this.$store.dispatch('userDocuments/uploadUserDocument', {
        documentFile: file,
        attachmentId: document.id,
      });
    },

    // Métodos de Gerenciamento de Estado
    async saveUserData() {
      if (!this.isStepValid) return;

      try {
        this.isUploading = true;

        await Promise.all([
          this.savePersonalInfoAsJson(),
          this.handleDocumentUpload(),
          this.savePixInformation(),
          this.saveAddressInfo(),
          this.handleAccountVerification()
        ]);

        await this.updateUserRole();
        await this.updateEventStatus();

        this.showSuccessMessage();
        this.$emit('saved-user-data');

      } catch (error) {
        console.error('Erro ao salvar dados do usuário:', error);
        this.handleError('Erro ao salvar informações');
      } finally {
        this.isUploading = false;
      }
    },

    async handleAccountVerification() {
      try {
        const verificationStatus = await this.$store.dispatch('userDocuments/getAccountVerificationStatus', this.userId);
        if (verificationStatus) {
          await this.$store.dispatch('userDocuments/deleteUserDocument', {
            attachmentId: verificationStatus.id
          });
        }

        const rejectionReason = await this.$store.dispatch('userDocuments/getRejectionReason', this.userId);
        if (rejectionReason) {
          await this.$store.dispatch('userDocuments/deleteUserDocument', {
            attachmentId: rejectionReason.id
          });
        }
      } catch (error) {
        console.error('Erro ao remover verificação de conta:', error);
      }
    },

    async saveAddressInfo() {
      let addressId = this.currentAddress?.id;

      if (addressId) {
        await this.$store.dispatch('userAddress/updateUserAddress', {
          addressId,
          data: { ...this.currentAddress }
        });
      } else {
        addressId = await this.$store.dispatch('userAddress/createUserAddress', {
          ...this.currentAddress
        });
      }

      await this.$store.dispatch('user/updatePeople', {
        id: this.people.id,
        address_id: addressId
      });
    },

    async updateEventStatus() {
      await this.$store.dispatch('event/updatePromoterEventsFromStatusToStatus', {
        userId: this.userId,
        fromStatus: 'Aguardando',
        toStatus: 'Em Análise'
      });
    },

    async updateUserRole() {
      try {
        const { success, data } = await this.$store.dispatch('user/getRoleByName', PRODUCER_ROLE);
        if (!success) throw new Error('Erro ao buscar o cargo de produtor');

        await this.$store.dispatch('user/updateUser', {
          id: this.userId,
          role_id: data.id
        });
      } catch (error) {
        console.error('Erro ao atualizar cargo do usuário:', error);
        throw error;
      }
    },

    // Métodos de UI
    handlePrimaryAction() {
      if (this.currentStep === 4) {
        this.saveUserData();
      } else {
        this.nextStep();
      }
    },

    showSuccessMessage() {
      this.$store.dispatch('toast/setToast', {
        text: 'Informações salvas com sucesso!',
        type: 'success',
        time: 5000,
      });
    },

    handleError(message) {
      this.$store.dispatch('toast/setToast', {
        text: message,
        type: 'error',
        time: 5000,
      });
    },

    closeDocumentDialog() {
      this.$emit('close-document-dialog', false);
    },

    // Métodos de Reset
    resetPixKeyInfo() {
      this.bankInfo.pixKey = '';
      this.pixKeyType = 'cpf';
    },

    resetDocumentUploadData() {
      this.documentUploadData = {
        pfDocuments: [],
        pjDocument: null,
        documentType: null,
        isValid: false
      };
      this.documentError = false;
    },

    // Métodos de Carregamento de Dados
    async fetchDocumentStatus() {
      await this.$store.dispatch('userDocuments/fetchDocumentStatus', this.userId);
      const rejectionDoc = this.$store.getters['userDocuments/$userAttachments'].find(att => att.name === 'documents_rejection');
      this.rejectionReason = rejectionDoc?.value || '';
    },

    loadPersonalInfo() {
      try {
        const personalInfoDoc = this.$store.getters['userDocuments/$userAttachments'].find(att => att.name === 'fiscal_info');
        if (personalInfoDoc?.value) {
          try {
            const personalInfo = JSON.parse(personalInfoDoc.value);

            this.updatePersonalInfoFromJson(personalInfo);
          } catch (error) {
            console.error('Erro ao parsear informações pessoais:', error);
          }
        } else {
          this.updatePersonalInfoFromPeople();
        }
      } catch (error) {
        console.error('Erro ao carregar informações pessoais:', error);
      }
    },

    updatePersonalInfoFromJson(personalInfo) {
      this.personType = personalInfo.personType || 'PF';

      if (this.personType === 'PF') {
        this.cpf = personalInfo.cpf || '';
        this.firstName = personalInfo.firstName || '';
        this.lastName = personalInfo.lastName || '';
      } else {
        this.cnpj = personalInfo.cnpj || '';
        this.companyName = personalInfo.companyName || '';
        this.tradeName = personalInfo.tradeName || '';
      }
    },

    updatePersonalInfoFromPeople() {
      if (!this.people) return;

      this.personType = this.people.person_type || 'PF';
      this.firstName = this.people.first_name || '';
      this.lastName = this.people.last_name || '';
      this.cpf = this.people?.tax ? onFormatCPF(this.people.tax) : '';
      this.cnpj = this.people?.tax ? onFormatCNPJ(this.people.tax) : '';
      this.companyName = this.people.social_name || '';
      this.tradeName = this.people.fantasy_name || '';
    },

    loadPixInfo() {
      const pixInfo = this.$store.getters['userDocuments/$userAttachments'].find(att => att.name === 'pix_key');
      if (pixInfo) {
        this.bankInfo.pixKey = pixInfo.value || '';
        this.pixKeyType = pixInfo.type || 'cpf';
      }
    },

    // Métodos de PIX
    detectPixKeyType() {
      const pixKey = this.bankInfo.pixKey;
      if (!pixKey) return;

      const keyTypes = {
        cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^(\(\d{2}\)\s\d{5}-\d{4}|\+55\d{2}\d{9})$/
      };

      for (const [type, regex] of Object.entries(keyTypes)) {
        if (regex.test(pixKey)) {
          this.pixKeyType = type;
          return;
        }
      }

      this.pixKeyType = 'random';
    },

    async savePixInformation() {
      await this.$store.dispatch('userDocuments/savePixInformation', {
        userId: this.userId,
        pixKey: this.bankInfo.pixKey,
        pixKeyType: this.pixKeyType
      });
    },

    async savePersonalInfoAsJson() {
      const personalInfo = {
        personType: this.personType,
        ...(this.personType === 'PF'
          ? {
            cpf: this.cpf,
            firstName: this.firstName,
            lastName: this.lastName
          }
          : {
            cnpj: this.cnpj,
            companyName: this.companyName,
            tradeName: this.tradeName
          }
        )
      };

      const personalInfoDoc = this.$store.getters['userDocuments/$userAttachments'].find(
        att => att.name === 'fiscal_info'
      );

      if (personalInfoDoc) {
        await this.$store.dispatch('userDocuments/updateUserAttachment', {
          id: personalInfoDoc.id,
          value: JSON.stringify(personalInfo)
        });
      } else {
        await this.$store.dispatch('userDocuments/createUserDocument', {
          name: 'fiscal_info',
          type: 'json',
          userId: this.userId,
          value: JSON.stringify(personalInfo)
        });
      }
    },

    updateDocumentUploadData(data) {
      this.documentUploadData = data;
    },

    handleDocumentError(_message) {
      this.documentError = true;
    },
  }
};
</script>

<style scoped>
.required-doc-wrapper {
  position: relative;
}

.doc-drawer {
  z-index: 1001;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.15);
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.fill-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: 80px;
  /* Space for fixed actions */
}

.drawer-actions {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  z-index: 10;
  flex-shrink: 0;
}

.error.lighten-4 {
  background-color: #FFEBEE;
  border-left: 4px solid #D32F2F;
}

:deep(.v-stepper) {
  background: transparent;
  box-shadow: none !important;
}

.stepper-header-sticky {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 5;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 16px;
}

.no-border {
  border: none !important;
}

.no-margin {
  margin: 0 !important;
}

.drawer-header {
  max-height: 54px !important;
  padding: 8px;
}

:deep(.v-stepper__header) {
  box-shadow: none !important;
  flex-wrap: nowrap;
  height: auto;
  min-height: 48px;
}

:deep(.v-stepper__step) {
  padding: 12px 8px;
}

:deep(.v-stepper__step--editable) {
  cursor: pointer;
}

:deep(.v-stepper__step--editable:hover) {
  background-color: #f5f5f5;
  border-radius: 4px;
}

:deep(.v-stepper__step:not(.v-stepper__step--editable)) {
  cursor: not-allowed;
  opacity: 0.7;
}

:deep(.v-stepper__step__step) {
  margin-right: 8px;
  font-size: 0.9rem;
}

:deep(.v-stepper__label) {
  font-size: 0.9rem;
  font-weight: 500;
}

:deep(.v-divider) {
  border-color: #e0e0e0;
}

@media (max-width: 600px) {
  .doc-drawer {
    border-radius: 0;
  }

  :deep(.v-stepper__header) {
    flex-direction: column;
    align-items: flex-start;
  }

  :deep(.v-stepper__step) {
    width: 100%;
    padding: 12px 16px;
  }

  :deep(.v-divider) {
    display: none;
  }
}
</style>