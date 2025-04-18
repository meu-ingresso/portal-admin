<template>
  <div>
    <v-text-field
      v-model="cpfModel"
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
      v-model="firstNameModel"
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
      v-model="lastNameModel"
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
</template>

<script>
import { onFormatCPF } from '@/utils/formatters';

export default {
  props: {
    cpf: {
      type: String,
      default: ''
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    formSubmitted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:cpf', 'update:firstName', 'update:lastName'],
  data() {
    return {
      cpfModel: this.cpf,
      firstNameModel: this.firstName,
      lastNameModel: this.lastName
    };
  },
  computed: {
    cpfValid() {
      return this.cpfModel && this.validateCpf(this.cpfModel);
    },
    
    firstNameValid() {
      return this.firstNameModel && this.firstNameModel.length >= 2;
    },
    
    lastNameValid() {
      return this.lastNameModel && this.lastNameModel.length >= 2;
    },
    
    cpfErrors() {
      if (!this.formSubmitted) return [];
      if (!this.cpfModel) return ['CPF obrigatório'];
      if (!this.validateCpf(this.cpfModel)) return ['CPF inválido (ex: 123.456.789-01)'];
      return [];
    },
    
    firstNameErrors() {
      if (!this.formSubmitted) return [];
      if (!this.firstNameModel) return ['Nome obrigatório'];
      if (this.firstNameModel.length < 2) return ['Nome deve ter pelo menos 2 caracteres'];
      return [];
    },
    
    lastNameErrors() {
      if (!this.formSubmitted) return [];
      if (!this.lastNameModel) return ['Sobrenome obrigatório'];
      if (this.lastNameModel.length < 2) return ['Sobrenome deve ter pelo menos 2 caracteres'];
      return [];
    },
    
    isValid() {
      return this.cpfValid && this.firstNameValid && this.lastNameValid;
    }
  },
  watch: {
    cpf(value) {
      if (!value) return;
      this.formatCPF(value);
    },
    cpfModel(value) {
      if (!value) return;
      this.$emit('update:cpf', value);
    },
    firstName(value) {
      if (!value) return;
      this.firstNameModel = value;
    },
    firstNameModel(value) {
      if (!value) return;
      this.$emit('update:firstName', value);
    },
    lastName(value) {
      if (!value) return;
      this.lastNameModel = value;
    },
    lastNameModel(value) {
      if (!value) return;
      this.$emit('update:lastName', value);
    }
  },
  methods: {
    formatCPF(value) {
      this.cpfModel = onFormatCPF(value);
    },
    
    validateCpf(cpf) {
      return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
    }
  }
};
</script> 