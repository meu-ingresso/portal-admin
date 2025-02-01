<template>
  <v-form ref="form" v-model="isFormValid">
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
          :rules="validationRules.name" />
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
          :rules="validationRules.type"
          @input="onTypeChange" />
      </v-col>

      <!-- Campo Dinâmico de Opções -->
      <v-col v-if="isFieldTypeWithOptions" cols="12">
        <v-row>
          <v-col md="12">
            <div class="d-flex align-center" style="padding: 0px 4px 0px">
              <h4>Opções para o novo campo</h4>
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
                </template>
                <span
                  >Adicione opções para o novo campo pressionando a tecla ENTER ou pelo
                  ícone</span
                >
              </v-tooltip>
            </div>
          </v-col>
        </v-row>
        <v-row v-for="(option, index) in localField.selected_options" :key="index">
          <v-col md="6">
            <v-text-field
              v-model="localField.selected_options[index]"
              :label="`Opção ${index + 1}`"
              outlined
              dense
              required
              hide-details="auto"
              :error="optionErrors[index]?.length > 0"
              :error-messages="optionErrors[index]"
              @keydown.enter="handleOptionEnter(index)" />
          </v-col>
          <v-col md="6" class="d-flex align-center">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" @click="removeOption(index)">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Remover opção</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" @click="addOption(index)">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
              <span>Adicionar opção abaixo</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-col>

      <!-- Campo de Termos -->
      <v-col v-else-if="localField.type === 'TERMO'" cols="12">
        <v-textarea
          v-model="localField.terms_content"
          label="Conteúdo dos Termos"
          placeholder="Insira aqui os termos que o usuário deve aceitar"
          outlined
          required
          dense
          rows="6"
          hide-details="auto"
          :rules="validationRules.terms_content" />
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
          required
          hide-details="auto"
          :rules="validationRules.tickets">
          <template v-if="tickets.length" #prepend-item>
            <v-list-item ripple @mousedown.prevent @click="toggleAllTickets">
              <v-list-item-action>
                <v-icon :color="localField.tickets.length > 0 ? 'primary' : ''">
                  {{ icon }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title> Todos </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2"></v-divider>
          </template>
        </v-select>
      </v-col>

      <!-- Tipos de Pessoa -->
      <v-col cols="12" md="12">
        <v-select
          v-model="localField.person_types"
          :items="personTypes"
          label="Tipos de Pessoa"
          placeholder="Selecione os tipos de pessoas"
          outlined
          dense
          multiple
          required
          hide-details="auto"
          :rules="validationRules.person_types" />
      </v-col>

      <!-- Opções de Configuração -->
      <v-col cols="12" md="12">
        <v-select
          v-model="localField.options"
          :items="fieldOptions"
          :disabled="localField.type === 'TERMO'"
          label="Configurações"
          placeholder="Selecione as configurações"
          outlined
          dense
          multiple
          hide-details="auto" />
      </v-col>

      <!-- Descrição de Ajuda -->
      <v-col cols="12" md="12">
        <v-textarea
          v-model="localField.help_text"
          label="Descrição de Ajuda"
          placeholder="Explique como e para o que serve este campo (opcional)"
          outlined
          dense
          rows="2"
          hide-details="auto" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { eventCustomFields } from '@/store';

export default {
  props: {
    editIndex: {
      type: Number,
      default: null,
    },
    tickets: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isFormValid: false,
      localField: {
        name: '',
        type: null,
        description: '',
        options: [],
        selected_options: [],
        person_types: [],
        tickets: [],
        help_text: '',
        terms_content: '',
      },
      optionErrors: [],
      fieldTypes: [
        { text: 'CPF', value: 'CPF' },
        { text: 'CNPJ', value: 'CNPJ' },
        { text: 'Telefone', value: 'TELEFONE' },
        { text: 'Data', value: 'DATA' },
        { text: 'Texto', value: 'TEXTO' },
        { text: 'Parágrafo', value: 'PARAGRAPH' },
        { text: 'Email', value: 'EMAIL' },
        { text: 'Menu Dropdown', value: 'MENU_DROPDOWN' },
        { text: 'Múltiplos Checkbox', value: 'MULTI_CHECKBOX' },
        { text: 'Termos', value: 'TERMO' },
      ],
      fieldOptions: [
        { text: 'Obrigatório', value: 'required' },
        { text: 'Valor único', value: 'is_unique' },
        { text: 'Visível no ingresso', value: 'visible_on_ticket' },
      ],
      personTypes: [
        { text: 'Pessoa Física (PF)', value: 'PF' },
        { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
        { text: 'Estrangeiro', value: 'ESTRANGEIRO' },
      ],
      validationRules: {
        name: [(v) => !!v || 'O nome do campo é obrigatório.'],
        type: [(v) => !!v || 'O tipo do campo é obrigatório.'],
        tickets: [(v) => (!!v && v.length > 0) || 'Selecione pelo menos um ingresso.'],
        person_types: [
          (v) => (!!v && v.length > 0) || 'Selecione pelo menos um tipo de pessoa.',
        ],
        terms_content: [
          (v) =>
            this.localField.type !== 'TERMO' ||
            !!v ||
            'O conteúdo dos termos é obrigatório.',
        ],
      },
    };
  },

  computed: {
    isFieldTypeWithOptions() {
      return ['MENU_DROPDOWN', 'MULTI_CHECKBOX'].includes(this.localField.type);
    },
    selectedAllTickets() {
      return this.localField.tickets.length === this.tickets.length;
    },
    selectedSomeTickets() {
      return this.localField.tickets.length > 0 && !this.selectedAllTickets;
    },
    icon() {
      if (this.selectedAllTickets) return 'mdi-close-box';
      if (this.selectedSomeTickets) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
    isEditing() {
      return this.editIndex !== null;
    },
  },

  created() {
    if (this.isEditing) {
      const fieldToEdit = eventCustomFields.$customFields[this.editIndex];
      this.localField = { ...fieldToEdit };
    }
  },

  methods: {
    handleSubmit() {
      try {
        if (!this.$refs.form.validate() || !this.validateOptions()) return false;

        if (this.isEditing) {
          eventCustomFields.updateField({
            index: this.editIndex,
            field: this.localField,
          });
        } else {
          eventCustomFields.addField(this.localField);
        }

        return true;
      } catch (error) {
        console.error('Erro ao salvar campo:', error);
        return false;
      }
    },

    toggleAllTickets() {
      if (this.selectedAllTickets) {
        this.localField.tickets = [];
      } else {
        this.localField.tickets = [...this.tickets];
      }
    },

    onTypeChange() {
      if (this.isFieldTypeWithOptions && this.localField.optionsValues.length === 0) {
        this.addOption();
        return;
      }

      if (this.localField.type === 'TERMO') {
        this.$set(this.localField, 'options', [
          {
            text: 'Obrigatório',
            value: 'required',
          },
        ]);
      } else {
        this.$set(this.localField, 'options', []);
        this.$set(this.localField, 'terms_content', '');
        this.$set(this.localField, 'selected_options', []);
        this.$set(this, 'optionErrors', []);
      }
    },

    handleOptionEnter(index) {
      if (index === this.localField.selected_options.length - 1) {
        this.addOption();
      }
    },

    addOption(index) {
      // Se o índice não for válido, adiciona no final
      if (
        typeof index !== 'number' ||
        index < 0 ||
        index >= this.localField.selected_options.length
      ) {
        this.localField.selected_options.push('');
        this.optionErrors.push('');
        return;
      }

      // Adiciona a nova opção logo após o índice fornecido
      this.localField.selected_options.splice(index + 1, 0, '');
      this.optionErrors.splice(index + 1, 0, '');
    },
    removeOption(index) {
      this.localField.selected_options.splice(index, 1);
      this.optionErrors.splice(index, 1);
    },

    validateOptions() {
      let isValid = true;

      this.localField.selected_options.forEach((option, index) => {
        if (!option) {
          this.$set(this.optionErrors, index, 'A opção não pode estar vazia.');
          isValid = false;
        } else if (
          this.localField.selected_options.filter((val) => val === option).length > 1
        ) {
          this.$set(
            this.optionErrors,
            index,
            'Essa opção já foi adicionada anteriormente.'
          );
          isValid = false;
        } else {
          this.$set(this.optionErrors, index, '');
        }
      });

      return isValid;
    },
  },
};
</script>

<style scoped>
</style>

