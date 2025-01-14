<template>
  <v-row>
    <!-- Nome do Campo -->
    <v-col cols="12" md="6">
      <v-text-field
        ref="nameField"
        v-model="localField.name"
        label="Nome do Campo"
        placeholder="Ex: CPF"
        outlined
        dense
        hide-details="auto"
        required
        :error="errors.name.length > 0"
        :error-messages="errors.name"
        @input="emitChanges" />
    </v-col>

    <!-- Tipo do Campo -->
    <v-col cols="12" md="6">
      <v-select
        ref="typeField"
        v-model="localField.type"
        :items="fieldTypes"
        label="Tipo do Campo"
        placeholder="Selecione o tipo"
        outlined
        dense
        hide-details="auto"
        required
        :error="errors.type.length > 0"
        :error-messages="errors.type"
        @input="emitChanges" />
    </v-col>

    <!-- Ingressos Associados -->
    <v-col cols="12" md="12">
      <v-select
        v-model="localField.tickets"
        :items="tickets"
        label="Ingressos"
        placeholder="Selecione o(s) ingresso(s)"
        no-data-text="Nenhum ingresso cadastrado"
        outlined
        dense
        multiple
        hide-details="auto"
        :error="errors.tickets.length > 0"
        :error-messages="errors.tickets"
        @input="emitChanges" />
    </v-col>

    <!-- Tipos de Pessoa -->
    <v-col cols="12" md="12">
      <v-select
        v-model="localField.personTypes"
        :items="personTypes"
        label="Tipos de Pessoa"
        placeholder="Selecione os tipos de pessoas"
        outlined
        dense
        multiple
        hide-details="auto"
        return-object
        :error="errors.personTypes.length > 0"
        :error-messages="errors.personTypes"
        @input="emitChanges" />
    </v-col>

    <!-- Opções de Configuração -->
    <v-col cols="12" md="12">
      <v-select
        v-model="localField.options"
        :items="options"
        label="Configurações"
        placeholder="Selecione as configurações"
        outlined
        dense
        multiple
        hide-details="auto"
        return-object
        @input="emitChanges" />
    </v-col>

    <!-- Descrição de Ajuda -->
    <v-col cols="12" md="12">
      <v-textarea
        v-model="localField.description"
        label="Descrição de Ajuda"
        placeholder="Explique como usar este campo"
        outlined
        dense
        rows="2"
        hide-details="auto"
        @input="emitChanges" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    field: {
      type: Object,
      required: true,
    },
    tickets: {
      type: Array,
      required: true,
    },
    personTypes: {
      type: Array,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      localField: { ...this.field },
      fieldTypes: [
        { text: 'Texto', value: 'text' },
        { text: 'Número', value: 'number' },
        { text: 'Data', value: 'date' },
        { text: 'Email', value: 'email' },
        { text: 'Telefone', value: 'phone' },
        { text: 'Autocomplete', value: 'autocomplete' },
        { text: 'Multiselect', value: 'multiselect' },
      ],
      errors: {
        name: [],
        type: [],
        tickets: [],
        personTypes: [],
      },
      validationRules: {
        name: [(value) => !!value || 'O nome é obrigatório.'],
        type: [(v) => !!v || 'O tipo do campo é obrigatório.'],
        tickets: [
          (v) => (!!v && v.length > 0) || 'Pelo menos um ingresso deve ser selecionado.',
        ],
        personTypes: [
          (v) =>
            (!!v && v.length > 0) || 'Pelo menos um tipo de pessoa deve ser selecionado.',
        ],
      },
    };
  },
  watch: {
    field: {
      handler() {
        this.localField = { ...this.field };
      },
      deep: true,
    },
  },

  methods: {
    emitChanges() {
      this.$emit('update:field', this.localField);
    },

    validateField(fieldName) {
      const rules = this.validationRules[fieldName];
      if (!rules) return true;

      const value = this.localField[fieldName];
      const error = rules.find((rule) => rule(value) !== true);

      this.$set(this.errors, fieldName, error ? error(value) : '');
      return !error;
    },

    validateForm() {
      let isValid = true;

      Object.keys(this.validationRules).forEach((fieldName) => {
        if (!this.validateField(fieldName)) {
          isValid = false;
        }
      });

      return isValid;
    },
  },
};
</script>

<style scoped>
</style>
