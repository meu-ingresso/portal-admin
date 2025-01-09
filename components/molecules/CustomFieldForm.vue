<template>
  <v-row>
    <!-- Nome do Campo -->
    <v-col cols="12" md="6">
      <v-text-field
        v-model="localField.name"
        label="Nome do Campo"
        placeholder="Ex: CPF"
        outlined
        dense
        hide-details="auto"
        required
        @input="emitChanges" />
    </v-col>

    <!-- Tipo do Campo -->
    <v-col cols="12" md="6">
      <v-select
        v-model="localField.type"
        :items="fieldTypes"
        label="Tipo do Campo"
        placeholder="Selecione o tipo"
        outlined
        dense
        hide-details="auto"
        required
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
  },
};
</script>

<style scoped>
</style>
