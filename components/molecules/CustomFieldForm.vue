<template>
  <v-row>
    <!-- Nome do Campo -->
    <v-col cols="12" md="6">
      <v-text-field
        ref="name"
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
        ref="type"
        v-model="localField.type"
        :items="fieldTypes"
        label="Tipo do Campo"
        placeholder="Selecione o tipo"
        outlined
        dense
        hide-details="auto"
        return-object
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
      <v-row v-for="(option, index) in localField.optionsValues" :key="index">
        <v-col md="6">
          <v-text-field
            v-model="localField.optionsValues[index]"
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
    <v-col v-else-if="localField.type?.value === 'TERMO'" cols="12">
      <v-textarea
        ref="termsContent"
        v-model="localField.termsContent"
        label="Conteúdo dos Termos"
        placeholder="Insira aqui os termos que o usuário deve aceitar"
        outlined
        required
        dense
        rows="6"
        hide-details="auto"
        :rules="validationRules.termsContent" />
    </v-col>

    <!-- Ingressos Associados -->
    <v-col cols="12" md="12">
      <v-select
        ref="tickets"
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
        ref="personTypes"
        v-model="localField.personTypes"
        :items="personTypes"
        label="Tipos de Pessoa"
        placeholder="Selecione os tipos de pessoas"
        outlined
        dense
        multiple
        required
        hide-details="auto"
        return-object
        :rules="validationRules.personTypes" />
    </v-col>

    <!-- Opções de Configuração -->
    <v-col cols="12" md="12">
      <v-select
        v-model="localField.options"
        :value="localField.options"
        :items="options"
        :disabled="localField.type?.value === 'TERMO'"
        label="Configurações"
        placeholder="Selecione as configurações"
        outlined
        dense
        multiple
        hide-details="auto"
        return-object />
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
      localField: {
        ...this.field,
        optionsValues: this.field.optionsValues || [],
        termsContent: this.field.termsContent || '',
      },
      formHasErrors: false,
      fieldTypes: [
        { text: 'CPF', value: 'CPF' },
        { text: 'CNPJ', value: 'CNPJ' },
        { text: 'Telefone', value: 'TELEFONE' },
        { text: 'Data', value: 'DATA' },
        { text: 'Texto', value: 'TEXTO' },
        { text: 'Parágrafo', value: 'PARAGRAPH' },
        { text: 'Email', value: 'EMAIL' },
        { text: 'Menu Dropdown', value: 'MENU_DROPDOWN' },
        { text: 'Mútiplos Checkbox', value: 'MULTI_CHECKBOX' },
        { text: 'Termos', value: 'TERMO' },
      ],
      optionErrors: [],
      errors: {
        name: [],
        type: [],
        tickets: [],
        personTypes: [],
        termsContent: [],
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
        termsContent: [
          (value) =>
            this.localField.type?.value !== 'terms' ||
            !!value ||
            'O conteúdo dos termos é obrigatório.',
        ],
      },
    };
  },

  computed: {
    isFieldTypeWithOptions() {
      return ['MENU_DROPDOWN', 'MULTI_CHECKBOX'].includes(this.localField.type?.value);
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
    form() {
      return {
        name: this.localField.name,
        type: this.localField.type,
        termsContent: this.localField.termsContent,
        tickets: this.localField.tickets,
        personTypes: this.localField.personTypes,
      };
    },
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

      if (this.localField.type?.value === 'TERMO') {
        this.$set(this.localField, 'options', [
          {
            text: 'Obrigatório',
            value: 'required',
          },
        ]);
      } else {
        this.$set(this.localField, 'options', []);
        this.$set(this.localField, 'termsContent', '');
        this.$set(this.localField, 'optionsValues', []);
        this.$set(this, 'optionErrors', []);
      }
    },

    handleOptionEnter(index) {
      if (index === this.localField.optionsValues.length - 1) {
        this.addOption();
      }
    },

    addOption(index) {
      // Se o índice não for válido, adiciona no final
      if (
        typeof index !== 'number' ||
        index < 0 ||
        index >= this.localField.optionsValues.length
      ) {
        this.localField.optionsValues.push('');
        this.optionErrors.push('');
        return;
      }

      // Adiciona a nova opção logo após o índice fornecido
      this.localField.optionsValues.splice(index + 1, 0, '');
      this.optionErrors.splice(index + 1, 0, '');
    },
    removeOption(index) {
      this.localField.optionsValues.splice(index, 1);
      this.optionErrors.splice(index, 1);
    },

    validateOptions() {
      let isValid = true;

      this.localField.optionsValues.forEach((option, index) => {
        if (!option) {
          this.$set(this.optionErrors, index, 'A opção não pode estar vazia.');
          isValid = false;
        } else if (
          this.localField.optionsValues.filter((val) => val === option).length > 1
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

    validateForm() {
      this.formHasErrors = false;

      Object.keys(this.form).forEach((f) => {
        if (f === 'termsContent' && !this.localField.type?.value !== 'TERMO') {
          return;
        }

        if (f === 'tickets' && this.form[f].length === 0) {
          this.formHasErrors = true;
        }

        if (f === 'personTypes' && this.form[f].length === 0) {
          this.formHasErrors = true;
        }

        if (!this.form[f]) {
          this.formHasErrors = true;
        }

        this.$refs[f].validate(true);
      });

      // Valida as opções do campo se o tipo for um dos que possuem opções
      if (this.isFieldTypeWithOptions && !this.validateOptions()) {
        this.formHasErrors = true;
      }

      if (!this.formHasErrors) {
        this.emitChanges();
      }

      return this.formHasErrors;
    },
  },
};
</script>

<style scoped>
</style>

