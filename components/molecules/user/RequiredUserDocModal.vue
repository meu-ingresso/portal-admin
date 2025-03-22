<template>
  <v-dialog :value="showDocumentDialog" persistent max-width="960" :fullscreen="isMobile" @input="$emit('update:showDocumentDialog', $event)">
    <v-card class="d-flex flex-column">
      <v-row no-gutters>
        <v-col cols="12" md="5" class="d-flex flex-column py-8 px-8" :class="{'justify-space-between': !isMobile}">
          <div class="text-center mb-6 mb-md-10">
            <img :src="fingerPrintIcon" alt="Fingerprint Icon" class="fingerprint-icon">
          </div>
          <div>
            <div class="d-flex align-center">
              <div class="template-title primary--text font-weight-bold mr-2">Quase lá!</div>
              <img :src="blueCheckIcon" alt="Blue Check Icon" class="blue-check-icon">
            </div>
            <p class="template-title black--text mb-4 custom-line-height">Para quem devemos enviar o dinheiro das vendas?</p>
            <p class="black--text custom-line-height">
              Atenção: Esses dados são essenciais para processar seus pagamentos, transferir valores das vendas e emitir nota fiscal dos próximos eventos.
            </p>
          </div>
        </v-col>
        
        <v-col cols="12" md="7" class="bg-tertiary py-8 px-8">
          <div class="d-flex justify-end">
            <v-btn icon @click="closeDocumentDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          
          <div class="py-2 py-md-4 user-doc-form">
            <!-- Step 1: Informações pessoais -->
            <div v-if="currentStep === 1">
              <PersonTypeSelector 
                :model-value="personType" 
                @update:modelValue="personType = $event" 
              />
              
              <p class="text-subtitle-1 grey--text mb-6 mb-md-8">
                Os dados devem ser de acordo com seu documento oficial, sem abreviatura.
              </p>
              
              <PhysicalPersonForm
                v-if="personType === 'PF'"
                :cpf="cpf"
                :first-name="firstName"
                :last-name="lastName"
                :form-submitted="formSubmitted"
                @update:cpf="cpf = $event"
                @update:firstName="firstName = $event"
                @update:lastName="lastName = $event"
              />

              <LegalPersonForm
                v-else
                :cnpj="cnpj"
                :company-name="companyName"
                :trade-name="tradeName"
                :form-submitted="formSubmitted"
                @update:cnpj="cnpj = $event"
                @update:companyName="companyName = $event"
                @update:tradeName="tradeName = $event"
              />
            </div>

            <!-- Step 2: Informações de endereço -->
            <div v-else-if="currentStep === 2">
              <UserAddressForm />
            </div>

            <!-- Step 3: Informações para recebimento -->
            <div v-else-if="currentStep === 3">
              <PixKeyForm
                :pix-key-type="pixKeyType"
                :pix-key="bankInfo.pixKey"
                :form-submitted="formSubmitted"
                @update:pixKeyType="pixKeyType = $event"
                @update:pixKey="bankInfo.pixKey = $event"
              />
            </div>

            <!-- Step 4: Upload de documentos -->
            <div v-else>
              <DocumentUploadForm
                v-model="documentUploadData"
                :person-type="personType"
                @error="handleDocumentError"
              />
            </div>
          </div>

          <div class="d-flex" :class="currentStep === 1 ? 'justify-end' : 'justify-space-between'">
            <DefaultButton 
              v-if="currentStep > 1"
              text="Voltar" 
              outlined
              @click="previousStep" 
            />
            <DefaultButton 
              :text="currentStep === 4 ? 'Concluir' : 'Continuar'" 
              color="primary"
              :disabled="!isStepValid || isUploading"
              :is-loading="isUploading"
              @click="nextStep" 
            />
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { toast, userDocuments, event, user, auth, userAddress } from '@/store';

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
      currentStep: 4,
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
      documentError: false
    };
  },
  computed: {
    fingerPrintIcon() {
      return require(`~/assets/images/fingerprint_icon.svg`);
    },

    blueCheckIcon() {
      return require(`~/assets/images/blue_check_icon.svg`);
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    userId() {
      return this.$cookies.get('user_id');
    },

    peopleId() {
      return this.$cookies.get('people_id');
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
      if (this.personType === 'PF') {
        return this.cpf && /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(this.cpf) && 
               this.firstName && this.firstName.length >= 2 &&
               this.lastName && this.lastName.length >= 2;
      } else {
        return this.cnpj && /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(this.cnpj) &&
               this.companyName && this.companyName.length >= 3 &&
               this.tradeName && this.tradeName.length >= 2;
      }
    },

    isStep2Valid() {
      return userAddress.$addressIsValid;
    },

    isStep3Valid() {
      const pixKeyValid = this.validatePixKey(this.bankInfo.pixKey);
      return this.pixKeyType && this.bankInfo.pixKey && pixKeyValid;
    },

    isStep4Valid() {
      return this.documentUploadData && this.documentUploadData.isValid && !this.documentError;
    },

    isStepValid() {
      switch (this.currentStep) {
        case 1:
          return this.isStep1Valid;
        case 2:
          return this.isStep2Valid;
        case 3:
          return this.isStep3Valid;
        case 4:
          return this.isStep4Valid;
        default:
          return false;
      }
    },

    documentTypeKey() {
      if (!this.documentUploadData || !this.documentUploadData.documentType) {
        return this.personType === 'PJ' ? 'document_cnpj' : 'document_identification';
      }
      
      // Mapeamento do tipo de documento para chave de tipo usada na API
      const typeMapping = {
        'CNH': 'document_cnh',
        'RG': 'document_rg',
        'CNPJ': 'document_cnpj',
        'ContratoSocial': 'document_social_contract'
      };
      
      return typeMapping[this.documentUploadData.documentType] || 'document_identification';
    },

    currentAddress() {
      return userAddress.$address;
    }
  },
  watch: {
    personType() {
      // Reset document upload data when person type changes
      this.documentUploadData = {
        pfDocuments: [],
        pjDocument: null,
        documentType: null,
        isValid: false
      };
      this.documentError = false;
    }
  },
  created() {
    if (this.hasDocumentInfo?.personType) {
      this.personType = this.hasDocumentInfo.personType;
    }
    
    if (this.hasDocumentInfo?.bankInfo?.pixKey) {
      this.bankInfo.pixKey = this.hasDocumentInfo.bankInfo.pixKey;
      this.detectPixKeyType();
    }

    // Inicializa os campos de nome e sobrenome a partir do nome completo, se disponível
    if (this.hasDocumentInfo?.fullName) {
      const nameParts = this.hasDocumentInfo.fullName.split(' ');
      if (nameParts.length > 0) {
        this.firstName = nameParts[0];
        this.lastName = nameParts.slice(1).join(' ');
      }
    }

    // Carrega os dados de endereço do usuário se disponível
    if (this.peopleId) {
      // userAddress.fetchUserAddress(this.peopleId);
    }
  },
  methods: {
    handleDocumentError(_message) {
      this.documentError = true;
    },
    
    nextStep() {
      this.formSubmitted = true;
      
      if (!this.isStepValid) {
        return;
      }
      
      if (this.currentStep < 4) {
        this.currentStep += 1;
        this.formSubmitted = false;
        
      } else {
        this.saveUserData();
      }
    },

    previousStep() {
      this.currentStep -= 1;
      this.formSubmitted = false;
    },
    
    async saveUserData() {
      if (!this.isStepValid) {
        return;
      }
      
      try {
        this.isUploading = true;

        // Faz o upload dos documentos
        await this.uploadDocuments();

        userDocuments.updateDocumentInfo({ personType: this.personType });
        
        // Atualizada a forma de salvar as informações de PIX
        await userDocuments.savePixInformation({
          userId: this.userId,
          pixKey: this.bankInfo.pixKey,
          pixKeyType: this.pixKeyType
        });

        // Salva os dados de endereço do usuário
        if (this.currentAddress && this.currentAddress.id) {
          // Atualiza endereço existente
          await userAddress.updateUserAddress(this.currentAddress.id, {
            ...this.currentAddress,
            // Garantir que o status do CEP seja preservado
            isApiZipcode: this.currentAddress.isApiZipcode
          });
        } else {
          // Cria um novo endereço
          await userAddress.createUserAddress({
            ...this.currentAddress,
            // Garantir que o status do CEP seja preservado
            isApiZipcode: this.currentAddress.isApiZipcode
          });
        }
        

        await event.fetchAndUpdateEventsAfterUserDocuments(this.userId);

        // 3. Atualiza o nome do usuário no cookie

        if (this.personType === 'PF') {
          auth.updateUserName({
            first: this.firstName,
            last: this.lastName,
          });
        } else {
          auth.updateUserName({
            first: this.companyName,
            last: this.tradeName,
          });
        }
    
        // 4. Atualiza tipo de pessoa e nome completo da base
        const peopleData = {
          id: this.peopleId,
          person_type: this.personType,
          address_id: this.currentAddress.id
        };
        
        if (this.personType === 'PF') {
          // Para PF continua usando first_name e last_name
          Object.assign(peopleData, {
            tax: this.cpf,
            first_name: this.firstName,
            last_name: this.lastName
          });
        } else {
          // Para PJ usa os novos campos social_name e fantasy_name
          Object.assign(peopleData, {
            tax: this.cnpj,
            social_name: this.companyName,
            fantasy_name: this.tradeName
          });
        }
        
        await user.updatePeople(peopleData);
        
        // 5. Mostra a mensagem de sucesso
        toast.setToast({
          text: 'Informações salvas com sucesso!',
          type: 'success',
          time: 5000,
        });

        // 6. Fecha o dialog
        this.$emit('saved-user-data');

      } catch (error) {
        console.error('Erro ao salvar dados do usuário:', error);
        
        toast.setToast({
          text: 'Erro ao salvar informações. Por favor, tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isUploading = false;
      }
    },

    async uploadDocuments() {
      try {
        if (this.personType === 'PF') {
          // Upload de documentos para pessoa física
          if (this.documentUploadData.documentType === 'CNH' && this.documentUploadData.pfDocuments.length > 0) {
            // Upload da CNH (documento único)
            const attachmentData = {
              name: 'CNH',
              type: 'document_cnh',
              userId: this.userId
            };
            
            const document = await userDocuments.createUserDocument(attachmentData);
            
            await userDocuments.uploadUserDocument({
              documentFile: this.documentUploadData.pfDocuments[0],
              attachmentId: document.id,
            });
          } else if (this.documentUploadData.documentType === 'RG' && this.documentUploadData.pfDocuments.length > 0) {
            // Upload do RG frente
            if (this.documentUploadData.pfDocuments.length > 0) {
              const frontAttachmentData = {
                name: 'RG - Frente',
                type: 'document_rg_front',
                userId: this.userId
              };
              
              const frontDocument = await userDocuments.createUserDocument(frontAttachmentData);
    
              await userDocuments.uploadUserDocument({
                documentFile: this.documentUploadData.pfDocuments[0],
                attachmentId: frontDocument.id,
              });
            }
            
            // Upload do RG verso
            if (this.documentUploadData.pfDocuments.length > 1) {
              const backAttachmentData = {
                name: 'RG - Verso',
                type: 'document_rg_back',
                userId: this.userId
              };
              
              const backDocument = await userDocuments.createUserDocument(backAttachmentData);
              
              await userDocuments.uploadUserDocument({
                documentFile: this.documentUploadData.pfDocuments[1],
                attachmentId: backDocument.id,
              });
            }
          }
        } else {
          // Upload de documento para pessoa jurídica
          const pjDocument = this.documentUploadData.pjDocument;
          if (pjDocument) {
            const docType = this.documentUploadData.documentType === 'CNPJ' ? 'document_cnpj' : 'document_social_contract';
            const docName = this.documentUploadData.documentType === 'CNPJ' ? 'Cartão CNPJ' : 'Contrato Social';
            
            const attachmentData = {
              name: docName,
              type: docType,
              userId: this.userId
            };
            
            const document = await userDocuments.createUserDocument(attachmentData);
            
            await userDocuments.uploadUserDocument({
              documentFile: pjDocument,
              attachmentId: document.id,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao fazer upload dos documentos:', error);
        throw new Error('Erro ao fazer upload dos documentos');
      }
    },

    closeDocumentDialog() {
      this.$emit('close-document-dialog', false);
    },

    detectPixKeyType() {
      const pixKey = this.bankInfo.pixKey;
      if (!pixKey) return;
      
      if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(pixKey)) {
        this.pixKeyType = 'cpf';
      } else if (/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(pixKey)) {
        this.pixKeyType = 'cnpj';
      } else if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pixKey)) {
        this.pixKeyType = 'email';
      } else if (/^\+55\d{2}\d{9}$/.test(pixKey) || /^\(\d{2}\)\s\d{5}-\d{4}$/.test(pixKey)) {
        this.pixKeyType = 'phone';
      } else {
        this.pixKeyType = 'random';
      }
    },

    validatePixKey(pixKey) {
      if (!pixKey) return false;
      
      switch (this.pixKeyType) {
        case 'cpf':
          return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(pixKey);
        case 'cnpj':
          return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(pixKey);
        case 'email':
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pixKey);
        case 'phone':
          return /^\(\d{2}\)\s\d{5}-\d{4}$/.test(pixKey) || /^\+55\d{2}\d{9}$/.test(pixKey);
        case 'random':
          return pixKey.length > 0;
        default:
          return false;
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

.user-doc-form {
  display: flex;
  flex-direction: column;
  min-height: 465px;
}

.step-indicator {
  align-items: center;
}

.fingerprint-icon {
  width: 120px;
  height: 120px;
  max-width: 100%;
}

.blue-check-icon {
  width: 28px;
  height: 28px;
  max-width: 100%;
}

.custom-line-height {
  line-height: 1.2;
}
</style>