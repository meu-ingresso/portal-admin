<template>
  <div class="contact-form mt-4 mb-2">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="localEmail"
          label="E-mail para contato"
          outlined
          dense
          hide-details="auto"
          :disabled="disabled"
          prepend-inner-icon="mdi-email-outline"
          :error-messages="emailErrors"
          @input="validateEmail"
          @blur="validateEmail"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="localPhone"
          label="Telefone para contato"
          outlined
          maxlength="15"
          dense
          hide-details="auto"
          :disabled="disabled"
          prepend-inner-icon="mdi-phone-outline"
          :error-messages="phoneErrors"
          @input="formatPhoneInput"
          @blur="validatePhone"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { onFormatCellphone } from '@/utils/formatters';

export default {
  name: 'ContactForm',
  
  props: {
    contactEmail: {
      type: String,
      default: ''
    },
    contactPhone: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      localEmail: this.contactEmail,
      localPhone: this.contactPhone,
      emailErrors: [],
      phoneErrors: []
    };
  },
  
  watch: {
    contactEmail(newVal) {
      this.localEmail = newVal;
    },
    contactPhone(newVal) {
      this.localPhone = newVal;
    }
  },
  
  methods: {
    validateEmail() {
      this.emailErrors = [];
      
      if (!this.localEmail) return;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.localEmail)) {
        this.emailErrors.push('E-mail inválido');
      }
      
      this.$emit('update:contactEmail', this.localEmail);
    },
    
    validatePhone() {
      this.phoneErrors = [];
      
      if (!this.localPhone) return;
      
      // Valida se tem pelo menos 14 caracteres (incluindo formatação)
      // Exemplo de formato: (11) 98765-4321
      if (this.localPhone.length < 14) {
        this.phoneErrors.push('Número de telefone incompleto');
      }
      
      this.$emit('update:contactPhone', this.localPhone);
    },
    
    formatPhoneInput() {
      if (!this.localPhone) return;
      this.localPhone = onFormatCellphone(this.localPhone);
      this.$emit('update:contactPhone', this.localPhone);
    },
    
    getFormValues() {
      return {
        email: this.localEmail,
        phone: this.localPhone,
        isValid: this.isFormValid()
      };
    },
    
    isFormValid() {
      this.validateEmail();
      this.validatePhone();
      
      return this.emailErrors.length === 0 && this.phoneErrors.length === 0;
    }
  }
};
</script>

<style scoped>
.contact-form {
  width: 100%;
}
</style> 