<template>
  <v-container class="custom-field-form">
    <!-- Botão para Adicionar Campo -->
    <v-row>
      <v-col cols="12" class="pl-0">
        <v-btn color="primary" depressed @click="addField">
          <v-icon left> mdi-plus </v-icon> Novo Campo
        </v-btn>
      </v-col>
    </v-row>

    <!-- Campo Atual Baseado na Página -->
    <transition name="fade">
      <v-row v-if="fields[currentPage - 1]" class="mb-3 field-row">
        <!-- Nome do Campo -->
        <v-col cols="12" md="6" sm="12">
          <v-text-field
            v-model="fields[currentPage - 1].name"
            label="Nome do Campo"
            outlined
            placeholder="Ex: CPF"
            required
            dense
            hide-details="auto"
            @input="emitChanges" />
        </v-col>

        <!-- Tipo do Campo -->
        <v-col cols="12" md="6" sm="12">
          <v-select
            v-model="fields[currentPage - 1].type"
            :items="fieldTypes"
            outlined
            label="Tipo"
            required
            dense
            hide-details="auto"
            @input="emitChanges" />
        </v-col>

        <!-- Tipos de Pessoa -->
        <v-col cols="12" md="4" sm="12">
          <v-checkbox
            v-model="fields[currentPage - 1].types.pf"
            label="Pessoa Física (PF)"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </v-col>
        <v-col cols="12" md="4" sm="12">
          <v-checkbox
            v-model="fields[currentPage - 1].types.pj"
            label="Pessoa Jurídica (PJ)"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </v-col>
        <v-col cols="12" md="4" sm="12">
          <v-checkbox
            v-model="fields[currentPage - 1].types.foreigner"
            label="Estrangeiros"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </v-col>

        <!-- Descrição do Campo -->
        <v-col cols="12">
          <v-textarea
            v-model="fields[currentPage - 1].description"
            label="Descrição"
            outlined
            placeholder="Adicione uma instrução para o usuário"
            rows="2"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </v-col>

        <!-- Configurações do Campo -->
        <v-col cols="12" md="4" sm="12">
          <v-checkbox
            v-model="fields[currentPage - 1].required"
            label="Obrigatório"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </v-col>
        <v-col cols="12" md="4" sm="12">
          <v-checkbox
            v-model="fields[currentPage - 1].unique"
            label="Único"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </v-col>
        <v-col cols="12" md="4" sm="12">
          <v-checkbox
            v-model="fields[currentPage - 1].visible_on_ticket"
            label="Visível na impressão"
            dense
            hide-details="auto"
            @input="emitChanges" />
        </v-col>
        <!-- Botão para Remover Campo -->
        <v-col cols="12" class="text-right">
          <v-btn
            v-if="fields.length > 1"
            color="red"
            text
            @click="removeField(currentPage - 1)">
            Remover Campo
          </v-btn>
        </v-col>
      </v-row>
    </transition>

    <!-- Paginação -->
    <v-row>
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="fields.length"
          circle
          total-visible="5"
          color="primary" />
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
      currentPage: 1, // Página atual
    };
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
    if (!this.fields.length) {
      this.addField();
    }
  },
  methods: {
    emitChanges() {
      this.$emit('update:fields', this.fields);
    },
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
      this.$set(this, 'currentPage', this.fields.length); // Vai para a última página
      this.emitChanges();
    },
    removeField(index) {
      this.fields.splice(index, 1);
      this.currentPage = Math.min(this.currentPage, this.fields.length); // Ajusta para a página anterior, se necessário
      this.emitChanges();
    },
  },
};
</script>

<style scoped>
.custom-field-form {
  max-height: 680px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.field-row {
  border: 1px solid #e0e0e0; /* Borda leve */
  border-radius: 8px; /* Arredondamento */
  padding: 16px;
  background-color: #f9f9f9; /* Fundo sutil */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* Sombra leve */
}

.bg-white {
  background-color: white;
}

.bg-light-gray {
  background-color: #f5f5f5;
}
</style>
