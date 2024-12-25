<template>
  <v-container class="step-custom-fields">
    <v-row>
      <v-col cols="12">
        <h3>Campos Customizados</h3>
        <p class="subtitle-1">Adicione campos personalizados para o checkout.</p>
        <DefaultButton
          class="mt-2"
          text="Adicionar Campo Customizado"
          @click="addCustomField" />
      </v-col>
    </v-row>
    <v-row v-for="(field, index) in customFields" :key="index" class="custom-field-row">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="field.name"
          label="Nome do Campo"
          placeholder="Ex: CPF"
          required />
      </v-col>

      <v-col cols="12" sm="4">
        <v-select
          v-model="field.type"
          :items="fieldTypes"
          label="Tipo do Campo"
          placeholder="Selecione"
          required />
      </v-col>

      <v-col cols="12" sm="2">
        <v-switch v-model="field.isRequired" label="Obrigatório" inset />
      </v-col>

      <v-col cols="12" sm="2">
        <v-switch v-model="field.isUnique" label="Único" inset />
      </v-col>

      <v-col cols="12" sm="2">
        <v-switch v-model="field.isVisible" label="Visível no Ingresso" inset />
      </v-col>

      <v-col cols="12" sm="10">
        <v-textarea
          v-model="field.description"
          label="Descrição de Ajuda"
          placeholder="Explique como usar este campo"
          rows="2" />
      </v-col>

      <v-col cols="12" sm="2">
        <v-btn color="red" text @click="removeCustomField(index)"> Remover </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      customFields: this.form.customFields || [],
      fieldTypes: [
        { text: 'Texto', value: 'text' },
        { text: 'Número', value: 'number' },
        { text: 'Data', value: 'date' },
        { text: 'Email', value: 'email' },
        { text: 'Telefone', value: 'phone' },
      ],
    };
  },
  methods: {
    addCustomField() {
      this.customFields.push({
        name: '',
        type: '',
        isRequired: false,
        isUnique: false,
        isVisible: false,
        description: '',
      });
      this.updateCustomFields();
    },
    removeCustomField(index) {
      this.customFields.splice(index, 1);
      this.updateCustomFields();
    },
    updateCustomFields() {
      this.$emit('update:form', { ...this.form, customFields: this.customFields });
    },
  },
};
</script>

<style scoped>
.step-custom-fields {
  max-width: 1280px;
  margin: 0 auto;
}

.custom-field-row {
  margin-bottom: 16px;
}
</style>
