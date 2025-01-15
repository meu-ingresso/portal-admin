
<template>
  <v-container class="step-tickets py-0 px-0">
    <v-row>
      <v-col cols="12">
        <template v-if="isMobile">
          <h3>{{ getNomenclature }}</h3>
          <p class="subtitle-2">
            Adicione {{ nomenclature?.toLowerCase() }} para o evento.
          </p>
        </template>
        <ButtonWithIcon
          class="mt-2"
          :text="getNomenclature"
          direction="left"
          @click="openNewTicketModal" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <template v-if="tickets.length">
          <!-- Estrutura de Tabela Desktop -->
          <div v-if="!isMobile" class="table-container">
            <!-- Cabeçalho -->
            <div class="table-header">
              <div class="table-cell hover-header"></div>
              <div class="table-cell">Nome</div>
              <div class="table-cell">Categoria</div>
              <div class="table-cell">Preço</div>
              <div class="table-cell">Ações</div>
            </div>

            <!-- Linhas Reordenáveis -->
            <Container
              :lock-axis="'y'"
              :non-drag-area-selector="'.actions'"
              @drop="onDrop">
              <Draggable
                v-for="(ticket, index) in tickets"
                :key="index"
                class="table-row">
                <div class="table-cell hover-icon">
                  <v-icon>mdi-drag-vertical</v-icon>
                </div>
                <div class="table-cell">{{ ticket.name ? ticket.name : '-' }}</div>
                <div class="table-cell">
                  {{ ticket.category ? ticket.category : '-' }}
                </div>
                <div class="table-cell">R$ {{ ticket.price }}</div>
                <div class="table-cell actions">
                  <ActionsMenu
                    :index="index"
                    :show-edit="true"
                    :show-duplicate="true"
                    :show-delete="true"
                    @edit="openEditModal(ticket, $event)"
                    @duplicate="duplicateTicket"
                    @delete="handleRemoveTicket" />
                </div>
              </Draggable>
            </Container>
          </div>

          <!-- Estrutura de Tabela Celular -->
          <div v-else class="table-container">
            <!-- Cabeçalho -->
            <div class="table-header">
              <div class="table-cell">Nome</div>
              <div class="table-cell">Ações</div>
            </div>

            <!-- Linhas Reordenáveis -->
            <Container
              :lock-axis="'y'"
              :non-drag-area-selector="'.actions'"
              @drop="onDrop">
              <Draggable
                v-for="(ticket, index) in tickets"
                :key="index"
                class="table-row">
                <div class="table-cell">{{ ticket.name ? ticket.name : '-' }}</div>
                <div class="table-cell actions">
                  <ActionsMenu
                    :index="index"
                    :show-edit="true"
                    :show-duplicate="true"
                    :show-delete="true"
                    @edit="openEditModal(ticket, $event)"
                    @duplicate="duplicateTicket"
                    @delete="handleRemoveTicket" />
                </div>
              </Draggable>
            </Container>
          </div>
        </template>
      </v-col>
    </v-row>

    <!-- Modal de Novo Ingresso -->
    <v-dialog
      v-model="newTicketModal"
      max-width="960px"
      :fullscreen="isMobile"
      persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>{{ getNewItemModalTitle }}</h3>
          <v-btn icon @click="newTicketModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <TicketForm
            ref="newTicketForm"
            :ticket="newTicket"
            :categories="categories"
            :nomenclature="getNomenclature"
            :event-start-date="form.startDate"
            :event-end-date="form.endDate"
            @update:ticket="updateNewTicketFields"
            @update:categories="handleUpdateCategories" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="newTicketModal = false" />
          <DefaultButton text="Salvar" @click="saveNewTicket" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Edição -->
    <v-dialog v-model="editModal" max-width="960px" :fullscreen="isMobile" persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar {{ getNomenclature }}</h3>
          <v-btn icon @click="editModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <TicketForm
            ref="editTicketForm"
            :ticket="selectedTicket"
            :categories="categories"
            :nomenclature="getNomenclature"
            :event-start-date="form.startDate"
            :event-end-date="form.endDate"
            @update:ticket="updateTicketFields"
            @update:categories="handleUpdateCategories" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="editModal = false" />
          <DefaultButton text="Salvar" @click="saveEditedTicket" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500" :fullscreen="isMobile" persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar exclusão</h3>
          <v-btn icon @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          {{ confirmMessage }}
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between align-center">
          <DefaultButton outlined text="Cancelar" @click="confirmDialog = false" />
          <DefaultButton text="Excluir" @click="confirmRemoveTicket" />
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
    nomenclature: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      localForm: { ...this.form },
      tickets: this.form.tickets || [],
      customFields: this.form.customFields || [],
      existingFields: [],
      categories: [],
      confirmDialog: false,
      confirmMessage: '',
      ticketIdxToRemove: null,
      ticketNameToRemove: null,
      editModal: false,
      selectedTicket: null,
      selectedTicketIndex: null,
      newTicketModal: false,
      newTicket: {
        name: '',
        category: '',
        price: '',
        max_quantity: '',
        min_purchase: '',
        max_purchase: '',
        open_date: '',
        start_time: '',
        close_date: '',
        end_time: '',
        visible: true,
        availability: '',
        quantity: '',
        customFields: [],
      },
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    getNomenclature() {
      switch (this.nomenclature) {
        case 'Ingressos':
          return 'Ingresso';
        case 'Inscrições':
          return 'Inscrição';
        case 'Doações':
          return 'Doação';
        default:
          return 'Ingresso';
      }
    },
    getNewItemModalTitle() {
      if (this.getNomenclature === 'Ingresso') {
        return `Novo ${this.getNomenclature}`;
      }
      return `Nova ${this.getNomenclature}`;
    },
  },

  watch: {
    localForm: {
      handler() {
        this.emitChanges();
      },
      deep: true,
    },
    'form.customFields': {
      handler(newFields) {
        this.customFields = [...newFields];
      },
      deep: true,
    },
  },

  mounted() {
    this.populateExistingFields();
  },

  methods: {
    canProceed(callback) {
      callback(null, true);
    },
    populateExistingFields() {
      this.existingFields = [];

      this.localForm.tickets.forEach((ticket) => {
        ticket.customFields.forEach((field) => {
          if (!this.existingFields.some((existing) => existing.name === field.name)) {
            this.existingFields.push(field);
          }
        });
      });
    },
    populateExistingCategories() {
      this.categories = [];

      this.localForm.tickets.forEach((ticket) => {
        if (!this.categories.includes(ticket.category)) {
          this.categories.push(ticket.category);
        }
      });
    },

    duplicateTicket(index) {
      const ticketToDuplicate = { ...this.tickets[index] };
      const baseName = `Cópia de ${ticketToDuplicate.name}`;
      let newName = baseName;

      // Se já existir "Cópia de <nome>", começamos a adicionar sufixos numéricos
      if (this.tickets.some((ticket) => ticket.name === baseName)) {
        let counter = 2;
        while (this.tickets.some((ticket) => ticket.name === newName)) {
          newName = `${baseName} (${counter})`;
          counter++;
        }
      }

      // Define o nome único e adiciona o ingresso duplicado
      ticketToDuplicate.name = newName;
      this.tickets.push(ticketToDuplicate);

      // Emite a mudança
      this.emitChanges();

      // Feedback visual
      this.$toast.success(`Ingresso "${newName}" duplicado com sucesso!`);
    },

    emitChanges() {
      this.$emit('update:form', {
        ...this.localForm,
        tickets: this.tickets,
        customFields: this.customFields,
      });
    },

    handleUpdateTicket(ticket, index) {
      this.tickets[index] = ticket;
    },
    handleUpdateCategories(categories) {
      this.categories = [...categories];
    },
    confirmRemoveTicket() {
      const removedTicket = this.tickets.splice(this.ticketIdxToRemove, 1)[0];
      const relatedFields = this.getRelatedCustomFields(removedTicket.name);
      const hasReletedFields = relatedFields.length > 0;

      if (hasReletedFields) {
        this.removeCustomFieldsLinkedToTicket(removedTicket.name);
      }

      this.emitChanges();
      toast.setToast({
        text: hasReletedFields
          ? 'Ingresso e seus respectivos campos removidos com sucesso'
          : 'Ingresso removido com sucesso.',
        type: 'success',
        time: 5000,
      });
      this.confirmDialog = false;
    },

    handleRemoveTicket(index) {
      this.ticketIdxToRemove = index;
      this.ticketNameToRemove = this.tickets[index]?.name || `Ingresso ${index + 1}`;
      const relatedFields = this.getRelatedCustomFields(this.ticketNameToRemove);

      if (relatedFields.length > 0) {
        this.confirmMessage = `O ingresso "${this.ticketNameToRemove}" está vinculado a campos personalizados. Deseja removê-los também?`;
      } else {
        this.confirmMessage = `Tem certeza de que deseja excluir "${this.ticketNameToRemove}"?`;
      }

      this.confirmDialog = true;
    },

    openNewTicketModal() {
      this.newTicket = {
        name: '',
        category: '',
        price: '',
        max_quantity: '',
        min_purchase: '',
        max_purchase: '',
        open_date: '',
        start_time: '',
        close_date: '',
        end_time: '',
        visible: true,
        availability: '',
        quantity: '',
        customFields: [],
      };
      this.newTicketModal = true;
    },

    updateNewTicketFields(updatedTicket) {
      this.newTicket = updatedTicket;
    },
    saveNewTicket() {
      const ticketForm = this.$refs.newTicketForm;

      if (ticketForm.validateForm()) {
        this.tickets.push({ ...this.newTicket });
        this.newTicketModal = false;
        this.emitChanges();
      } else {
        console.log('[INSERÇÃO - TicketForm] Erro de validação:', ticketForm.errors);
      }
    },

    openEditModal(ticket, index) {
      this.selectedTicket = { ...ticket };
      this.selectedTicketIndex = index;
      this.editModal = true;
    },
    updateTicketFields(updatedTicket) {
      this.selectedTicket = updatedTicket;
    },
    saveEditedTicket() {
      if (this.selectedTicketIndex !== null) {
        const ticketForm = this.$refs.editTicketForm;

        if (ticketForm.validateForm()) {
          this.$set(this.tickets, this.selectedTicketIndex, this.selectedTicket);
          this.emitChanges();
          this.editModal = false;
        } else {
          console.log('[EDIÇÃO - TicketForm] Erro de validação:', ticketForm.errors);
        }
      }
    },

    getRelatedCustomFields(ticketName) {
      return this.customFields.filter((field) => field?.tickets.includes(ticketName));
    },

    removeCustomFieldsLinkedToTicket(ticketName) {
      this.customFields.forEach((field) => {
        const index = field.tickets.indexOf(ticketName);
        if (index !== -1) {
          field?.tickets.splice(index, 1);
        }
      });

      // Remove campos personalizados que não estão vinculados a nenhum ingresso e não sejam padrão
      this.customFields = this.customFields.filter(
        (field) => field.tickets.length > 0 || field.isDefault
      );
    },

    onDrop({ removedIndex, addedIndex }) {
      if (removedIndex !== null && addedIndex !== null) {
        const movedTicket = this.tickets.splice(removedIndex, 1)[0];
        this.tickets.splice(addedIndex, 0, movedTicket);
      }
    },
  },
};
</script>

<style scoped>
.step-tickets {
  margin: 0 auto;
}
.tax-container {
  max-width: 200px;
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

.table-row {
  cursor: grab;
}

.table-row:active {
  cursor: grabbing;
}
</style>
