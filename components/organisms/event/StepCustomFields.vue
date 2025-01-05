<template>
  <v-container class="step-custom-fields py-0">
    <v-row>
      <v-col cols="12">
        <template v-if="isMobile">
          <h3>Campos Customizados</h3>
          <p class="subtitle-2">Adicione campos personalizados para o checkout.</p>
        </template>
        <ButtonWithIcon
          class="mt-2"
          text="Campo"
          direction="left"
          @click="addCustomField" />
      </v-col>
    </v-row>
    <v-row
      v-for="(field, index) in customFields"
      :key="index"
      class="custom-field-row bg-light-gray">
      <v-col cols="12" sm="12" :md="field.isDefault ? 6 : 4">
        <v-text-field
          v-model="field.name"
          outlined
          dense
          hide-details="auto"
          label="Nome do Campo"
          placeholder="Ex: CPF"
          required
          :disabled="field.isDefault" />
      </v-col>

      <v-col cols="12" sm="12" :md="field.isDefault ? 6 : 4">
        <v-select
          v-model="field.type"
          :items="fieldTypes"
          label="Tipo do Campo"
          placeholder="Selecione o tipo"
          outlined
          dense
          hide-details="auto"
          required
          :disabled="field.isDefault" />
      </v-col>

      <v-col v-if="!field.isDefault" cols="12" sm="12" md="4">
        <v-select
          v-model="field.tickets"
          :items="tickets"
          label="Ingressos"
          placeholder="Selecione o(s) ingresso(s)"
          outlined
          dense
          multiple
          no-data-text="Nenhum ingresso criado"
          chips
          hide-details="auto"
          required
          :disabled="field.isDefault" />
      </v-col>

      <v-col cols="12" sm="12" md="6">
        <v-select
          v-model="field.personTypes"
          :items="personTypes"
          multiple
          chips
          dense
          hide-details="auto"
          outlined
          label="Tipos de Pessoa"
          placeholder="Selecione os tipos de pessoas"
          :disabled="field.isDefault" />
      </v-col>

      <v-col cols="12" sm="12" md="6">
        <v-select
          v-model="field.options"
          :items="options"
          label="Configurações"
          placeholder="Selecione as configurações"
          multiple
          chips
          dense
          hide-details="auto"
          outlined
          :disabled="field.isDefault" />
      </v-col>

      <!-- Descrição de Ajuda (somente para campos customizados) -->
      <v-col v-if="!field.isDefault" cols="12" sm="12" md="10">
        <v-textarea
          v-model="field.description"
          label="Descrição de Ajuda"
          placeholder="Explique como usar este campo"
          dense
          outlined
          hide-details="auto"
          rows="2" />
      </v-col>

      <v-col cols="12" sm="12" md="2" class="d-flex align-center">
        <v-tooltip v-if="!field.isDefault" bottom>
          <template #activator="{ on, attrs }">
            <v-btn icon small v-bind="attrs" @click="removeCustomField(index)" v-on="on">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Remover Campo</span>
        </v-tooltip>
      </v-col>
    </v-row>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar exclusão</h3>
          <v-btn icon @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          Tem certeza de que deseja excluir "{{ fieldNameToRemove }}"?
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between align-center">
          <DefaultButton outlined text="Cancelar" @click="confirmDialog = false" />
          <DefaultButton text="Excluir" @click="confirmRemoveField" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { toast } from '@/store';
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
        { text: 'Autocomplete', value: 'autocomplete' },
        { text: 'Multiselect', value: 'multiselect' },
      ],
      options: [
        { text: 'Obrigatório', value: 'required' },
        { text: 'Único', value: 'unique' },
        { text: 'Visível na Impressão', value: 'visible_on_ticket' },
      ],
      personTypes: ['Pessoa Física (PF)', 'Pessoa Jurídica (PJ)', 'Estrangeiro'],
      confirmDialog: false,
      fieldNameToRemove: null,
      fieldIdxToRemove: null,
    };
  },

  computed: {
    tickets() {
      return this.form?.tickets.map((ticket) => ticket.name) || [];
    },
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  created() {
    this.ensureDefaultFields();
  },

  methods: {
    ensureDefaultFields() {
      const defaultFields = [
        {
          name: 'Nome Completo',
          type: 'text',
          isDefault: true,
          options: ['required', 'visible_on_ticket'],
          personTypes: ['Pessoa Física (PF)', 'Pessoa Jurídica (PJ)', 'Estrangeiro'],
        },
        {
          name: 'Email',
          type: 'email',
          isDefault: true,
          options: ['required', 'visible_on_ticket'],
          personTypes: ['Pessoa Física (PF)', 'Pessoa Jurídica (PJ)', 'Estrangeiro'],
        },
      ];

      defaultFields.forEach((defaultField) => {
        if (!this.customFields.some((field) => field.name === defaultField.name)) {
          this.customFields.push({ ...defaultField });
        }
      });

      this.updateCustomFields();
    },

    addCustomField() {
      this.customFields.push({
        name: '',
        type: '',
        required: false,
        unique: false,
        visible_on_ticket: false,
        description: '',
        tickets: [],
      });
      this.updateCustomFields();

      if (!this.form.tickets || this.form.tickets.length === 0) {
        toast.setToast({
          text: 'Nenhum ingresso criado no momento.',
          type: 'danger',
          time: 5000,
        });
      }
    },
    confirmRemoveField() {
      this.customFields.splice(this.fieldIdxToRemove, 1);
      this.updateCustomFields();
      this.confirmDialog = false;
      toast.setToast({
        text: 'Campo removido com sucesso.',
        type: 'success',
        time: 5000,
      });
    },
    removeCustomField(index) {
      this.fieldIdxToRemove = index;
      this.fieldNameToRemove =
        this.customFields[index].name || 'Campo de número ' + (index + 1);
      this.confirmDialog = true;
    },
    updateCustomFields() {
      this.$emit('update:form', { ...this.form, customFields: this.customFields });
    },
  },
};
</script>

<style scoped>
.step-custom-fields {
  margin: 0 auto;
}

.custom-field-row {
  margin-bottom: 16px;
}
</style>
