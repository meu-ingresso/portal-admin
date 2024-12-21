
<template>
  <v-container class="step-tickets">
    <v-row>
      <v-col cols="12">
        <h3>Cadastro de Ingressos</h3>
        <p class="subtitle-1">Adicione ingresos para o evento.</p>
        <DefaultButton class="mt-2" text="Adicionar Ingresso" @click="addTicket" />
      </v-col>
    </v-row>

    <v-row
      v-for="(ticket, ticketIndex) in localForm.tickets"
      :key="ticketIndex"
      class="ticket-row"
      :class="{
        'bg-white': ticketIndex % 2 === 0,
        'bg-light-gray': ticketIndex % 2 !== 0,
      }">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="ticket.name"
          label="Nome do Ingresso"
          placeholder="Ex: Ingresso VIP"
          required />
      </v-col>
      <v-col cols="12" sm="2">
        <v-text-field
          v-model="ticket.price"
          label="Preço (R$)"
          type="number"
          min="0"
          required />
      </v-col>
      <v-col cols="12" sm="2">
        <v-text-field
          v-model="ticket.max_quantity"
          label="Quantidade Máxima"
          type="number"
          min="0"
          required />
      </v-col>
      <v-col cols="12" sm="2">
        <v-text-field
          v-model="ticket.min_purchase"
          label="Compra Mínima"
          type="number"
          min="0"
          required />
      </v-col>
      <v-col cols="12" sm="2">
        <v-text-field
          v-model="ticket.max_purchase"
          label="Compra Máxima"
          type="number"
          min="0"
          required />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-menu
          v-model="ticket.open_date_menu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="ticket.open_date"
              label="Data de Abertura"
              readonly
              v-bind="attrs"
              v-on="on" />
          </template>
          <v-date-picker
            v-model="ticket.open_date"
            @input="ticket.open_date_menu = false"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-menu
          v-model="ticket.close_date_menu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="ticket.close_date"
              label="Data de Fechamento"
              readonly
              v-bind="attrs"
              v-on="on" />
          </template>
          <v-date-picker
            v-model="ticket.close_date"
            @input="ticket.close_date_menu = false"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" md="2" sm="12">
        <v-select
          v-model="ticket.visibility"
          :items="['Público', 'Privado']"
          label="Visibilidade"
          required />
      </v-col>
      <v-col cols="12" md="2" sm="12">
        <v-autocomplete
          v-model="ticket.category"
          :items="categories"
          label="Categoria"
          :search-input.sync="ticket.categorySearch"
          no-data-text="Nenhuma categoria encontrada"
          required
          @update:search-input="onTriggerCategorySearch(ticketIndex)"
          @change="onCategoryChange(ticketIndex)" />
      </v-col>
      <v-col cols="12" md="2" sm="12" class="d-flex align-center">
        <v-btn color="red" text @click="removeTicket(ticketIndex)">
          Remover Ingresso
        </v-btn>
      </v-col>
    </v-row>
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
      tickets: [],
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

  created() {
    this.debouncer = new Debounce(this.onCategorySearch, 900);
  },

  methods: {
    emitChanges() {
      this.$emit('update:form', { ...this.localForm });
    },
    removeTicket(ticketIndex) {
      this.localForm.tickets.splice(ticketIndex, 1);
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
    addTicket() {
      this.localForm.tickets.push({
        name: '',
        price: 0,
        max_quantity: 0,
        min_purchase: 0,
        max_purchase: 0,
        open_date: '',
        close_date: '',
        visibility: 'Público',
        category: '',
        categorySearch: '',
        open_date_menu: false,
        close_date_menu: false,
      });
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
