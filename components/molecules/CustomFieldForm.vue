<template>
  <v-container>
    <!-- Botão para Adicionar Campo -->
    <v-row>
      <v-col cols="12" class="pl-0">
        <v-btn color="primary" depressed @click="addField">
          <v-icon left> mdi-plus </v-icon> Novo Campo
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de Campos -->
    <v-row
      v-for="(field, index) in fields"
      :key="index"
      class="mb-3"
      :class="{ 'bg-light-gray': index % 2 === 0 }">
      <!-- Nome do Campo -->
      <v-col cols="12" md="6" sm="12">
        <v-text-field
          v-model="field.name"
          label="Nome do Campo"
          outlined
          placeholder="Ex: CPF"
          required />
      </v-col>

      <!-- Tipo do Campo -->
      <v-col cols="12" md="6" sm="12">
        <v-select
          v-model="field.type"
          :items="fieldTypes"
          outlined
          label="Tipo"
          required />
      </v-col>

      <!-- Tipos de Pessoa -->
      <v-col cols="12" md="4" sm="12">
        <v-checkbox v-model="field.types.pf" label="Pessoa Física (PF)" />
      </v-col>
      <v-col cols="12" md="4" sm="12">
        <v-checkbox v-model="field.types.pj" label="Pessoa Jurídica (PJ)" />
      </v-col>
      <v-col cols="12" md="4" sm="12">
        <v-checkbox v-model="field.types.foreigner" label="Estrangeiros" />
      </v-col>

      <!-- Descrição do Campo -->
      <v-col cols="12">
        <v-textarea
          v-model="field.description"
          label="Descrição"
          outlined
          placeholder="Adicione uma instrução para o usuário"
          rows="2" />
      </v-col>

      <!-- Configurações do Campo -->
      <v-col cols="12" md="4" sm="12">
        <v-checkbox v-model="field.required" label="Obrigatório" />
      </v-col>
      <v-col cols="12" md="4" sm="12">
        <v-checkbox v-model="field.unique" label="Único" />
      </v-col>
      <v-col cols="12" md="4" sm="12">
        <v-checkbox v-model="field.visible_on_ticket" label="Visível na impressão" />
      </v-col>

      <!-- Botão para Remover Campo -->
      <v-col cols="12">
        <v-btn color="red" text @click="removeField(index)"> Remover Campo </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
export default {
  props: {
    customFields: {
      type: Array,
      default: () => [],
    },
    existingFields: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      fields: [...this.customFields],
      fieldTypes: ['CPF', 'CNPJ', 'Texto', 'Número', 'Data', 'Email', 'Telefone'],
    };
  },
  mounted() {
    this.addField();
  },
  methods: {
    addField() {
      this.fields.push({
        name: '',
        type: '',
        required: false,
        unique: false,
        visible_on_ticket: false,
        description: '',
        types: {
          pf: true,
          pj: false,
          foreigner: false,
        },
      });
    },
    removeField(index) {
      this.fields.splice(index, 1);
    },
    saveFields() {
      this.$emit('save', this.fields); // Emite todos os campos para o pai
    },
  },
};
</script>

<style scoped>
.bg-white {
  background-color: white;
}

.bg-light-gray {
  background-color: #f5f5f5;
}
</style>
