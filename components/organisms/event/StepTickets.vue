
<template>
  <v-container class="step-tickets">
    <v-row>
      <v-col cols="12">
        <h3>Cadastro de Ingressos</h3>
        <p class="subtitle-1">Adicione ingresos para o evento.</p>
        <DefaultButton class="mt-2" text="Adicionar Ingresso" @click="openTicketModal" />
      </v-col>
    </v-row>

    <!-- Tabela de Ingressos -->
    <v-simple-table v-if="localForm.tickets.length" class="mt-4">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Preço</th>
          <th>Qtd. Máxima</th>
          <th>Compra. Mínima</th>
          <th>Compra. Máxima</th>
          <th>Data. Abertura</th>
          <th>Data. Fechamento</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ticket, index) in localForm.tickets" :key="index">
          <td>{{ ticket.name }}</td>
          <td>R$ {{ ticket.price }}</td>
          <td>{{ ticket.max_quantity }}</td>
          <td>{{ ticket.min_purchase }}</td>
          <td>{{ ticket.max_purchase }}</td>
          <td>{{ ticket.open_date }}</td>
          <td>{{ ticket.close_date }}</td>
          <td>
            <v-btn text color="primary" @click="editTicket(index)">Editar</v-btn>
            <v-btn text color="red" @click="removeTicket(index)">Remover</v-btn>
          </td>
        </tr>
      </tbody>
    </v-simple-table>

    <!-- Modal de Cadastro de Ingresso -->
    <v-dialog v-model="showTicketModal" persistent max-width="1024px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h4>{{ isEditing ? 'Editar Ingresso' : 'Novo Ingresso' }}</h4>
          <v-btn icon @click="closeTicketModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <TicketStepper
            v-if="showTicketModal"
            :ticket="currentTicket"
            :existing-fields="existingFields"
            :categories="categories"
            @save="saveTicket"
            @close="closeTicketModal" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
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
      showTicketModal: false,
      isEditing: false,
      currentTicketIndex: null,
      currentTicket: null,
      existingFields: [],
      categories: [],
    };
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
      const pendingIndex = this.localForm.tickets.findIndex(
        (ticket) => !ticket.customFields || ticket.customFields.length === 0
      );

      if (pendingIndex !== -1) {
        this.currentTicketIndex = pendingIndex;
        this.showCustomFieldModal = true;
        callback(null, false);
      } else {
        callback(null, true);
      }
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
    openTicketModal() {
      this.isEditing = false;
      this.$set(this, 'currentTicket', {
        name: '',
        price: 0,
        max_quantity: 0,
        min_purchase: 0,
        max_purchase: 0,
        open_date: '',
        close_date: '',
        categorySearch: '',
        visibility: 'Público',
        category: '',
        customFields: [],
      });
      this.showTicketModal = true;
    },
    editTicket(index) {
      this.isEditing = true;
      this.currentTicketIndex = index;
      this.currentTicket = { ...this.localForm.tickets[index] };
      this.showTicketModal = true;
    },
    saveTicket(ticket) {
      if (this.isEditing) {
        this.$set(this.localForm.tickets, this.currentTicketIndex, ticket);
      } else {
        this.localForm.tickets.push(ticket);
      }
      this.populateExistingCategories();
      this.showTicketModal = false;
    },
    closeTicketModal() {
      this.showTicketModal = false;
    },
    removeTicket(index) {
      this.localForm.tickets.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.step-tickets {
  margin: 0 auto;
}

.ticket-row {
  margin-bottom: 16px;
}

.category-row {
  margin-top: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.bg-white {
  background-color: white;
}

.bg-light-gray {
  background-color: #f5f5f5;
}
</style>
