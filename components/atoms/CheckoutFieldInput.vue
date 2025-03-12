<template>
  <div class="checkout-field-wrapper">
    <!-- Text Field -->
    <v-text-field
      v-if="field.type === 'TEXTO'"
      v-model="fieldValue"
      :label="field.name"
      :hint="field.help_text"
      :required="field.required"
      outlined
      dense
      :rules="field.required ? [required] : []"
      @input="handleInput"
    ></v-text-field>
    
    <!-- Email Field -->
    <v-text-field
      v-else-if="field.type === 'EMAIL'"
      v-model="fieldValue"
      :label="field.name"
      :hint="field.help_text"
      :required="field.required"
      type="email"
      outlined
      dense
      :rules="field.required ? [required, emailRule] : [emailRule]"
      @input="handleInput"
    ></v-text-field>
    
    <!-- CPF Field -->
    <v-text-field
      v-else-if="field.type === 'CPF'"
      v-model="fieldValue"
      v-mask="'###.###.###-##'"
      :label="field.name"
      :hint="field.help_text"
      :required="field.required"
      outlined
      dense
      :rules="field.required ? [required, cpfRule] : [cpfRule]"
      @input="handleInput"
    ></v-text-field>
    
    <!-- CNPJ Field -->
    <v-text-field
      v-else-if="field.type === 'CNPJ'"
      v-model="fieldValue"
      v-mask="'##.###.###/####-##'"
      :label="field.name"
      :hint="field.help_text"
      :required="field.required"
      outlined
      dense
      :rules="field.required ? [required, cnpjRule] : [cnpjRule]"
      @input="handleInput"
    ></v-text-field>
    
    <!-- Dropdown Menu Field -->
    <v-select
      v-else-if="field.type === 'MENU_DROPDOWN'"
      v-model="fieldValue"
      :label="field.name"
      :hint="field.help_text"
      :required="field.required"
      :items="field.options || []"
      item-text="label"
      item-value="value"
      outlined
      dense
      :rules="field.required ? [required] : []"
      @input="handleInput"
    ></v-select>
    
    <!-- Multi Checkbox Field -->
    <div v-else-if="field.type === 'MULTI_CHECKBOX'">
      <p class="field-label mb-2">
        {{ field.name }} <span v-if="field.required" class="required">*</span>
        <small v-if="field.help_text" class="help-text ml-2">{{ field.help_text }}</small>
      </p>
      <v-checkbox
        v-for="option in field.options || []"
        :key="option.id"
        v-model="selectedOptions"
        :label="option.label"
        :value="option.value"
        hide-details
        class="mt-0 pt-0"
        dense
        @change="handleCheckboxChange"
      ></v-checkbox>
      <div v-if="field.required && showCheckboxError" class="error-text mt-1">
        Selecione pelo menos uma opção
      </div>
    </div>

    <!-- Campo não suportado -->
    <div v-else class="unsupported-field">
      <p>Tipo de campo não suportado: {{ field.type }}</p>
    </div>
  </div>
</template>

<script>
import { mask } from 'vue-the-mask';

export default {
  name: 'CheckoutFieldInput',
  directives: {
    mask
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    value: {
      type: [String, Array, Number, Boolean],
      default: null
    }
  },
  data() {
    return {
      fieldValue: this.value || '',
      selectedOptions: this.field.type === 'MULTI_CHECKBOX' ? (this.value || []) : [],
      showCheckboxError: false
    };
  },
  computed: {
    required() {
      return v => !!v || `${this.field.name} é obrigatório`;
    },
    emailRule() {
      return v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Email inválido';
    },
    cpfRule() {
      return v => {
        if (!v) return true;
        
        // Remove caracteres não numéricos
        const cpf = v.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) return 'CPF inválido';
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return 'CPF inválido';
        
        // Validação do primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
          soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return 'CPF inválido';
        
        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
          soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return 'CPF inválido';
        
        return true;
      };
    },
    cnpjRule() {
      return v => {
        if (!v) return true;
        
        // Remove caracteres não numéricos
        const cnpj = v.replace(/\D/g, '');
        
        // Verifica se tem 14 dígitos
        if (cnpj.length !== 14) return 'CNPJ inválido';
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cnpj)) return 'CNPJ inválido';
        
        // Validação do primeiro dígito verificador
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        const digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
          soma += numeros.charAt(tamanho - i) * pos--;
          if (pos < 2) pos = 9;
        }
        
        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(0))) return 'CNPJ inválido';
        
        // Validação do segundo dígito verificador
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
          soma += numeros.charAt(tamanho - i) * pos--;
          if (pos < 2) pos = 9;
        }
        
        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(1))) return 'CNPJ inválido';
        
        return true;
      };
    }
  },
  watch: {
    value(newVal) {
      if (this.field.type === 'MULTI_CHECKBOX') {
        this.selectedOptions = newVal || [];
      } else {
        this.fieldValue = newVal || '';
      }
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value);
    },
    handleCheckboxChange() {
      this.showCheckboxError = this.field.required && this.selectedOptions.length === 0;
      this.$emit('input', this.selectedOptions);
    },
    validate() {
      if (this.field.type === 'MULTI_CHECKBOX') {
        const isValid = !this.field.required || this.selectedOptions.length > 0;
        this.showCheckboxError = !isValid;
        return isValid;
      }
      
      if (this.field.required && !this.fieldValue) {
        return false;
      }
      
      switch (this.field.type) {
        case 'EMAIL':
          return !this.fieldValue || this.emailRule(this.fieldValue) === true;
        case 'CPF':
          return !this.fieldValue || this.cpfRule(this.fieldValue) === true;
        case 'CNPJ':
          return !this.fieldValue || this.cnpjRule(this.fieldValue) === true;
        default:
          return true;
      }
    }
  }
};
</script>

<style scoped>
.checkout-field-wrapper {
  margin-bottom: 16px;
}
.field-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
}
.required {
  color: red;
}
.help-text {
  color: rgba(0, 0, 0, 0.54);
  font-size: 12px;
}
.error-text {
  color: #ff5252;
  font-size: 12px;
}
.unsupported-field {
  border: 1px dashed #ccc;
  padding: 12px;
  border-radius: 4px;
  color: #777;
}
</style> 