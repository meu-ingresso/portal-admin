<template>
  <v-container class="step-custom-fields py-0 px-0">
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
          @click="openNewFieldModal" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <template v-if="customFields.length">
          <div class="table-container">
            <!-- Cabeçalho -->
            <div class="table-header">
              <div class="table-cell">Nome</div>
              <div class="table-cell">Tipo</div>
              <div class="table-cell">Pessoas</div>
              <div class="table-cell">Configurações</div>
              <div class="table-cell">Ações</div>
            </div>

            <!-- Linhas dos Campos -->
            <Container
              :lock-axis="'y'"
              :non-drag-area-selector="'.actions .disabled-row'"
              @drop="onDrop">
              <Draggable
                v-for="(field, index) in customFields"
                :key="index"
                class="table-row"
                :class="{ 'disabled-row': field.isDefault }">
                <div class="table-cell">{{ field.name ? field.name : '-' }}</div>
                <div class="table-cell">{{ field.type ? field.type : '-' }}</div>
                <div class="table-cell">
                  {{ field.personTypes ? getArrayObjectText(field.personTypes) : '-' }}
                </div>
                <div class="table-cell">
                  {{ field.options ? getArrayObjectText(field.options) : '-' }}
                </div>
                <div class="table-cell actions">
                  <v-btn
                    icon
                    small
                    :disabled="field.isDefault"
                    @click="openEditModal(field, index)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    :disabled="field.isDefault"
                    @click="removeCustomField(index)">
                    <v-icon color="red">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </Draggable>
            </Container>
          </div>
        </template>
      </v-col>
    </v-row>

    <!-- Modal de Novo Campo -->
    <v-dialog v-model="newFieldModal" max-width="800px" :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Novo Campo</h3>
          <v-btn icon @click="newFieldModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <CustomFieldForm
            ref="newCustomFieldForm"
            :field="newField"
            :tickets="tickets"
            :person-types="personTypes"
            :options="options"
            @update:field="updateNewFieldFields" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="newFieldModal = false" />
          <DefaultButton text="Salvar" @click="saveNewField" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Edição -->
    <v-dialog v-model="editModal" max-width="800px" :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar Campo</h3>
          <v-btn icon @click="editModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <CustomFieldForm
            ref="editCustomFieldForm"
            :field="selectedField"
            :tickets="tickets"
            :person-types="personTypes"
            :options="options"
            @update:field="updateFieldFields" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="editModal = false" />
          <DefaultButton text="Salvar" @click="saveEditedField" />
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { Container, Draggable } from 'vue-smooth-dnd';
import { isMobileDevice } from '@/utils/utils';
import { toast } from '@/store';
export default {
  components: { Container, Draggable },
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
      personTypes: [
        { text: 'Pessoa Física (PF)', value: 'PF' },
        { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
        { text: 'Estrangeiro', value: 'Estrangeiro' },
      ],
      confirmDialog: false,
      fieldNameToRemove: null,
      fieldIdxToRemove: null,
      newFieldModal: false,
      newField: this.getEmptyField(),
      editModal: false,
      selectedField: null,
      selectedFieldIndex: null,
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
          options: [
            { text: 'Obrigatório', value: 'required' },
            { text: 'Visível na Impressão', value: 'visible_on_ticket' },
          ],
          personTypes: [
            { text: 'Pessoa Física (PF)', value: 'PF' },
            { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
            { text: 'Estrangeiro', value: 'Estrangeiro' },
          ],
        },
        {
          name: 'Email',
          type: 'email',
          isDefault: true,
          options: [
            { text: 'Obrigatório', value: 'required' },
            { text: 'Visível na Impressão', value: 'visible_on_ticket' },
          ],
          personTypes: [
            { text: 'Pessoa Física (PF)', value: 'PF' },
            { text: 'Pessoa Jurídica (PJ)', value: 'PJ' },
            { text: 'Estrangeiro', value: 'Estrangeiro' },
          ],
        },
      ];

      defaultFields.forEach((defaultField) => {
        if (!this.customFields.some((field) => field.name === defaultField.name)) {
          this.customFields.push({ ...defaultField });
        }
      });

      this.emitChanges();
    },

    getEmptyField() {
      return {
        name: '',
        type: '',
        tickets: [],
        personTypes: [],
        options: [],
        description: '',
      };
    },
    openNewFieldModal() {
      this.newField = this.getEmptyField();
      this.newFieldModal = true;
    },
    updateNewFieldFields(updatedField) {
      this.newField = updatedField;
    },
    saveNewField() {
      const fieldForm = this.$refs.newCustomFieldForm;

      if (fieldForm.validateForm()) {
        this.customFields.push({ ...this.newField });
        this.newFieldModal = false;
        this.emitChanges();
      } else {
        console.log('[INSERÇÃO - FieldForm] Erro de validação:', fieldForm.errors);
      }
    },
    openEditModal(field, index) {
      this.selectedField = { ...field };
      this.selectedFieldIndex = index;
      this.editModal = true;
    },
    updateFieldFields(updatedField) {
      this.selectedField = updatedField;
    },
    saveEditedField() {
      if (this.selectedFieldIndex !== null) {
        const fieldForm = this.$refs.editCustomFieldForm;

        if (fieldForm.validateForm()) {
          this.$set(this.customFields, this.selectedFieldIndex, this.selectedField);
          this.editModal = false;
          this.emitChanges();
        } else {
          console.log('[EDIÇÃO - FieldForm] Erro de validação:', fieldForm.errors);
        }
      }
    },
    handleRemoveField(index) {
      this.customFields.splice(index, 1);
      this.emitChanges();
    },

    confirmRemoveField() {
      this.customFields.splice(this.fieldIdxToRemove, 1);
      this.emitChanges();
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

    emitChanges() {
      this.$emit('update:form', { ...this.form, customFields: this.customFields });
    },

    onDrop({ removedIndex, addedIndex }) {
      if (removedIndex !== null && addedIndex !== null) {
        const movedTicket = this.customFields.splice(removedIndex, 1)[0];
        this.customFields.splice(addedIndex, 0, movedTicket);
      }
    },

    getArrayObjectText(arrayValue) {
      return arrayValue.map((item) => item.text).join(', ');
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

.table-container {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--tertiary);
  border-radius: 8px;
}

.table-header,
.table-row {
  display: flex !important;
}

.table-cell {
  flex: 1;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.table-header .table-cell {
  font-size: 14px;
}

.table-row .table-cell {
  font-size: 12px;
}

.table-header {
  background-color: #f4f4f4;
  font-weight: bold;
  font-size: 16px;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.table-cell:last-child {
  text-align: right;
}

.table-row.disabled-row {
  opacity: 0.6;
  pointer-events: none;
  background-color: #f9f9f9;
}

.table-row.disabled-row .table-cell {
  font-style: italic;
}

.table-row {
  cursor: grab;
}

.table-row:active {
  cursor: grabbing;
}
</style>
