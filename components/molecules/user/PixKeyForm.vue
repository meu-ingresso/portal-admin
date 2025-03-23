<template>
  <div>
    <p class="text-subtitle-1 grey--text mb-8">
      Informe sua chave PIX para receber os valores das vendas.
    </p>
    
    <v-select
      v-model="pixKeyTypeModel"
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
      v-model="pixKeyModel"
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
</template>

<script>
import { onFormatCPF, onFormatCNPJ } from '@/utils/formatters';

export default {
  props: {
    pixKeyType: {
      type: String,
      default: 'cpf'
    },
    pixKey: {
      type: String,
      default: ''
    },
    formSubmitted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:pixKeyType', 'update:pixKey'],
  data() {
    return {
      pixKeyTypeModel: this.pixKeyType,
      pixKeyModel: this.pixKey,
      pixKeyTypeOptions: [
        { value: 'cpf', text: 'CPF' },
        { value: 'cnpj', text: 'CNPJ' },
        { value: 'email', text: 'E-mail' },
        { value: 'phone', text: 'Telefone' },
        { value: 'random', text: 'Chave aleatória' }
      ]
    };
  },
  computed: {
    pixKeyMaxLength() {
      switch (this.pixKeyTypeModel) {
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
    
    pixKeyValid() {
      return this.pixKeyModel && this.validatePixKey(this.pixKeyModel);
    },
    
    pixKeyTypeErrors() {
      if (!this.formSubmitted) return [];
      if (!this.pixKeyTypeModel) return ['Tipo de chave PIX obrigatório'];
      return [];
    },

    pixKeyErrors() {
      if (!this.formSubmitted) return [];
      if (!this.pixKeyModel) return ['Chave PIX obrigatória'];
      if (!this.validatePixKey(this.pixKeyModel)) return [this.getPixKeyErrorMessage()];
      return [];
    },
    
    isValid() {
      return this.pixKeyTypeModel && this.pixKeyModel && this.validatePixKey(this.pixKeyModel);
    }
  },
  watch: {
    pixKeyType(value) {
      this.pixKeyTypeModel = value;
    },
    pixKeyTypeModel(value) {
      this.$emit('update:pixKeyType', value);
      // Limpa o campo da chave quando o tipo muda
      if (this.pixKeyModel) {
        this.pixKeyModel = '';
        this.$emit('update:pixKey', '');
      }
    },
    pixKey(value) {
      this.pixKeyModel = value;
    },
    pixKeyModel(value) {
      this.$emit('update:pixKey', value);
    }
  },
  methods: {
    formatPixKey(value) {
      if (!value) return;

      switch (this.pixKeyTypeModel) {
        case 'cpf':
          this.pixKeyModel = onFormatCPF(value);
          break;
        case 'cnpj':
          this.pixKeyModel = onFormatCNPJ(value);
          break;
        case 'phone':
          this.pixKeyModel = this.formatPhone(value);
          break;
        default:
          this.pixKeyModel = value;
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

    validatePixKey(pixKey) {
      if (!pixKey) return false;
      
      switch (this.pixKeyTypeModel) {
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
    },

    getPixKeyErrorMessage() {
      switch (this.pixKeyTypeModel) {
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
      switch (this.pixKeyTypeModel) {
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