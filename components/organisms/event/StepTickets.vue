
<template>
  <v-container class="step-tickets py-0 px-0">
    <v-row>
      <v-col cols="12">
        <template v-if="isMobile">
          <h3>Cadastro de Ingressos</h3>
          <p class="subtitle-2">Adicione ingresos para o evento.</p>
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
                <div class="table-cell">{{ ticket.name ? ticket.name : '-' }}</div>
                <div class="table-cell">
                  {{ ticket.category ? ticket.category : '-' }}
                </div>
                <div class="table-cell">R$ {{ ticket.price }}</div>
                <div class="table-cell actions">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        small
                        v-bind="attrs"
                        v-on="on"
                        @click="openEditModal(ticket, index)">
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
                        v-on="on"
                        @click="handleRemoveTicket(index)">
                        <v-icon color="red">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>Remover Registro</span>
                  </v-tooltip>
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
                  <v-btn icon small @click="openEditModal(ticket, index)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon small @click="handleRemoveTicket(index)">
                    <v-icon color="red">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </Draggable>
            </Container>
          </div>
        </template>
      </v-col>
    </v-row>

    <!-- Modal de Novo Ingresso -->
    <v-dialog v-model="newTicketModal" max-width="960px" :fullscreen="isMobile">
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
    <v-dialog v-model="editModal" max-width="960px" :fullscreen="isMobile">
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
    <v-dialog v-model="confirmDialog" max-width="500" :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar exclusão</h3>
          <v-btn icon @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          Tem certeza de que deseja excluir "{{ ticketNameToRemove }}"?
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
      existingFields: [],
      categories: [],
      confirmDialog: false,
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
    emitChanges() {
      this.$emit('update:form', { ...this.localForm });
    },

    handleUpdateTicket(ticket, index) {
      this.tickets[index] = ticket;
    },
    handleUpdateCategories(categories) {
      this.categories = [...categories];
    },
    confirmRemoveTicket() {
      this.tickets.splice(this.ticketIdxToRemove, 1);
      this.ticketIdxToRemove = null;
      this.ticketNameToRemove = null;
      this.confirmDialog = false;
      toast.setToast({
        text: 'Registro removido com sucesso.',
        type: 'success',
        time: 5000,
      });
    },
    handleRemoveTicket(index) {
      const nameToShow =
        this.tickets[index].name || `${getNomenclature} de número ` + (index + 1);

      this.ticketNameToRemove = nameToShow;
      this.ticketIdxToRemove = index;

      if (this.form.customFields.some((field) => field?.tickets?.includes(nameToShow))) {
        toast.setToast({
          text: 'Existem campos personalizados vinculados a esse registro.',
          type: 'danger',
          time: 5000,
        });
      } else {
        this.confirmDialog = true;
      }
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

    // Move o ingresso para cima
    moveTicketUp(index) {
      if (index > 0) {
        const ticket = this.tickets.splice(index, 1)[0];
        this.tickets.splice(index - 1, 0, ticket);
        this.emitChanges();
      }
    },

    // Move o ingresso para baixo
    moveTicketDown(index) {
      if (index < this.tickets.length - 1) {
        const ticket = this.tickets.splice(index, 1)[0];
        this.tickets.splice(index + 1, 0, ticket);
        this.emitChanges();
      }
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

.table-row {
  cursor: grab;
}

.table-row:active {
  cursor: grabbing;
}
</style>
