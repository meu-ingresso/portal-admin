<template>
  <v-dialog :value="showDocumentDialog" persistent max-width="600" @input="$emit('update:showDocumentDialog', $event)">
    <v-card>
      <v-card-title class="headline primary white--text">
        Quase lá! Só falta +1 passo para começar a vender!
      </v-card-title>
      <v-card-text class="pt-4">
        <p>Para que possamos processar seu pagamento e transferir os valores das vendas, precisamos das seguintes informações:</p>
        
        <div v-if="hasDocumentInfo?.personType === 'PJ'" class="mt-4">
          <p><strong>Documento necessário:</strong> Cartão CNPJ ou Contrato Social</p>
        </div>
        <div v-else class="mt-4">
          <p><strong>Documento necessário:</strong> CNH, Passaporte ou RG</p>
        </div>

        <div class="mt-4">
          <p><strong>Dados bancários:</strong></p>
          <ul>
            <li>Banco</li>
            <li>Agência</li>
            <li>Conta</li>
            <li>CPF/CNPJ do titular</li>
            <li>Chave PIX</li>
          </ul>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
        <DefaultButton 
          text="Completar depois" 
          outlined
          @click="closeDocumentDialog" 
        />
        <DefaultButton 
          text="Completar agora" 
          @click="goToCompleteCadastro" 
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
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
  methods: {
    goToCompleteCadastro() {
      this.$emit('complete-now');
    },
    closeDocumentDialog() {
      this.$emit('close-document-dialog');
    },
  },
};
</script>