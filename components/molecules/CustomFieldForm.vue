<template>
  <v-container class="custom-field-form">
    <v-card>
      <v-card-title>
        <div class="subtitle-1">
          Gerencie os campos para preenchimento no formulário de seu ingresso
        </div>
        <v-spacer></v-spacer>
        <!-- Botão para Adicionar Novo Campo -->
        <ButtonWithIcon text="Novo Campo" @click="addField" />
      </v-card-title>
      <!-- Tabela de Campos -->
      <v-data-table
        :headers="headers"
        :items="allFields"
        dense
        elevation="0"
        item-value="name"
        hide-default-footer
        no-data-text="Nenhum campo personalizado adicionado"
        class="no-hover-table">
        <!-- Seleção -->
        <template #item.selected="{ item }">
          <v-checkbox v-model="item.selected" dense @change="emitChanges" />
        </template>

        <!-- Nome -->
        <template #item.name="{ item }">
          <v-text-field
            v-model="item.name"
            outlined
            dense
            hide-details="auto"
            placeholder="Digite o nome"
            class="my-2"
            @input="emitChanges" />
        </template>

        <!-- Tipo -->
        <template #item.type="{ item }">
          <v-select
            v-model="item.type"
            :items="fieldTypes"
            dense
            hide-details="auto"
            outlined
            placeholder="Tipo do campo"
            class="my-2"
            @input="emitChanges" />
        </template>

        <!-- Tipos de Pessoa -->
        <template #item.personTypes="{ item }">
          <v-select
            v-model="item.personTypes"
            :items="personTypes"
            multiple
            chips
            dense
            hide-details="auto"
            outlined
            placeholder="Tipos de pessoa"
            class="my-2"
            :disabled="item.isExisting && !item.selected"
            @input="emitChanges" />
        </template>

        <!-- Obrigatório -->
        <template #item.required="{ item }">
          <v-switch
            v-model="item.required"
            class="inline-switch my-2"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </template>

        <!-- Único -->
        <template #item.unique="{ item }">
          <v-switch
            v-model="item.unique"
            class="inline-switch my-2"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </template>

        <!-- Visível no Ticket -->
        <template #item.visible_on_ticket="{ item }">
          <v-switch
            v-model="item.visible_on_ticket"
            class="inline-switch my-2"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </template>

        <!-- Ações -->
        <template #item.actions="{ item, index }">
          <v-btn color="red" icon @click="removeField(index)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
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
    fieldTypes: {
      type: Array,
      default: () => ['CPF', 'CNPJ', 'Texto', 'Número', 'Data', 'Email', 'Telefone'],
    },
  },
  data() {
    return {
      fields: [...this.customFields],
      personTypes: ['Pessoa Física (PF)', 'Pessoa Jurídica (PJ)', 'Estrangeiro'],
    };
  },
  computed: {
    headers() {
      const baseHeaders = [
        { text: 'Nome', align: 'start', value: 'name', width: '200px' },
        { text: 'Tipo', value: 'type', width: '150px' },
        { text: 'Tipos de Pessoa', value: 'personTypes', width: '240px' },
        { text: 'Obrigatório', value: 'required', width: '80px', sortable: false },
        { text: 'Único', value: 'unique', width: '80px', sortable: false },
        {
          text: 'Visível na Impressão',
          value: 'visible_on_ticket',
          width: '80px',
          sortable: false,
        },
        { text: 'Ações', value: 'actions', width: '50px', sortable: false },
      ];

      if (this.existingFields.length > 0) {
        baseHeaders.unshift({
          text: 'Selecionar',
          value: 'selected',
          width: '50px',
          sortable: false,
        });
      }

      return baseHeaders;
    },
    allFields() {
      // Combina os campos existentes e personalizados
      const existingFields = this.existingFields.map((field) => ({
        ...field,
        isExisting: true,
        selected: this.fields.some((f) => f.name === field.name),
        personTypes: field.personTypes || [],
      }));

      const customFields = this.fields.filter(
        (field) => !existingFields.some((existing) => existing.name === field.name)
      );

      return [...existingFields, ...customFields];
    },
  },
  watch: {
    customFields: {
      handler() {
        this.fields = [...this.customFields];
      },
      deep: true,
    },
  },

  mounted() {
    this.addField();
  },

  methods: {
    emitChanges() {
      // Emite os campos selecionados
      const selectedFields = this.allFields.filter(
        (field) => !field.isExisting || field.selected
      );
      this.$emit('update:fields', selectedFields);
    },
    addField() {
      this.fields.push({
        name: '',
        type: '',
        personTypes: [],
        required: false,
        unique: false,
        visible_on_ticket: false,
      });
      this.emitChanges();
    },
    removeField(index) {
      this.fields.splice(index, 1);
      this.emitChanges();
    },
  },
};
</script>
<style scoped>
.elevation-1 {
  border-radius: 8px;
  overflow: hidden;
}

.no-hover-table tbody tr:hover {
  background-color: transparent;
}

.v-data-table tbody tr td {
  vertical-align: middle;
}

.inline-switch {
  display: inline-flex;
}

.v-btn {
  margin: 0;
}
</style>
