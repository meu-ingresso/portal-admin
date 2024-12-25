
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
    <v-simple-table class="mt-4">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Preço</th>
          <th>Quantidade Máxima</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ticket, index) in localForm.tickets" :key="index">
          <td>{{ ticket.name }}</td>
          <td>R$ {{ ticket.price }}</td>
          <td>{{ ticket.max_quantity }}</td>
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
            :ticket="currentTicket"
            :existing-fields="existingFields"
            @save="saveTicket"
            @close="closeTicketModal" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Debounce from '@/utils/Debounce';
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
      existingFields: [], // Campos customizados existentes
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

  created() {
    this.debouncer = new Debounce(this.onCategorySearch, 900);
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
    emitChanges() {
      this.$emit('update:form', { ...this.localForm });
    },
    onTriggerCategorySearch(ticketIndex) {
      this.debouncer.execute(ticketIndex);
    },
    onCategorySearch(ticketIndex) {
      const search = this.localForm.tickets[ticketIndex].categorySearch;
      if (
        search &&
        !this.categories.includes(search) &&
        !this.categories.includes(`Criar categoria e atribuir "${search}"`)
      ) {
        this.categories.push(`Criar categoria e atribuir "${search}"`);
      } else {
        this.clearTempCategories();
      }
    },
    onCategoryChange(ticketIndex) {
      const category = this.localForm.tickets[ticketIndex].category;
      if (category && category.startsWith('Criar categoria e atribuir')) {
        const newCategory = category
          .replace('Criar categoria e atribuir "', '')
          .replace('"', '');
        this.categories.push(newCategory);
        this.localForm.tickets[ticketIndex].category = newCategory;
        this.clearTempCategories();
      }
    },
    clearTempCategories() {
      this.categories = this.categories.filter(
        (category) => !category.startsWith('Criar categoria e atribuir')
      );
    },

    openTicketModal() {
      this.isEditing = false;
      this.currentTicket = {
        name: '',
        price: 0,
        max_quantity: 0,
        min_purchase: 0,
        max_purchase: 0,
        open_date: '',
        close_date: '',
        visibility: 'Público',
        category: '',
        customFields: [],
      };
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
