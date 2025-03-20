<template>
  <v-container>
    <v-card class="mb-4 pa-4">
      <v-card-title class="d-flex flex-column align-start">
        <p class="modalTitle">Documentos cadastrais</p>
        <p class="my-2 subtitle-1">
          Para que possamos processar seu pagamento e transferir os valores das vendas, precisamos das seguintes informações:
        </p>

      </v-card-title>
      
      <v-divider></v-divider>
      <v-card-text>

        <!-- Tipo de Pessoa -->
        <v-row>
          <v-col cols="12">
            <h3 class="mb-3"><v-icon left>mdi-account</v-icon>Tipo de Pessoa</h3>
            <v-radio-group v-model="tempPersonType" row class="mb-4" @change="confirmPersonTypeChange">
              <v-radio label="Pessoa Física" value="PF"></v-radio>
              <v-radio label="Pessoa Jurídica" value="PJ"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>

        <!-- Documentos Necessários -->
        <v-row>
          <v-col cols="12">
            <h3 class="mb-3"><v-icon left>mdi-file-document</v-icon>Documento necessário</h3>
            <div v-if="personType === 'PJ'" class="mb-3">
              <p>Faça o upload do Cartão CNPJ ou Contrato Social:</p>
            </div>
            <div v-else class="mb-3">
              <p>Faça o upload de um dos seguintes documentos: CNH, Passaporte ou RG:</p>
            </div>
          </v-col>
        </v-row>

        <v-row dense class="d-flex">
          <v-col cols="12" :md="existingDocumentUrl ? 9 : 12">
            <v-file-input
              v-model="documentFile"
              :label="documentLabel"
              outlined
              :accept="acceptedFileTypes"
              :error-messages="documentFileErrors"
              :rules="[v => (!!v || !!existingDocumentUrl) || 'Documento obrigatório']"
              validate-on-blur
              required
              @change="onDocumentChange"
            ></v-file-input>
          </v-col>
          <v-col v-if="existingDocumentUrl" cols="12" md="3" class="d-flex align-center">
            <v-btn
              color="primary"
              outlined
              icon
              :href="existingDocumentUrl"
              target="_blank"
              title="Visualizar documento"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              color="error"
              outlined
              icon
              title="Remover documento"
              @click="removeDocument"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Dados Bancários -->
        <v-row>
          <v-col cols="12">
            <h3 class="mt-6 mb-3"><v-icon left>mdi-bank</v-icon>Dados Bancários</h3>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="bankInfo.bank"
              label="Banco"
              outlined
              dense
              :items="bankOptions"
              item-text="name"
              item-value="code"
              :error-messages="bankErrors"
              :rules="[v => !!v || 'Banco obrigatório']"
              validate-on-blur
              required
            >
              <template #selection="{ item }">
                {{ item.code }} - {{ item.name }}
              </template>
              <template #item="{ item }">
                {{ item.code }} - {{ item.name }}
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="bankInfo.agency"
              label="Agência (sem dígito)"
              outlined
              dense
              :error-messages="agencyErrors"
              :rules="[
                v => !!v || 'Agência obrigatória',
                v => /^\d+$/.test(v) || 'Somente números'
              ]"
              validate-on-blur
              required
              maxlength="5"
              counter="5"
              :append-icon="agencyValid ? 'mdi-check' : 'mdi-alert'"
              :append-icon-color="agencyValid ? 'success' : 'error'"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="bankInfo.account"
              label="Conta (com dígito)"
              outlined
              dense
              :error-messages="accountErrors"
              :rules="[
                v => !!v || 'Conta obrigatória',
                v => /^\d+-\d$/.test(v) || 'Formato: número-dígito (ex: 12345-6)'
              ]"
              validate-on-blur
              required
              placeholder="12345-6"
              :append-icon="accountValid ? 'mdi-check' : 'mdi-alert'"
              :append-icon-color="accountValid ? 'success' : 'error'"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="bankInfo.accountType"
              label="Tipo de Conta"
              outlined
              dense
              :items="accountTypeOptions"
              :error-messages="accountTypeErrors"
              :rules="[v => !!v || 'Tipo de conta obrigatório']"
              validate-on-blur
              required
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="bankInfo.ownerDocument"
              :label="personType === 'PJ' ? 'CNPJ do titular' : 'CPF do titular'"
              outlined
              dense
              :error-messages="ownerDocumentErrors"
              :rules="[v => !!v || 'Documento do titular obrigatório']"
              validate-on-blur
              required
              :mask="personType === 'PJ' ? '##.###.###/####-##' : '###.###.###-##'"
              :placeholder="personType === 'PJ' ? '12.345.678/0001-90' : '123.456.789-01'"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="pixKeyType"
              label="Tipo de chave PIX"
              outlined
              dense
              :items="pixKeyTypeOptions"
              :error-messages="pixKeyTypeErrors"
              :rules="[v => !!v || 'Tipo de chave PIX obrigatório']"
              validate-on-blur
              required
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="bankInfo.pixKey"
              label="Chave PIX"
              outlined
              dense
              :error-messages="pixKeyErrors"
              :rules="[
                v => !!v || 'Chave PIX obrigatória',
                v => validatePixKey(v) || getPixKeyErrorMessage()
              ]"
              validate-on-blur
              required
              :mask="getPixKeyMask()"
              :placeholder="getPixKeyPlaceholder()"
              :append-icon="pixKeyValid ? 'mdi-check' : 'mdi-alert'"
              :append-icon-color="pixKeyValid ? 'success' : 'error'"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="d-flex justify-space-between px-4 pb-4">
        <DefaultButton
          text="Voltar"
          outlined
          class="mr-2"
          @click="$router.go(-1)"
        />
        <DefaultButton
          text="Salvar"
          :disabled="isSaving || !isFormValid"
          :loading="isSaving"
          @click="saveUserData"
        />
      </v-card-actions>
    </v-card>


    <!-- Confirmar mudança de tipo de pessoa -->
    <ConfirmDialog
      v-model="showConfirmPersonTypeChange"
      title="Alterar tipo de pessoa"
      :message="confirmPersonTypeMessage"
      confirm-text="Sim, alterar"
      cancel-text="Cancelar"
      @confirm="handlePersonTypeChangeConfirmed"
      @cancel="handlePersonTypeChangeRejected"
    />

    <Toast />
  </v-container>
</template>

<script>
import { toast, user, userDocuments, event } from '@/store';

export default {

  data() {
    return {
      personType: 'PF',
      tempPersonType: 'PF',
      originalPersonType: null,
      documentFile: null,
      existingAttachments: {},
      isSaving: false,
      formSubmitted: false,
      pixKeyType: 'cpf',
      bankInfo: {
        bank: '',
        agency: '',
        account: '',
        accountType: '',
        ownerDocument: '',
        pixKey: '',
      },
      showConfirmPersonTypeChange: false,
      bankOptions: [
        { code: '001', name: 'Banco do Brasil' },
        { code: '033', name: 'Santander' },
        { code: '104', name: 'Caixa Econômica Federal' },
        { code: '237', name: 'Bradesco' },
        { code: '260', name: 'Nubank' },
        { code: '341', name: 'Itaú' },
        { code: '380', name: 'PicPay' },
        { code: '077', name: 'Inter' },
        { code: '336', name: 'C6 Bank' },
        { code: '748', name: 'Sicredi' },
        { code: '756', name: 'Sicoob' },
        { code: '655', name: 'Votorantim' },
        { code: '212', name: 'Banco Original' },
        { code: '422', name: 'Safra' },
      ],
      accountTypeOptions: ['Corrente', 'Poupança'],
      pixKeyTypeOptions: [
        { value: 'cpf', text: 'CPF' },
        { value: 'cnpj', text: 'CNPJ' },
        { value: 'email', text: 'E-mail' },
        { value: 'phone', text: 'Telefone' },
        { value: 'random', text: 'Chave aleatória' },
      ],
    };
  },

  computed: {

    documentInfo() {
      return userDocuments.$documentInfo;
    },

    documentLabel() {
      return this.existingDocumentUrl
        ? this.personType === 'PJ'
          ? 'Cartão CNPJ ou Contrato Social (já enviado)'
          : 'CNH, Passaporte ou RG (já enviado)'
        : this.personType === 'PJ'
        ? 'Cartão CNPJ ou Contrato Social'
        : 'CNH, Passaporte ou RG';
    },

    acceptedFileTypes() {
      return '.pdf,.jpg,.jpeg,.png';
    },

    existingDocumentUrl() {
      return this.existingAttachments[this.documentKey]?.value;
    },

    existingDocumentId() {
      return this.existingAttachments[this.documentKey]?.id;
    },

    documentKey() {
      return this.personType === 'PJ' ? 'document_cnpj' : 'document_identification';
    },

    isFormValid() {
      const hasValidDocument = this.existingDocumentUrl || this.documentFile;
      return (
        hasValidDocument &&
        this.bankInfo.bank &&
        this.validateAgency(this.bankInfo.agency) &&
        this.bankInfo.account &&
        this.validateAccount(this.bankInfo.account) &&
        this.bankInfo.accountType &&
        this.bankInfo.ownerDocument &&
        this.pixKeyType &&
        this.bankInfo.pixKey &&
        this.validatePixKey(this.bankInfo.pixKey)
      );
    },

    userId() {
      return this.$cookies.get('user_id');
    },

    peopleId() {
      return this.$cookies.get('people_id');
    },

    agencyValid() {
      return this.bankInfo.agency && /^\d+$/.test(this.bankInfo.agency);
    },

    accountValid() {
      return this.bankInfo.account && /^\d+-\d$/.test(this.bankInfo.account);
    },

    pixKeyValid() {
      return this.bankInfo.pixKey && this.validatePixKey(this.bankInfo.pixKey);
    },

    documentFileErrors() {
      return this.formSubmitted && !this.documentFile && !this.existingDocumentUrl
        ? ['Documento obrigatório']
        : [];
    },

    bankErrors() {
      return this.formSubmitted && !this.bankInfo.bank ? ['Banco obrigatório'] : [];
    },

    agencyErrors() {
      if (!this.formSubmitted) return [];
      if (!this.bankInfo.agency) return ['Agência obrigatória'];
      if (!this.validateAgency(this.bankInfo.agency)) return ['Somente números'];
      return [];
    },

    accountErrors() {
      if (!this.formSubmitted) return [];
      if (!this.bankInfo.account) return ['Conta obrigatória'];
      if (!this.validateAccount(this.bankInfo.account))
        return ['Formato: número-dígito (ex: 12345-6)'];
      return [];
    },

    accountTypeErrors() {
      return this.formSubmitted && !this.bankInfo.accountType ? ['Tipo de conta obrigatório'] : [];
    },

    ownerDocumentErrors() {
      return this.formSubmitted && !this.bankInfo.ownerDocument
        ? ['Documento do titular obrigatório']
        : [];
    },

    pixKeyTypeErrors() {
      return this.formSubmitted && !this.pixKeyType ? ['Tipo de chave PIX obrigatório'] : [];
    },

    pixKeyErrors() {
      if (!this.formSubmitted) return [];
      if (!this.bankInfo.pixKey) return ['Chave PIX obrigatória'];
      if (!this.validatePixKey(this.bankInfo.pixKey)) return [this.getPixKeyErrorMessage()];
      return [];
    },

    confirmPersonTypeMessage() {
      const fromType = this.personType === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica';
      const toType = this.tempPersonType === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica';
      
      return `Você está alterando o tipo de pessoa de ${fromType} para ${toType}. Esta ação irá requerer um novo upload de documento e preenchimento do documento do titular. Deseja continuar?`;
    },

    hasChangedPersonType() {
      return this.originalPersonType !== null && this.originalPersonType !== this.personType;
    },
  },

  watch: {
    hasChangedPersonType: {
      handler(newVal) {
        if (newVal) {
          toast.setToast({
            text: 'Tipo de pessoa alterado. Por favor, envie os novos documentos necessários.',
            type: 'info',
            time: 5000,
          });
        }
      },
      immediate: true,
    },
  },

  async created() {
    try {
      if (!this.userId) {
        toast.setToast({
          text: 'Erro ao identificar usuário. Por favor, faça login novamente.',
          type: 'error',
          time: 5000,
        });
        return;
      }
      await this.fetchDocumentStatus();
      this.originalPersonType = this.personType;
    } catch (error) {
      console.error('Erro ao inicializar componente:', error);
      toast.setToast({
        text: 'Erro ao carregar suas informações. Por favor, tente novamente.',
        type: 'error',
        time: 5000,
      });
    }
  },

  methods: {
    async fetchDocumentStatus() {
      try {
        await userDocuments.fetchDocumentStatus(this.userId);

        // Atualiza o tipo de pessoa
        this.personType = userDocuments.$documentInfo.personType || 'PF';
        this.tempPersonType = this.personType;
        
        // Busca o documento necessário
        const existingDocument = userDocuments.$userAttachments.find(
          (attachment) => attachment.type === this.documentKey
        );

        if (existingDocument && existingDocument.value) {
          this.$set(this.existingAttachments, this.documentKey, existingDocument);
        }

        if (userDocuments.$documentInfo?.bankInfo) {
          this.bankInfo = { ...userDocuments.$documentInfo.bankInfo };
          this.detectPixKeyType();
        }
      } catch (error) {
        console.error('Erro ao buscar status de documentos:', error);
        toast.setToast({
          text: 'Erro ao buscar informações. Por favor, tente novamente.',
          type: 'error',
          time: 5000,
        });
      }
    },

    detectPixKeyType() {
      const pixKey = this.bankInfo.pixKey;
      if (!pixKey) return;
      if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(pixKey)) this.pixKeyType = 'cpf';
      else if (/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(pixKey)) this.pixKeyType = 'cnpj';
      else if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pixKey))
        this.pixKeyType = 'email';
      else if (/^\+55\d{2}\d{9}$/.test(pixKey) || /^\(\d{2}\)\s\d{5}-\d{4}$/.test(pixKey))
        this.pixKeyType = 'phone';
      else this.pixKeyType = 'random';
    },

    onDocumentChange(file) {
      if (file) {
        this.$set(this.existingAttachments, this.documentKey, {
          ...this.existingAttachments[this.documentKey],
          newFile: file,
        });
      }
    },

    removeDocument() {
      this.$set(this.existingAttachments, this.documentKey, {
        ...this.existingAttachments[this.documentKey],
        newFile: null,
      });
    },

    validateAgency(agency) {
      return /^\d+$/.test(agency);
    },

    validateAccount(account) {
      return /^\d+-\d$/.test(account);
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
          return /^\+55\d{2}\d{9}$/.test(pixKey) || /^\(\d{2}\)\s\d{5}-\d{4}$/.test(pixKey);
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

    getPixKeyMask() {
      switch (this.pixKeyType) {
        case 'cpf':
          return '###.###.###-##';
        case 'cnpj':
          return '##.###.###/####-##';
        case 'phone':
          return '(##) #####-####';
        default:
          return '';
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
    },

    async saveUserData() {
      this.formSubmitted = true;

      if (!this.isFormValid) {
        toast.setToast({
          text: 'Por favor, preencha todos os campos obrigatórios corretamente.',
          type: 'error',
          time: 5000,
        });
        return;
      }

      this.isSaving = true;

      try {
        if (!this.userId) {
          toast.setToast({
            text: 'Erro ao identificar usuário. Por favor, faça login novamente.',
            type: 'error',
            time: 5000,
          });
          return;
        }

        userDocuments.updateDocumentInfo({ personType: this.personType });
        userDocuments.updateBankInfo({ ...this.bankInfo });

        let fileUrl = this.existingDocumentUrl;

        if (this.existingAttachments[this.documentKey].newFile) {

          let attachmentId = this.existingDocumentId || this.existingAttachments[this.originalPersonType === 'PF' ? 'document_identification' : 'document_cnpj']?.id;

          if (!attachmentId) {
            const createdAttachment = await userDocuments.createUserDocument({
              name: 'Documentos de cadastro',
              type: this.documentKey,
              userId: this.userId,
            });
            attachmentId = createdAttachment?.id;
          }

          fileUrl = await userDocuments.uploadUserDocument({
            documentFile: this.existingAttachments[this.documentKey].newFile,
            attachmentId,
          });

          if (!fileUrl) throw new Error('Erro ao fazer upload do documento');
        } else if (!fileUrl) {
          toast.setToast({
            text: 'Por favor, faça o upload do documento necessário.',
            type: 'error',
            time: 5000,
          });
          return;
        }

        await userDocuments.saveBankInformation(this.userId);

        await event.fetchAndUpdateEventsAfterUserDocuments(this.userId);

        // Atualiza o tipo de pessoa da base
        user.updatePeople({
          id: this.peopleId,
          person_type: this.personType,
        });

        this.originalPersonType = this.personType;

        toast.setToast({
          text: 'Cadastro atualizado com sucesso!',
          type: 'success',
          time: 5000,
        });


        setTimeout(() => {
          this.$router.push({ name: 'Lista de Eventos' });
        }, 1000);
      } catch (error) {
        console.error('Erro ao salvar dados do usuário:', error);
        toast.setToast({
          text: 'Erro ao enviar os documentos. Por favor, tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isSaving = false;
      }
    },

    confirmPersonTypeChange(newValue) {
      if (newValue !== this.personType) {
        this.showConfirmPersonTypeChange = true;
      }
    },
    
    handlePersonTypeChangeConfirmed() {
      this.personType = this.tempPersonType;
      this.$set(this.existingAttachments, this.documentKey, {
        ...this.existingAttachments[this.documentKey],
        newFile: null,
      });
      
      if (this.originalPersonType !== this.personType) {
        this.bankInfo.ownerDocument = '';
        this.originalPersonType = this.tempPersonType === 'PF' ? 'PJ' : 'PF';
      } else {
        this.bankInfo.ownerDocument = this.documentInfo.bankInfo.ownerDocument;
      }
      
      this.showConfirmPersonTypeChange = false;
      
      toast.setToast({
        text: 'Tipo de pessoa alterado. Por favor, envie os novos documentos necessários.',
        type: 'info',
        time: 5000,
      });
    },
    
    handlePersonTypeChangeRejected() {
      this.tempPersonType = this.personType;
      this.showConfirmPersonTypeChange = false;
    },
  },
};
</script>

<style scoped>
.headline {
  font-weight: bold;
}
</style>