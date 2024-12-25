<template>
  <v-container>
    <!-- Seleção de Campos Existentes -->
    <v-row>
      <v-col cols="12">
        <v-select
          v-model="selectedExistingField"
          :items="existingFields"
          item-text="name"
          label="Selecionar Campo Existente"
          clearable
          @change="onSelectExistingField" />
      </v-col>
    </v-row>

    <!-- Formulário de Edição ou Exibição -->
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="field.name"
          label="Nome do Campo"
          placeholder="Ex: CPF"
          :disabled="isUsingExistingField"
          required />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="field.type"
          :items="fieldTypes"
          label="Tipo"
          :disabled="isUsingExistingField"
          required />
      </v-col>
      <v-col cols="12" sm="4">
        <v-checkbox
          v-model="field.required"
          label="Obrigatório"
          :disabled="isUsingExistingField" />
      </v-col>
      <v-col cols="12" sm="4">
        <v-checkbox
          v-model="field.unique"
          label="Único"
          :disabled="isUsingExistingField" />
      </v-col>
      <v-col cols="12" sm="4">
        <v-checkbox
          v-model="field.visible"
          label="Visível no checkout"
          :disabled="isUsingExistingField" />
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="field.description"
          label="Descrição"
          placeholder="Adicione uma instrução para o usuário"
          rows="2"
          :disabled="isUsingExistingField" />
      </v-col>
    </v-row>

    <!-- Botões -->
    <v-btn class="mt-3" text color="success" @click="saveField"> Salvar </v-btn>
  </v-container>
</template>


<script>
export default {
  props: {
    customField: {
      type: Object,
      default: () => ({
        name: '',
        type: '',
        required: false,
        unique: false,
        visible: true,
        description: '',
      }),
    },
    existingFields: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      field: { ...this.customField }, // Clona o campo recebido como prop
      selectedExistingField: null, // Campo selecionado
      isUsingExistingField: false, // Flag para desabilitar os inputs
      fieldTypes: ['CPF', 'CNPJ', 'Texto', 'Número', 'Data', 'Email', 'Telefone'],
    };
  },
  methods: {
    // Método chamado ao selecionar um campo existente
    onSelectExistingField(field) {
      if (field) {
        // Popula os campos com os valores do campo existente
        this.field = { ...field };
        this.isUsingExistingField = true; // Desabilita os inputs
      } else {
        // Restaura o estado inicial se nenhum campo for selecionado
        this.field = { ...this.customField };
        this.isUsingExistingField = false;
      }
    },

    // Salva o campo customizado
    saveField() {
      if (this.isUsingExistingField) {
        // Se estiver usando um campo existente, apenas o retorna como está
        this.$emit('save', this.field);
      } else {
        // Caso contrário, salva o campo editado/criado
        this.$emit('save', this.field);
      }
    },
  },
};
</script>
