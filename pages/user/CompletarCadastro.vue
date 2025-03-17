<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="headline primary white--text">
        Complete seu cadastro para receber pagamentos
      </v-card-title>
      <v-card-text>
        <p class="mt-4 mb-6">
          Para que possamos processar seu pagamento e transferir os valores das vendas, precisamos das seguintes informações:
        </p>

        <!-- Tipo de Pessoa -->
        <v-radio-group v-model="personType" row class="mb-4">
          <v-radio label="Pessoa Física" value="PF"></v-radio>
          <v-radio label="Pessoa Jurídica" value="PJ"></v-radio>
        </v-radio-group>

        <!-- Documentos Necessários -->
        <h3 class="mb-3">Documento necessário</h3>
        <div v-if="personType === 'PJ'">
          <p>Faça o upload do Cartão CNPJ ou Contrato Social:</p>
        </div>
        <div v-else>
          <p>Faça o upload de um dos seguintes documentos: CNH, Passaporte ou RG:</p>
        </div>

        <v-file-input
          v-model="documentFile"
          :label="documentLabel"
          prepend-icon="mdi-file-document-outline"
          outlined
          :accept="acceptedFileTypes"
          @change="onDocumentChange"
        ></v-file-input>

        <!-- Dados Bancários -->
        <h3 class="mt-6 mb-3">Dados Bancários</h3>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="bankInfo.bank"
              label="Banco"
              outlined
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="bankInfo.agency"
              label="Agência"
              outlined
              required
            ></v-text-field>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="bankInfo.account"
              label="Conta"
              outlined
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="bankInfo.accountType"
              label="Tipo de Conta"
              outlined
              required
            ></v-text-field>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="bankInfo.ownerDocument"
              :label="personType === 'PJ' ? 'CNPJ do titular' : 'CPF do titular'"
              outlined
              required
              :mask="personType === 'PJ' ? '##.###.###/####-##' : '###.###.###-##'"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="bankInfo.pixKey"
              label="Chave PIX"
              outlined
              required
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <DefaultButton
          text="Voltar"
          outlined
          class="mr-2"
          @click="$router.go(-1)"
        />
        <DefaultButton
          text="Enviar documentos"
          :disabled="isSaving || !isFormValid"
          :loading="isSaving"
          @click="saveUserData"
        />
      </v-card-actions>
    </v-card>
    
    <Toast />
  </v-container>
</template>

<script>
import { toast, userDocuments } from '@/store';

export default {
  layout: 'default',
  
  data() {
    return {
      personType: 'PF',
      documentFile: null,
      isSaving: false,
      bankInfo: {
        bank: '',
        agency: '',
        account: '',
        accountType: '',
        ownerDocument: '',
        pixKey: '',
      },
    };
  },
  
  computed: {
    documentLabel() {
      return this.personType === 'PJ' 
        ? 'Cartão CNPJ ou Contrato Social' 
        : 'CNH, Passaporte ou RG';
    },
    
    acceptedFileTypes() {
      return '.pdf,.jpg,.jpeg,.png';
    },
    
    isFormValid() {
      return this.documentFile && 
        this.bankInfo.bank &&
        this.bankInfo.agency &&
        this.bankInfo.account &&
        this.bankInfo.accountType &&
        this.bankInfo.ownerDocument &&
        this.bankInfo.pixKey;
    },
  },
  
  async mounted() {
    // Fetch document status when component mounts
    await this.fetchDocumentStatus();
  },
  
  methods: {
    async fetchDocumentStatus() {
      try {
        await userDocuments.fetchDocumentStatus();
        
        // Populate form with store data
        this.personType = userDocuments.$documentInfo.personType;
        this.bankInfo = {
          bank: userDocuments.$documentInfo.bankInfo.bank,
          agency: userDocuments.$documentInfo.bankInfo.agency,
          account: userDocuments.$documentInfo.bankInfo.account,
          accountType: userDocuments.$documentInfo.bankInfo.account_type,
          ownerDocument: userDocuments.$documentInfo.bankInfo.owner_document,
          pixKey: userDocuments.$documentInfo.bankInfo.pix_key,
        };
      } catch (error) {
        console.error('Erro ao buscar status de documentos:', error);
        
        toast.setToast({
          text: 'Erro ao buscar informações. Por favor, tente novamente.',
          type: 'danger',
          time: 5000,
        });
      }
    },
    
    onDocumentChange(file) {
      this.documentFile = file;
    },
    
    async saveUserData() {
      if (!this.isFormValid) return;
      
      this.isSaving = true;
      
      try {
        // Update store with current form values
        userDocuments.updateDocumentInfo({ personType: this.personType });
        userDocuments.updateBankInfo({
          bank: this.bankInfo.bank,
          agency: this.bankInfo.agency,
          account: this.bankInfo.account,
          account_type: this.bankInfo.accountType,
          owner_document: this.bankInfo.ownerDocument,
          pix_key: this.bankInfo.pixKey,
        });
        
        // Step 1: Create document attachment record with empty URL
        await userDocuments.createUserDocument({
          name: 'user_document',
          type: this.personType === 'PJ' ? 'cnpj' : 'identification',
        });
        
        // Step 2: Upload document file and get URL
        await userDocuments.uploadUserDocument({
          documentFile: this.documentFile
        });
        
        // Step 3: Update attachment record with URL
        await userDocuments.updateUserDocument();
        
        // Step 4: Save bank information
        await userDocuments.saveBankInformation();
        
        toast.setToast({
          text: 'Documentos enviados com sucesso! Seu evento está em análise.',
          type: 'success',
          time: 5000,
        });
        
        // Redirect to events page
        setTimeout(() => {
          this.$router.push({ name: 'Lista de Eventos' });
        }, 1000);
        
      } catch (error) {
        console.error('Erro ao salvar dados do usuário:', error);
        
        toast.setToast({
          text: 'Erro ao enviar os documentos. Por favor, tente novamente.',
          type: 'danger',
          time: 5000,
        });
      } finally {
        this.isSaving = false;
      }
    }
  }
};
</script>

<style scoped>
.headline {
  font-weight: bold;
}
</style> 