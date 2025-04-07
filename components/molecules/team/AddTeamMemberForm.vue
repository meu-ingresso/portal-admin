<template>
  <v-form ref="form" v-model="valid">
    <v-text-field
      v-model="formData.email"
      label="E-mail"
      :rules="emailRules"
      outlined
      dense
      class="mb-3"
    />
    <v-select
      v-model="formData.role"
      :items="roleOptions"
      label="Função"
      outlined
      dense
      :rules="roleRules"
    />
  </v-form>
</template>

<script>
import { ADMIN_ROLES } from '@/utils/permissions-config';

export default {

  props: {
    value: {
      type: Object,
      default: () => ({
        email: '',
        role: ''
      })
    }
  },
  
  data() {
    return {
      valid: false,
      formData: {
        email: this.value.email || '',
        role: this.value.role || ''
      },
      emailRules: [
        v => !!v || 'E-mail é obrigatório',
        v => (/.+@.+\..+/.test(v) || !v) || 'E-mail deve ser válido'
      ],
      roleRules: [
        v => !!v || 'Função é obrigatória'
      ]
    };
  },
  
  computed: {
    roleOptions() {
      return ADMIN_ROLES.map(role => ({ text: role.name, value: role.name }));
    }
  },
  
  watch: {
    value: {
      handler(newValue) {
        if (newValue.role !== this.formData.role || newValue.email !== this.formData.email) {
          this.formData = {
            email: newValue.email || '',
            role: newValue.role || ''
          };
        }
      },
      deep: true
    },
    
    formData: {
      handler(newValue) {
        this.$emit('update:valid', this.valid);
        this.$emit('input', {...newValue});
      },
      deep: true
    },
    
    valid(newValue) {
      this.$emit('update:valid', newValue);
    }
  },
  
  methods: {
    validate() {
      return this.$refs.form.validate();
    },
    
    reset() {
      this.$refs.form.reset();
      this.formData = {
        email: '',
        role: ''
      };
    }
  }
};
</script> 