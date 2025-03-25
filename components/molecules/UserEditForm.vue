<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent="onSubmit">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.first_name"
          :disabled="loading"
          label="Primeiro nome"
          placeholder="Digite seu primeiro nome"
          :rules="rules.first_name"
          outlined
          dense
          required />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.last_name"
          :disabled="loading"
          label="Sobrenome"
          placeholder="Digite seu sobrenome"
          :rules="rules.last_name"
          outlined
          dense
          required />
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="formData.email"
          :disabled="loading"
          label="E-mail"
          placeholder="Digite seu e-mail"
          prepend-inner-icon="mdi-email"
          :rules="rules.email"
          type="email"
          outlined
          dense
          required />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" class="d-flex justify-end">
        <DefaultButton
          text="Cancelar"
          color="grey darken-1"
          class="mr-4"
          :disabled="loading"
          outlined
          @click="$emit('cancel')" />
        
        <ButtonWithIcon
          text="Salvar alterações"
          icon="mdi-content-save"
          :disabled="!valid || loading"
          :is-loading="loading"
          direction="left"
          @click="onSubmit" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { user } from '@/store';

export default {

  props: {
    user: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      valid: true,
      formData: {
        first_name: '',
        last_name: '',
        email: ''
      },
      rules: {
        first_name: [
          (v) => !!v || 'Primeiro nome é obrigatório',
          (v) => v.length >= 2 || 'Nome deve ter no mínimo 2 caracteres'
        ],
        last_name: [
          (v) => !!v || 'Sobrenome é obrigatório',
          (v) => v.length >= 2 || 'Sobrenome deve ter no mínimo 2 caracteres'
        ],
        email: [
          (v) => !!v || 'E-mail é obrigatório',
          (v) => /.+@.+\..+/.test(v) || 'E-mail deve ser válido'
        ]
      }
    };
  },

  watch: {
    user: {
      handler(newValue) {
        if (newValue) {
          this.formData = {
            first_name: newValue.people?.first_name || '',
            last_name: newValue.people?.last_name || '',
            email: newValue.email || ''
          };
        }
      },
      immediate: true
    }
  },

  methods: {
    onSubmit() {
      if (!this.$refs.form.validate()) {
        return;
      }

      // Update user store with form data
      user.context.commit('SET_USER', {
        ...this.user,
        people: {
          ...this.user.people,
          first_name: this.formData.first_name,
          last_name: this.formData.last_name,
        },
        email: this.formData.email
      });

      this.$emit('submit');
    },

    resetForm() {
      this.$refs.form.reset();
    }
  }
};
</script>

<style scoped>
.v-input__slot {
  min-height: 50px !important;
}
</style> 