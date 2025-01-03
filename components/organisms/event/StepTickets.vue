
<template>
  <v-container class="step-tickets py-0" :class="{ 'px-0': isMobile }">
    <v-row>
      <v-col cols="12" class="px-0">
        <template v-if="isMobile">
          <h3>Cadastro de Ingressos</h3>
          <p class="subtitle-1">Adicione ingresos para o evento.</p>
        </template>
        <ButtonWithIcon class="mt-2" text="Ingresso" direction="left" @click="addTicket" />
      </v-col>
    </v-row>
    <v-row
      v-for="(ticket, index) in tickets"
      :key="index"
      class="ticket-row bg-light-gray mt-6">
      <v-col cols="12">
        <TicketForm
          :ticket="ticket"
          :categories="categories"
          @update:ticket="handleUpdateTicket($event, index)"
          @remove:ticket="handleRemoveTicket(index)"
          @update:categories="handleUpdateCategories" />
      </v-col>
    </v-row>

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
                    class="inline-switch mr-4 pt-0"
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
import { isMobileDevice } from '@/utils/utils';
export default {
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
    },
    handleRemoveTicket(index) {
      this.ticketNameToRemove =
        this.tickets[index].name || 'Ingresso de número ' + (index + 1);
      this.ticketIdxToRemove = index;
      this.confirmDialog = true;
    },
  },
};
</script>

<style scoped>
.step-tickets {
  margin: 0 auto;
}
.inline-switch {
  display: inline-flex;
}
.tax-container {
  max-width: 200px;
}
</style>
