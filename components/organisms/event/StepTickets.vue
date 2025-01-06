
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
          @click="addTicket" />
      </v-col>
    </v-row>

    <Container :lock-axis="'y'" :drag-handle-selector="'.can-draggable'" @drop="onDrop">
      <Draggable v-for="(ticket, index) in tickets" :key="index">
        <div class="ticket-row bg-light-gray mt-6">
          <div class="ticket-order">
            <v-icon
              class="order-action"
              :disabled="index === 0"
              @click="moveTicketUp(index)"
              >mdi-arrow-up-thick</v-icon
            >
            <v-icon class="cursor-pointer can-draggable">mdi-drag-vertical</v-icon>
            <v-icon
              class="order-action"
              :disabled="index === tickets.length - 1"
              @click="moveTicketDown(index)"
              >mdi-arrow-down-thick</v-icon
            >
          </div>
          <div class="ticket-form">
            <TicketForm
              :ticket="ticket"
              :categories="categories"
              @update:ticket="handleUpdateTicket($event, index)"
              @remove:ticket="handleRemoveTicket(index)"
              @update:categories="handleUpdateCategories" />
          </div>
        </div>
      </Draggable>
    </Container>

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
    addTicket() {
      this.tickets.push({
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
      });
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
.ticket-row {
  transition: all 0.3s ease;
  padding-bottom: 14px;
  padding-top: 14px;
  padding-right: 8px;
  padding-left: 8px;
  display: grid;
  grid-template-columns: 20px 1fr;
}

.order-action {
  cursor: pointer;
}

.ticket-order {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ticket-row:active {
  cursor: grabbing;
}

.step-tickets {
  margin: 0 auto;
}
.tax-container {
  max-width: 200px;
}
</style>
