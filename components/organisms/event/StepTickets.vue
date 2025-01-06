
<template>
  <v-container class="step-tickets py-0">
    <v-row>
      <v-col cols="12">
        <template v-if="isMobile">
          <h3>Cadastro de Ingressos</h3>
          <p class="subtitle-2">Adicione ingresos para o evento.</p>
        </template>
        <ButtonWithIcon
          class="mt-2"
          text="Ingresso"
          direction="left"
          @click="openNewTicketModal" />
      </v-col>
    </v-row>

    <template v-if="tickets.length">

      <!-- Estrutura de Tabela Desktop -->
      <div v-if="!isMobile" class="table-container mt-4">
        <!-- Cabeçalho -->
        <div class="table-header">
          <div class="table-cell">Nome</div>
          <div class="table-cell">Categoria</div>
          <div class="table-cell">Preço</div>
          <div class="table-cell">Ações</div>
        </div>

        <!-- Linhas Reordenáveis -->
        <Container :lock-axis="'y'" :non-drag-area-selector="'.actions'" @drop="onDrop">
          <Draggable v-for="(ticket, index) in tickets" :key="index" class="table-row">
            <div class="table-cell">{{ ticket.name ? ticket.name : '-' }}</div>
            <div class="table-cell">{{ ticket.category ? ticket.category : '-' }}</div>
            <div class="table-cell">R$ {{ ticket.price }}</div>
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

      <!-- Estrutura de Tabela Celular -->
      <div v-else class="table-container mt-4">
        <!-- Cabeçalho -->
        <div class="table-header">
          <div class="table-cell">Nome</div>
          <div class="table-cell">Ações</div>
        </div>

        <!-- Linhas Reordenáveis -->
        <Container :lock-axis="'y'" :non-drag-area-selector="'.actions'" @drop="onDrop">
          <Draggable v-for="(ticket, index) in tickets" :key="index" class="table-row">
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

    <v-row v-if="tickets.length" class="mt-4">
      <v-col cols="12" class="px-0">
        <v-card tile>
          <v-card-title>
            <p class="subtitle-1">Configurações</p>
          </v-card-title>
          <v-card-text>
            <v-row class="d-flex align-center justify-space-between">
              <v-col cols="12" md="8" sm="12">
                <div class="d-flex align-center">
                  <v-switch
                    v-model="absorveTax"
                    class="inline-switch-checkbox mr-4 pt-0"
                    label="Absorver a taxa de serviço"
                    dense
                    hide-details="auto" />
                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-icon color="gray" v-bind="attrs" v-on="on"
                        >mdi-help-circle</v-icon
                      >
                    </template>
                    <span class="tax-container">
                      Ao selecionar essa opção, a taxa de serviço (10%) será incluída no
                      preço final de venda do ingresso e não será mostrada ao comprador
                    </span>
                  </v-tooltip>
                </div>
              </v-col>
              <v-col cols="12" md="4" sm="12" class="d-flex align-center">
                <p class="mr-4">Nomenclatura:</p>
                <v-select
                  v-model="nomenclature"
                  :items="nomenclatureOptions"
                  outlined
                  dense
                  hide-details="auto"
                  required />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de Novo Ingresso -->
    <v-dialog v-model="newTicketModal" max-width="800px" :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Novo Ingresso</h3>
          <v-btn icon @click="newTicketModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <TicketForm
            :ticket="newTicket"
            :categories="categories"
            @update:ticket="updateNewTicketFields"
            @update:categories="handleUpdateCategories" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between">
          <DefaultButton outlined text="Cancelar" @click="newTicketModal = false" />
          <DefaultButton text="Salvar" @click="saveNewTicket" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Edição -->
    <v-dialog v-model="editModal" max-width="800px" :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar Ingresso</h3>
          <v-btn icon @click="editModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <TicketForm
            :ticket="selectedTicket"
            :categories="categories"
            @update:ticket="updateTicketFields"
            @update:categories="handleUpdateCategories" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between">
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
      nomenclature: 'Ingresso',
      nomenclatureOptions: ['Ingresso', 'Inscrição', 'Doação'],
      absorveTax: false,
      editModal: false,
      selectedTicket: null,
      selectedTicketIndex: null,
      newTicketModal: false,
      newTicket: {
        name: '',
        category: '',
        price: 0,
        max_quantity: 0,
        min_purchase: 0,
        max_purchase: 0,
        open_date: '',
        close_date: '',
        visible: true,
        quantity: 0,
        customFields: [],
      },
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
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
        text: 'Ingresso removido com sucesso.',
        type: 'success',
        time: 5000,
      });
    },
    handleRemoveTicket(index) {
      const nameToShow = this.tickets[index].name || 'Ingresso de número ' + (index + 1);

      this.ticketNameToRemove = nameToShow;
      this.ticketIdxToRemove = index;

      if (this.form.customFields.some((field) => field?.tickets?.includes(nameToShow))) {
        toast.setToast({
          text: 'Existem campos personalizados vinculados a esse ingresso.',
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
        price: 0,
        max_quantity: 0,
        min_purchase: 0,
        max_purchase: 0,
        open_date: '',
        close_date: '',
        visible: true,
        quantity: 0,
        customFields: [],
      };
      this.newTicketModal = true;
    },

    updateNewTicketFields(updatedTicket) {
      this.newTicket = updatedTicket;
    },
    saveNewTicket() {
      this.tickets.push({ ...this.newTicket });
      this.newTicketModal = false;
      this.emitChanges();
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
        this.$set(this.tickets, this.selectedTicketIndex, this.selectedTicket);
        this.emitChanges();
        this.editModal = false;
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
