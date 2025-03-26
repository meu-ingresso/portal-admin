<template>
  <div>
    <v-text-field
      v-model="cnpjModel"
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
      v-model="companyNameModel"
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
        v => v?.length >= 3 || 'Razão Social deve ter pelo menos 3 caracteres'
      ]"
      validate-on-blur
      required
      :append-icon="companyNameValid ? 'mdi-check' : ''"
      :append-icon-color="companyNameValid ? 'success' : ''"
    ></v-text-field>
    
    <v-text-field
      v-model="tradeNameModel"
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
        v => v?.length >= 2 || 'Nome Fantasia deve ter pelo menos 2 caracteres'
      ]"
      validate-on-blur
      required
      :append-icon="tradeNameValid ? 'mdi-check' : ''"
      :append-icon-color="tradeNameValid ? 'success' : ''"
    ></v-text-field>
  </div>
</template>

<script>
import { onFormatCNPJ } from '@/utils/formatters';

export default {
  props: {
    cnpj: {
      type: String,
      default: ''
    },
    companyName: {
      type: String,
      default: ''
    },
    tradeName: {
      type: String,
      default: ''
    },
    formSubmitted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:cnpj', 'update:companyName', 'update:tradeName'],
  data() {
    return {
      cnpjModel: this.cnpj,
      companyNameModel: this.companyName,
      tradeNameModel: this.tradeName
    };
  },
  computed: {
    cnpjValid() {
      return this.cnpjModel && this.validateCnpj(this.cnpjModel);
    },
    
    companyNameValid() {
      return this.companyNameModel && this.companyNameModel?.length >= 3;
    },
    
    tradeNameValid() {
      return this.tradeNameModel && this.tradeNameModel?.length >= 2;
    },
    
    cnpjErrors() {
      if (!this.formSubmitted) return [];
      if (!this.cnpjModel) return ['CNPJ obrigatório'];
      if (!this.validateCnpj(this.cnpjModel)) return ['CNPJ inválido (ex: 12.345.678/0001-90)'];
      return [];
    },
    
    companyNameErrors() {
      if (!this.formSubmitted) return [];
      if (!this.companyNameModel) return ['Razão Social obrigatória'];
      if (this.companyNameModel?.length < 3) return ['Razão Social deve ter pelo menos 3 caracteres'];
      return [];
    },
    
    tradeNameErrors() {
      if (!this.formSubmitted) return [];
      if (!this.tradeNameModel) return ['Nome Fantasia obrigatório'];
      if (this.tradeNameModel?.length < 2) return ['Nome Fantasia deve ter pelo menos 2 caracteres'];
      return [];
    },
    
    isValid() {
      return this.cnpjValid && this.companyNameValid && this.tradeNameValid;
    }
  },
  watch: {
    cnpj(value) {
      this.cnpjModel = value;
    },
    cnpjModel(value) {
      this.$emit('update:cnpj', value);
    },
    companyName(value) {
      this.companyNameModel = value;
    },
    companyNameModel(value) {
      this.$emit('update:companyName', value);
    },
    tradeName(value) {
      this.tradeNameModel = value;
    },
    tradeNameModel(value) {
      this.$emit('update:tradeName', value);
    }
  },
  methods: {
    formatCNPJ(value) {
      this.cnpjModel = onFormatCNPJ(value);
    },
    
    validateCnpj(cnpj) {
      return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
    }
  }
};
</script> 