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
      :error-messages="emailError"
      :rules="field.required ? [required] : []"
      @input="handleEmailInput"
      @blur="validateEmail"
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
    
    <!-- Date Field (Novo) -->
    <div v-else-if="field.type === 'DATA'">
      <v-menu
        v-model="dateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="formattedDate"
            :label="field.name"
            :hint="field.help_text"
            :required="field.required"
            outlined
            dense
            readonly
            v-bind="attrs"
            :rules="field.required ? [required] : []"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="fieldValue"
          locale="pt-br"
          :first-day-of-week="0"
          @input="handleDateInput"
        ></v-date-picker>
      </v-menu>
    </div>
    
    <!-- Phone Field (Novo) -->
    <v-text-field
      v-else-if="field.type === 'TELEFONE'"
      v-model="fieldValue"
      v-mask="getPhoneMask(fieldValue)"
      :label="field.name"
      :hint="field.help_text || 'Formato: (00) 00000-0000'"
      :required="field.required"
      outlined
      dense
      :rules="field.required ? [required, phoneRule] : [phoneRule]"
      @input="handleInput"
    ></v-text-field>

    <!-- Termo Field (Novo) -->
    <div v-else-if="field.type === 'TERMO'" class="termo-field">
      <p class="field-label mb-2">
        {{ field.name }} <span v-if="field.required" class="required">*</span>
      </p>
      
      <v-card outlined class="mb-3 termo-content pa-3">
        <div v-if="termoContent" class="termo-text" v-html="termoContent"></div>
        <div v-else class="text-center py-2">
          <span class="grey--text">Termo não disponível</span>
        </div>
      </v-card>
      
      <v-checkbox
        v-model="fieldValue"
        :rules="field.required ? [v => !!v || 'É necessário aceitar os termos para continuar'] : []"
        :label="`Eu li e aceito os termos acima`"
        :required="field.required"
        @change="handleInput($event)"
      ></v-checkbox>
    </div>
    
    <!-- Dropdown Menu Field -->
    <v-select
      v-else-if="field.type === 'MENU_DROPDOWN'"
      v-model="fieldValue"
      :label="field.name"
      :hint="field.help_text"
      :required="field.required"
      :items="fieldOptions"
      item-text="label"
      item-value="value"
      outlined
      dense
      :rules="field.required ? [required] : []"
      @input="handleDropdownInput"
    ></v-select>
    
    <!-- Multi Checkbox Field -->
    <div v-else-if="field.type === 'MULTI_CHECKBOX'">
      <p class="field-label mb-2">
        {{ field.name }} <span v-if="field.required" class="required">*</span>
        <small v-if="field.help_text" class="help-text ml-2">{{ field.help_text }}</small>
      </p>
      <v-checkbox
        v-for="option in fieldOptions || []"
        :key="option.value"
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
import Debounce from '@/utils/Debounce';
import { formatDateToBr, formatDateToUs } from '@/utils/formatters';

export default {
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
      showCheckboxError: false,
      emailError: '',
      debouncedEmailValidation: null,
      dateMenu: false,
      termoContent: ''
    };
  },
  computed: {
    required() {
      return v => !!v || `${this.field.name} é obrigatório`;
    },
    emailRule() {
      return v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Email inválido';
    },
    phoneRule() {
      return v => {
        if (!v) return true;
        
        // Remove caracteres não numéricos
        const phone = v.replace(/\D/g, '');
        
        // Verifica se tem pelo menos 10 dígitos (DDD + número)
        if (phone.length < 10) return 'Telefone inválido';
        
        return true;
      };
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
    },
    fieldOptions() {
      return this.field?.options ? this.field.options.map(option => ({
        ...option,
        label: option.name,
        value: option.id,
      })) : [];
    },
    formattedDate() {
      if (!this.fieldValue) return '';
      // Usar o formatador de datas do sistema
      return formatDateToBr(this.fieldValue);
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
  created() {
    this.debouncedEmailValidation = new Debounce(() => {
      this.validateEmail();
    }, 500);
    
    // Carregar o conteúdo do termo se o campo for do tipo TERMO
    if (this.field.type === 'TERMO') {
      this.loadTermoContent();
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value);
    },
    handleEmailInput(value) {
      this.$emit('input', value);
      this.debouncedEmailValidation.execute();
    },
    validateEmail() {
      if (this.fieldValue && this.field.type === 'EMAIL') {
        const validationResult = this.emailRule(this.fieldValue);
        if (validationResult !== true) {
          this.emailError = validationResult;
        } else {
          this.emailError = '';
        }
      } else {
        this.emailError = '';
      }
    },
    handleDateInput(date) {
      this.dateMenu = false;
      // Garantir que a data seja formatada corretamente antes de emitir
      const formattedDate = formatDateToUs(date);
      this.$emit('input', formattedDate);
    },
    getPhoneMask(value) {
      if (!value) return '(##) #####-####';
      
      // Remove todos os caracteres não numéricos
      const numbers = value.replace(/\D/g, '');
      
      // Se o número já tem mais de 10 dígitos, provavelmente é celular (11 dígitos)
      if (numbers.length >= 11) {
        return '(##) #####-####';
      }
      
      // Se não, consideramos como telefone fixo (10 dígitos)
      return '(##) ####-####';
    },
    handleDropdownInput(selectedValue) {
      const selectedOption = this.fieldOptions.find(option => option.value === selectedValue);

      if (selectedOption) {
        this.$emit('input', selectedOption.value);
      } else {
        this.$emit('input', selectedValue);
      }
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
          this.validateEmail();
          return !this.fieldValue || this.emailRule(this.fieldValue) === true;
        case 'CPF':
          return !this.fieldValue || this.cpfRule(this.fieldValue) === true;
        case 'CNPJ':
          return !this.fieldValue || this.cnpjRule(this.fieldValue) === true;
        case 'TELEFONE':
          return !this.fieldValue || this.phoneRule(this.fieldValue) === true;
        default:
          return true;
      }
    },
    loadTermoContent() {
      if (!this.field?.options || this.field.options.length === 0) {
        this.termoContent = this.field.help_text || '';
        return;
      }
      
      // Agora que o campo é TEXT, podemos usar diretamente a primeira opção
      // que contém o texto completo do termo
      const termoOption = this.field.options[0];
      if (termoOption && termoOption.name) {
        // Usar o texto da primeira opção como conteúdo do termo
        this.termoContent = termoOption.name;
      } else {
        this.termoContent = this.field.help_text || '';
      }
    }
  }
};
</script>

<style scoped>
.checkout-field-wrapper {

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
.termo-content {
  max-height: 200px;
  overflow-y: auto;
  background-color: #f9f9f9;
}
.termo-text {
  font-size: 14px;
  white-space: pre-line;
}
</style> 