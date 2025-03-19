<template>
  <v-dialog :value="showDocumentDialog" persistent max-width="960" :fullscreen="isMobile" @input="$emit('update:showDocumentDialog', $event)">
    <v-card>
      <v-row no-gutters>
        <v-col cols="5" class="pa-8 d-flex flex-column">
          <div class="text-center mb-10">
            <v-icon size="150" color="primary">mdi-fingerprint</v-icon>
          </div>
          <h1 class="primary--text display-1 mb-6">Quase lá! 🎉</h1>
          <h2 class="black--text text-h4 mb-10">Para quem devemos enviar o dinheiro das vendas?</h2>
          <p class="black--text">
            Atenção: Esses dados são essenciais para processar seus pagamentos, transferir valores das vendas e emitir nota fiscal dos próximos eventos.
          </p>
        </v-col>
        
        <v-col cols="7" class="bg-tertiary pa-8">
          <v-row justify="end">
            <v-btn icon @click="closeDocumentDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          
          <div class="py-4 user-doc-form">
            <!-- Step 1: Informações pessoais -->
            <div v-if="currentStep === 1">
              <div class="d-flex mb-6 align-center">
                <v-checkbox
                  v-model="personType"
                  value="PF"
                  class="mr-8"
                  hide-details
                >
                  <template #label>
                    <span class="text-h6">Pessoa Física</span>
                  </template>
                </v-checkbox>
                
                <v-checkbox
                  v-model="personType"
                  value="PJ"
                  hide-details
                >
                  <template #label>
                    <span class="text-h6">Pessoa Jurídica</span>
                  </template>
                </v-checkbox>
              </div>
              
              <p class="text-subtitle-1 grey--text mb-8">
                Os dados devem ser de acordo com seu documento oficial, sem abreviatura.
              </p>
              
              <div v-if="personType === 'PF'">
                <v-text-field
                  v-model="cpf"
                  label="CPF"
                  outlined
                  hide-details="auto"
                  aria-autocomplete="off"
                  dense
                  class="mb-6"
                  maxlength="14"
                  :error-messages="cpfErrors"
                  :rules="[
                    v => !!v || 'CPF obrigatório',
                    v => validateCpf(v) || 'CPF inválido (ex: 123.456.789-01)'
                  ]"
                  validate-on-blur
                  required
                  placeholder="123.456.789-01"
                  :append-icon="cpfValid ? 'mdi-check' : ''"
                  :append-icon-color="cpfValid ? 'success' : ''"
                  @input="formatCPF"
                ></v-text-field>
                
                <v-text-field
                  v-model="firstName"
                  label="Nome"
                  outlined
                  hide-details="auto"
                  dense 
                  class="mb-6"
                  maxlength="50"
                  :error-messages="firstNameErrors"
                  :rules="[
                    v => !!v || 'Nome obrigatório',
                    v => v.length >= 2 || 'Nome deve ter pelo menos 2 caracteres'
                  ]"
                  validate-on-blur
                  required
                  :append-icon="firstNameValid ? 'mdi-check' : ''"
                  :append-icon-color="firstNameValid ? 'success' : ''"
                ></v-text-field>

                <v-text-field
                  v-model="lastName"
                  label="Sobrenome"
                  outlined
                  hide-details="auto"
                  dense 
                  class="mb-6"
                  maxlength="50"
                  :error-messages="lastNameErrors"
                  :rules="[
                    v => !!v || 'Sobrenome obrigatório',
                    v => v.length >= 2 || 'Sobrenome deve ter pelo menos 2 caracteres'
                  ]"
                  validate-on-blur
                  required
                  :append-icon="lastNameValid ? 'mdi-check' : ''"
                  :append-icon-color="lastNameValid ? 'success' : ''"
                ></v-text-field>
              </div>
              
              <div v-else>
                <v-text-field
                  v-model="cnpj"
                  label="CNPJ"
                  outlined
                  hide-details="auto"
                  aria-autocomplete="off"
                  dense
                  class="mb-6"
                  maxlength="18"
                  :error-messages="cnpjErrors"
                  :rules="[
                    v => !!v || 'CNPJ obrigatório',
                    v => validateCnpj(v) || 'CNPJ inválido (ex: 12.345.678/0001-90)'
                  ]"
                  validate-on-blur
                  required
                  placeholder="12.345.678/0001-90"
                  :append-icon="cnpjValid ? 'mdi-check' : ''"
                  :append-icon-color="cnpjValid ? 'success' : ''"
                  @input="formatCNPJ"
                ></v-text-field>
                
                <v-text-field
                  v-model="companyName"
                  label="Razão Social"
                  outlined
                  hide-details="auto"
                  aria-autocomplete="off"
                  dense
                  class="mb-6"
                  maxlength="100"
                  :error-messages="companyNameErrors"
                  :rules="[
                    v => !!v || 'Razão Social obrigatória',
                    v => v.length >= 3 || 'Razão Social deve ter pelo menos 3 caracteres'
                  ]"
                  validate-on-blur
                  required
                  :append-icon="companyNameValid ? 'mdi-check' : ''"
                  :append-icon-color="companyNameValid ? 'success' : ''"
                ></v-text-field>
                
                <v-text-field
                  v-model="tradeName"
                  label="Nome Fantasia"
                  outlined
                  hide-details="auto"
                  aria-autocomplete="off"
                  dense
                  class="mb-6"
                  maxlength="100"
                  :error-messages="tradeNameErrors"
                  :rules="[
                    v => !!v || 'Nome Fantasia obrigatório',
                    v => v.length >= 2 || 'Nome Fantasia deve ter pelo menos 2 caracteres'
                  ]"
                  validate-on-blur
                  required
                  :append-icon="tradeNameValid ? 'mdi-check' : ''"
                  :append-icon-color="tradeNameValid ? 'success' : ''"
                ></v-text-field>
              </div>
            </div>

            <!-- Step 2: Informações para recebimento -->
            <div v-else-if="currentStep === 2">
              <p class="text-subtitle-1 grey--text mb-8">
                Informe sua chave PIX para receber os valores das vendas.
              </p>
              
              <v-select
                v-model="pixKeyType"
                label="Tipo de chave PIX"
                outlined
                dense
                hide-details="auto"
                class="mb-6"
                :items="pixKeyTypeOptions"
                :error-messages="pixKeyTypeErrors"
                :rules="[v => !!v || 'Tipo de chave PIX obrigatório']"
                validate-on-blur
                required
              ></v-select>
              
              <v-text-field
                v-model="bankInfo.pixKey"
                label="Chave PIX"
                outlined
                aria-autocomplete="off"
                dense
                hide-details="auto"
                class="mb-6"
                :error-messages="pixKeyErrors"
                :rules="[
                  v => !!v || 'Chave PIX obrigatória',
                  v => validatePixKey(v) || getPixKeyErrorMessage()
                ]"
                :maxlength="pixKeyMaxLength"
                validate-on-blur
                required
                :placeholder="getPixKeyPlaceholder()"
                :append-icon="pixKeyValid ? 'mdi-check' : ''"
                :append-icon-color="pixKeyValid ? 'success' : ''"
                @input="formatPixKey"
              ></v-text-field>
            </div>

            <!-- Step 3: Upload de documentos -->
            <div v-else>
              <p class="text-subtitle-1 grey--text mb-4">
                Envie os documentos necessários para validação da sua conta:
              </p>
              <p class="text-subtitle-1 grey--text mb-4">
                <span v-if="personType === 'PJ'">Cartão CNPJ ou Contrato Social</span>
                <span v-else>CNH, RG (frente e verso) ou Passaporte</span>
              </p>

              <!-- Documentos para PJ -->
              <div v-if="personType === 'PJ'">
                <p class="text-caption mb-4">
                  Apenas arquivo em formato PDF é aceito.
                </p>

                <v-file-input
                  v-model="documentFiles.pj"
                  label="Upload do documento"
                  outlined
                  dense
                  hide-details="auto"
                  class="mb-4"
                  accept=".pdf"
                  :error-messages="documentPjErrors"
                  :rules="[
                    v => !!v || 'Documento obrigatório',
                    v => validatePjDocumentType(v) || 'Apenas arquivos PDF são permitidos'
                  ]"
                  validate-on-blur
                  required
                  show-size
                  prepend-icon="mdi-file-document-outline"
                  @change="onPjDocumentChange"
                ></v-file-input>

                <v-alert
                  v-if="documentPjInvalid"
                  dense
                  type="error"
                  class="mt-2"
                >
                  Apenas arquivos PDF são permitidos para pessoa jurídica.
                </v-alert>
              </div>

              <!-- Documentos para PF -->
              <div v-else>
                <p class="text-caption mb-4">
                  São aceitos arquivos nos formatos PDF, JPG, JPEG ou PNG.
                </p>

                <v-file-input
                  v-model="documentFiles.pfFront"
                  label="Frente do documento"
                  outlined
                  dense
                  hide-details="auto"
                  class="mb-4"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :error-messages="documentPfFrontErrors"
                  :rules="[
                    v => !!v || 'Frente do documento obrigatória',
                    v => validatePfDocumentType(v) || 'Apenas arquivos PDF, JPG, JPEG ou PNG são permitidos'
                  ]"
                  validate-on-blur
                  required
                  show-size
                  prepend-icon="mdi-file-document-outline"
                  @change="onPfDocumentChange"
                ></v-file-input>

                <v-file-input
                  v-model="documentFiles.pfBack"
                  label="Verso do documento (se necessário)"
                  outlined
                  dense
                  hide-details="auto"
                  class="mb-4"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :error-messages="documentPfBackErrors"
                  :rules="[
                    v => validatePfDocumentType(v) || 'Apenas arquivos PDF, JPG, JPEG ou PNG são permitidos'
                  ]"
                  validate-on-blur
                  show-size
                  prepend-icon="mdi-file-document-outline"
                  @change="onPfDocumentChange"
                ></v-file-input>

                <v-alert
                  v-if="documentPfInvalid"
                  dense
                  type="error"
                  class="mt-2"
                >
                  Apenas arquivos PDF, JPG, JPEG ou PNG são permitidos.
                </v-alert>
              </div>
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
              :text="currentStep === 3 ? 'Concluir' : 'Continuar'" 
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
import { onFormatCPF, onFormatCNPJ } from '@/utils/formatters';
import { toast, userDocuments, event, user, auth } from '@/store';

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
      pixKeyTypeOptions: [
        { value: 'cpf', text: 'CPF' },
        { value: 'cnpj', text: 'CNPJ' },
        { value: 'email', text: 'E-mail' },
        { value: 'phone', text: 'Telefone' },
        { value: 'random', text: 'Chave aleatória' }
      ],
      documentFiles: {
        pj: null,
        pfFront: null,
        pfBack: null
      },
      documentPjInvalid: false,
      documentPfInvalid: false,
      isUploading: false,
      uploadedDocuments: {
        pfFront: null,
        pfBack: null,
        pj: null
      }
    };
  },
  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    userId() {
      return this.$cookies.get('user_id');
    },

    peopleId() {
      return this.$cookies.get('people_id');
    },

    pixKeyMaxLength() {
      switch (this.pixKeyType) {
        case 'phone':
          return 15;
        case 'cpf':
          return 14;
        case 'cnpj':
          return 18;
        case 'email':
          return 255;
        case 'random':
          return 255;
        default:
          return 0;
      }
    },

    stepTitle() {
      switch (this.currentStep) {
        case 1:
          return 'Informações pessoais';
        case 2:
          return 'Informações de pagamento';
        case 3:
          return 'Documentos';
        default:
          return '';
      }
    },

    isStep1Valid() {
      if (this.personType === 'PF') {
        return this.cpfValid && this.firstNameValid && this.lastNameValid;
      } else {
        return this.cnpjValid && this.companyNameValid && this.tradeNameValid;
      }
    },

    isStep2Valid() {
      return this.pixKeyType && this.bankInfo.pixKey && this.validatePixKey(this.bankInfo.pixKey);
    },

    isStep3Valid() {
      if (this.personType === 'PJ') {
        return this.documentFiles.pj && this.validatePjDocumentType(this.documentFiles.pj);
      } else {
        return this.documentFiles.pfFront && 
               this.validatePfDocumentType(this.documentFiles.pfFront) && 
               (this.documentFiles.pfBack ? this.validatePfDocumentType(this.documentFiles.pfBack) : true);
      }
    },

    isStepValid() {
      switch (this.currentStep) {
        case 1:
          return this.isStep1Valid;
        case 2:
          return this.isStep2Valid;
        case 3:
          return this.isStep3Valid;
        default:
          return false;
      }
    },
    
    cpfValid() {
      return this.cpf && this.validateCpf(this.cpf);
    },
    
    firstNameValid() {
      return this.firstName && this.firstName.length >= 2;
    },
    
    lastNameValid() {
      return this.lastName && this.lastName.length >= 2;
    },
    
    cnpjValid() {
      return this.cnpj && this.validateCnpj(this.cnpj);
    },
    
    companyNameValid() {
      return this.companyName && this.companyName.length >= 3;
    },
    
    tradeNameValid() {
      return this.tradeName && this.tradeName.length >= 2;
    },

    pixKeyValid() {
      return this.bankInfo.pixKey && this.validatePixKey(this.bankInfo.pixKey);
    },
    
    cpfErrors() {
      if (!this.formSubmitted) return [];
      if (!this.cpf) return ['CPF obrigatório'];
      if (!this.validateCpf(this.cpf)) return ['CPF inválido (ex: 123.456.789-01)'];
      return [];
    },
    
    firstNameErrors() {
      if (!this.formSubmitted) return [];
      if (!this.firstName) return ['Nome obrigatório'];
      if (this.firstName.length < 2) return ['Nome deve ter pelo menos 2 caracteres'];
      return [];
    },
    
    lastNameErrors() {
      if (!this.formSubmitted) return [];
      if (!this.lastName) return ['Sobrenome obrigatório'];
      if (this.lastName.length < 2) return ['Sobrenome deve ter pelo menos 2 caracteres'];
      return [];
    },
    
    cnpjErrors() {
      if (!this.formSubmitted) return [];
      if (!this.cnpj) return ['CNPJ obrigatório'];
      if (!this.validateCnpj(this.cnpj)) return ['CNPJ inválido (ex: 12.345.678/0001-90)'];
      return [];
    },
    
    companyNameErrors() {
      if (!this.formSubmitted) return [];
      if (!this.companyName) return ['Razão Social obrigatória'];
      if (this.companyName.length < 3) return ['Razão Social deve ter pelo menos 3 caracteres'];
      return [];
    },
    
    tradeNameErrors() {
      if (!this.formSubmitted) return [];
      if (!this.tradeName) return ['Nome Fantasia obrigatório'];
      if (this.tradeName.length < 2) return ['Nome Fantasia deve ter pelo menos 2 caracteres'];
      return [];
    },

    pixKeyTypeErrors() {
      if (!this.formSubmitted) return [];
      if (!this.pixKeyType) return ['Tipo de chave PIX obrigatório'];
      return [];
    },

    pixKeyErrors() {
      if (!this.formSubmitted) return [];
      if (!this.bankInfo.pixKey) return ['Chave PIX obrigatória'];
      if (!this.validatePixKey(this.bankInfo.pixKey)) return [this.getPixKeyErrorMessage()];
      return [];
    },

    documentPjErrors() {
      if (!this.formSubmitted) return [];
      if (!this.documentFiles.pj) return ['Documento obrigatório'];
      if (!this.validatePjDocumentType(this.documentFiles.pj)) return ['Apenas arquivos PDF são permitidos'];
      return [];
    },

    documentPfFrontErrors() {
      if (!this.formSubmitted) return [];
      if (!this.documentFiles.pfFront) return ['Frente do documento obrigatória'];
      if (!this.validatePfDocumentType(this.documentFiles.pfFront)) return ['Apenas arquivos PDF, JPG, JPEG ou PNG são permitidos'];
      return [];
    },

    documentPfBackErrors() {
      if (!this.formSubmitted) return [];
      if (this.documentFiles.pfBack && !this.validatePfDocumentType(this.documentFiles.pfBack)) {
        return ['Apenas arquivos PDF, JPG, JPEG ou PNG são permitidos'];
      }
      return [];
    },

    documentTypeKey() {
      return this.personType === 'PJ' ? 'document_cnpj' : 'document_identification';
    }
  },
  watch: {
    personType() {
      this.documentFiles = {
        pj: null,
        pfFront: null,
        pfBack: null
      };
      this.documentPjInvalid = false;
      this.documentPfInvalid = false;
      this.uploadedDocuments = {
        pfFront: null,
        pfBack: null,
        pj: null
      };
    },
    pixKeyType() {
      this.bankInfo.pixKey = '';
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
  },
  methods: {
    formatCPF(value) {
      this.cpf = onFormatCPF(value);
    },
    
    formatCNPJ(value) {
      this.cnpj = onFormatCNPJ(value);
    },

    formatPixKey(value) {
      if (!value) return;

      switch (this.pixKeyType) {
        case 'cpf':
          this.bankInfo.pixKey = onFormatCPF(value);
          break;
        case 'cnpj':
          this.bankInfo.pixKey = onFormatCNPJ(value);
          break;
        case 'phone':
          this.bankInfo.pixKey = this.formatPhone(value);
          break;
        default:
          this.bankInfo.pixKey = value;
      }
    },

    formatPhone(value) {
      if (!value) return '';
      
      let cleaned = value.replace(/\D/g, '');

      if (cleaned.length > 2) {
        cleaned = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
      }
      if (cleaned.length > 10) {
        cleaned = `${cleaned.substring(0, 10)}-${cleaned.substring(10)}`;
      }
      
      return cleaned;
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

    onPjDocumentChange(file) {
      if (!file) {
        this.documentPjInvalid = false;
        return;
      }
      
      this.documentPjInvalid = !this.validatePjDocumentType(file);
    },

    onPfDocumentChange() {
      const frontFile = this.documentFiles.pfFront;
      const backFile = this.documentFiles.pfBack;

      this.documentPfInvalid = (frontFile && !this.validatePfDocumentType(frontFile)) || 
                               (backFile && !this.validatePfDocumentType(backFile));
    },

    validatePjDocumentType(file) {
      if (!file) return true;
      
      const fileName = file.name || '';
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      return fileExtension === 'pdf';
    },

    validatePfDocumentType(file) {
      if (!file) return true;
      
      const fileName = file.name || '';
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      
      return allowedExtensions.includes(fileExtension);
    },
    
    nextStep() {
      this.formSubmitted = true;
      
      if (!this.isStepValid) {
        return;
      }
      
      if (this.currentStep < 3) {
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

        // 1. Cria o objeto de informações do documento
        const documentInfo = this.createDocumentInfo();
        
        // 2. Faz o upload dos documentos
        await this.uploadDocuments();

        userDocuments.updateDocumentInfo({ personType: this.personType });
        userDocuments.updateBankInfo({ ...documentInfo.bankInfo });

        await userDocuments.saveBankInformation(this.userId);

        await event.fetchAndUpdateEventsAfterUserDocuments(this.userId);
    

        // 3. Atualiza tipo de pessoa e nome completo da base
        await user.updatePeople({
          id: this.peopleId,
          person_type: this.personType,
          first_name: this.firstName,
          last_name: this.lastName,
        });

        // 4. Atualiza o nome do usuário no cookie
        auth.updateUserName({
          first_name: this.firstName,
          last_name: this.lastName,
        });
        
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

    createDocumentInfo() {
      // Cria o objeto de informações do documento com base nos dados do formulário
      const documentInfo = {
        personType: this.personType,
        bankInfo: {
          pixKey: this.bankInfo.pixKey,
          pixKeyType: this.pixKeyType
        }
      };

      // Adiciona as informações específicas da pessoa
      if (this.personType === 'PF') {
        documentInfo.cpf = this.cpf;
        documentInfo.firstName = this.firstName;
        documentInfo.lastName = this.lastName;
        // Garante que sempre tenhamos um nome completo formado pelos dois campos
        documentInfo.fullName = this.lastName ? 
          `${this.firstName} ${this.lastName}` : 
          this.firstName;
      } else {
        documentInfo.cnpj = this.cnpj;
        documentInfo.companyName = this.companyName;
        documentInfo.tradeName = this.tradeName;
      }

      return documentInfo;
    },

    async uploadDocuments() {
      try {
        if (this.personType === 'PJ' && this.documentFiles.pj) {

          const attachmentData = {
            name: 'Documento PJ',
            type: 'document_cnpj',
            userId: this.userId
          };
          
          const document = await userDocuments.createUserDocument(attachmentData);
          
          this.uploadedDocuments.pj = await userDocuments.uploadUserDocument({
            documentFile: this.documentFiles.pj,
            attachmentId: document.id,
          });

        } else if (this.personType === 'PF') {

          if (this.documentFiles.pfFront) {
            const frontAttachmentData = {
              name: 'Documento PF - Frente',
              type: 'document_identification_front',
              userId: this.userId
            };
            
            const frontDocument = await userDocuments.createUserDocument(frontAttachmentData);

            this.uploadedDocuments.pfFront = await userDocuments.uploadUserDocument({
              documentFile: this.documentFiles.pfFront,
              attachmentId: frontDocument.id,
            });
          }
          

          if (this.documentFiles.pfBack) {
            const backAttachmentData = {
              name: 'Documento PF - Verso',
              type: 'document_identification_back',
              userId: this.userId
            };
            
            const backDocument = await userDocuments.createUserDocument(backAttachmentData);
            this.uploadedDocuments.pfBack = await userDocuments.uploadUserDocument({
              documentFile: this.documentFiles.pfBack,
              attachmentId: backDocument.id,
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

    validateCpf(cpf) {
      return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
    },

    validateCnpj(cnpj) {
      return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
    },

    validatePixKey(pixKey) {
      if (!pixKey) return false;
      
      switch (this.pixKeyType) {
        case 'cpf':
          return this.validateCpf(pixKey);
        case 'cnpj':
          return this.validateCnpj(pixKey);
        case 'email':
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pixKey);
        case 'phone':
          return /^\(\d{2}\)\s\d{5}-\d{4}$/.test(pixKey) || /^\+55\d{2}\d{9}$/.test(pixKey);
        case 'random':
          return pixKey.length > 0;
        default:
          return false;
      }
    },

    getPixKeyErrorMessage() {
      switch (this.pixKeyType) {
        case 'cpf':
          return 'CPF inválido (ex: 123.456.789-01)';
        case 'cnpj':
          return 'CNPJ inválido (ex: 12.345.678/0001-90)';
        case 'email':
          return 'E-mail inválido (ex: nome@exemplo.com)';
        case 'phone':
          return 'Telefone inválido (ex: (11) 98765-4321)';
        case 'random':
          return 'Chave PIX obrigatória';
        default:
          return 'Chave PIX inválida';
      }
    },

    getPixKeyPlaceholder() {
      switch (this.pixKeyType) {
        case 'cpf':
          return '123.456.789-01';
        case 'cnpj':
          return '12.345.678/0001-90';
        case 'email':
          return 'nome@exemplo.com';
        case 'phone':
          return '(11) 98765-4321';
        case 'random':
          return 'Chave PIX aleatória';
        default:
          return '';
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
  height: 84%;
}

.step-indicator {
  align-items: center;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step-dot.active {
  background-color: var(--primary);
  color: white;
}

.step-line {
  height: 2px;
  width: 60px;
  background-color: #e0e0e0;
  margin: 0 8px;
}
</style>