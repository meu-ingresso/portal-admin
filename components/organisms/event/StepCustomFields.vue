<template>
  <v-container class="step-custom-fields py-0 px-0">
    <v-row>
      <v-col cols="12">
        <template v-if="isMobile">
          <h3>Campos Personalizados</h3>
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
        <template v-if="getNonDeletedCustomFields.length">
          <div class="table-container">
            <!-- Cabeçalho -->
            <div class="table-header">
              <div class="table-cell hover-header"></div>
              <div class="table-cell">Nome</div>
              <div class="table-cell">Tipo</div>
              <div class="table-cell">Pessoas</div>
              <div class="table-cell">Ingressos</div>
              <div class="table-cell">Ações</div>
            </div>

            <!-- Linhas dos Campos -->
            <Container
              :lock-axis="'y'"
              :non-drag-area-selector="'.actions'"
              @drop="onDrop">
              <Draggable
                v-for="(field, index) in getNonDeletedCustomFields"
                :key="index"
                class="table-row"
                :class="{ 'disabled-row': field.is_default }">
                <div class="table-cell hover-icon">
                  <v-icon>mdi-drag-vertical</v-icon>
                </div>
                <div class="table-cell">{{ field.name ? field.name : '-' }}</div>
                <div class="table-cell">{{ field.type ? field.type : '-' }}</div>
                <div class="table-cell">
                  {{ getArrayObjectText(field.person_types) }}
                </div>
                <div class="table-cell">
                  {{
                    field.is_default
                      ? 'Todos os ingressos'
                      : getArrayObjectText(
                          field.tickets.filter((ticket) => !ticket._deleted),
                          'name'
                        )
                  }}
                </div>
                <div v-if="!field.is_default" class="table-cell actions">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        small
                        v-bind="attrs"
                        class="mr-2"
                        :disabled="field.is_default"
                        v-on="on"
                        @click="openEditModal(index)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <span>Editar Registro</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        small
                        v-bind="attrs"
                        :disabled="field.is_default"
                        v-on="on"
                        @click="handleRemoveField(index)">
                        <v-icon color="red">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>Remover Registro</span>
                  </v-tooltip>
                </div>
                <div v-else class="table-cell">-</div>
              </Draggable>
            </Container>
          </div>
        </template>
      </v-col>
    </v-row>

    <!-- Modal de Novo Campo -->
    <v-dialog v-model="newFieldModal" max-width="960px" :fullscreen="isMobile" persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Novo Campo</h3>
          <v-btn icon @click="newFieldModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <CustomFieldForm
            v-if="newFieldModal"
            ref="newFieldForm"
            :tickets="getTickets" />
        </v-card-text>
        <v-card-actions class="d-flex align-center py-5">
          <v-spacer />

          <DefaultButton outlined text="Cancelar" @click="newFieldModal = false" />
          <DefaultButton text="Salvar" @click="saveNewField" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Edição -->
    <v-dialog v-model="editModal" max-width="960px" :fullscreen="isMobile" persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar Campo</h3>
          <v-btn icon @click="editModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <CustomFieldForm
            v-if="editModal"
            ref="editFieldForm"
            :edit-index="selectedFieldIndex"
            :tickets="getTickets" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="editModal = false" />
          <DefaultButton text="Salvar" @click="saveEditedField" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar exclusão</h3>
          <v-btn icon @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>{{ confirmMessage }}</v-card-text>
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
import { toast, eventTickets, eventCustomFields } from '@/store';

export default {
  components: { Container, Draggable },
  data() {
    return {
      confirmDialog: false,
      confirmMessage: '',
      fieldIdxToRemove: null,
      editModal: false,
      selectedFieldIndex: null,
      newFieldModal: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getTickets() {
      return eventTickets.$tickets.map((ticket) => {
        return {
          id: ticket.id,
          name: ticket.name,
          _deleted: ticket._deleted,
        };
      });
    },

    getNonDeletedCustomFields() {
      return eventCustomFields.$customFields.filter((field) => !field._deleted);
    },

    getAllCustomFields() {
      return eventCustomFields.$customFields;
    },
  },

  methods: {
    handleRemoveField(index) {
      this.fieldIdxToRemove = index;
      const fieldToRemove = this.getNonDeletedCustomFields[index];
      this.confirmMessage = `Tem certeza de que deseja excluir o campo ${fieldToRemove.name} ?`;
      this.confirmDialog = true;
    },

    confirmRemoveField() {
      eventCustomFields.removeField(this.fieldIdxToRemove);
      toast.setToast({
        text: 'Campo removido com sucesso.',
        type: 'success',
        time: 5000,
      });
      this.confirmDialog = false;
    },

    openNewFieldModal() {
      this.newFieldModal = true;
    },

    saveNewField() {
      const fieldForm = this.$refs.newFieldForm;
      if (fieldForm.handleSubmit()) {
        this.newFieldModal = false;
      }
    },

    openEditModal(index) {
      this.selectedFieldIndex = index;
      this.editModal = true;
    },

    saveEditedField() {
      if (this.selectedFieldIndex !== null) {
        const fieldForm = this.$refs.editFieldForm;
        if (fieldForm.handleSubmit()) {
          this.editModal = false;
          this.selectedFieldIndex = null;
        }
      }
    },

    onDrop({ removedIndex, addedIndex }) {
      if (removedIndex !== null && addedIndex !== null) {
        const movedField = this.getNonDeletedCustomFields.splice(removedIndex, 1)[0];
        this.getNonDeletedCustomFields.splice(addedIndex, 0, movedField);
      }
    },

    getArrayObjectText(array, key = null) {
      if (!array) return '-';
      return array.map((item) => (key ? item[key] : item)).join(', ') || '-';
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
  align-items: center;
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.table-cell.hover-icon {
  cursor: grab;
  justify-content: center;
  max-width: 60px;
}

.table-cell.hover-header {
  max-width: 60px;
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
  justify-content: end;
}

.table-row.disabled-row {
  opacity: 0.6;
  background-color: #fafafa;
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
