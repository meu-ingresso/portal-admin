<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" sm="12">
        <v-text-field
          v-model="localTicket.name"
          label="Nome do Ingresso"
          placeholder="Ex: Ingresso VIP"
          required
          outlined
          dense
          hide-details="auto"
          @input="emitChanges" />
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-autocomplete
          v-model="localTicket.category"
          :items="localCategories"
          label="Categoria"
          :search-input.sync="localTicket.categorySearch"
          no-data-text="Nenhuma categoria encontrada"
          required
          outlined
          dense
          hide-details="auto"
          @update:search-input="onTriggerCategorySearch"
          @change="onCategoryChange" />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.price"
          label="Preço (R$)"
          type="number"
          min="0"
          required
          outlined
          dense
          hide-details="auto"
          @input="emitChanges" />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.max_quantity"
          label="Quantidade Máxima"
          type="number"
          min="0"
          required
          outlined
          dense
          hide-details="auto"
          @input="emitChanges" />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.min_purchase"
          label="Compra Mínima"
          type="number"
          min="0"
          outlined
          dense
          hide-details="auto"
          @input="emitChanges" />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.max_purchase"
          label="Compra Máxima"
          type="number"
          min="0"
          outlined
          dense
          hide-details="auto"
          @input="emitChanges" />
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-menu
          v-model="openDateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="localTicket.open_date"
              label="Data de Abertura"
              readonly
              v-bind="attrs"
              outlined
              dense
              hide-details="auto"
              v-on="on"
              @input="emitChanges" />
          </template>
          <v-date-picker
            v-model="localTicket.open_date"
            locale="pt-br"
            @input="onDateChange('open_date', $event)" />
        </v-menu>
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-menu
          v-model="closeDateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="localTicket.close_date"
              label="Data de Fechamento"
              readonly
              v-bind="attrs"
              outlined
              dense
              hide-details="auto"
              v-on="on"
              @input="emitChanges" />
          </template>
          <v-date-picker
            v-model="localTicket.close_date"
            locale="pt-br"
            @input="onDateChange('close_date', $event)" />
        </v-menu>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Debounce from '@/utils/Debounce';
export default {
  props: {
    ticket: {
      type: Object,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      localTicket: { ...this.ticket },
      localCategories: [...this.categories],
      openDateMenu: false,
      closeDateMenu: false,
    };
  },

  watch: {
    ticket: {
      handler() {
        this.localTicket = { ...this.ticket };
      },
      deep: true,
    },
  },

  created() {
    this.debouncer = new Debounce(this.onCategorySearch, 900);
  },
  methods: {
    emitChanges() {
      this.$emit('update:ticket', this.localTicket);
      this.$emit('update:categories', this.localCategories);
    },
    onDateChange(field, value) {
      this.localTicket[field] = value;
      this.emitChanges();
    },
    onTriggerCategorySearch() {
      this.debouncer.execute();
    },
    onCategorySearch() {
      const search = this.localTicket.categorySearch;
      console.log('Searching for', search);
      if (
        search &&
        !this.localCategories.includes(search) &&
        !this.localCategories.includes(`Criar categoria e atribuir "${search}"`)
      ) {
        this.localCategories.push(`Criar categoria e atribuir "${search}"`);
      } else {
        this.clearTempCategories();
      }
    },
    onCategoryChange() {
      const category = this.localTicket.category;
      if (category && category.startsWith('Criar categoria e atribuir')) {
        const newCategory = category
          .replace('Criar categoria e atribuir "', '')
          .replace('"', '');
        this.localCategories.push(newCategory);
        this.localTicket.category = newCategory;
        this.clearTempCategories();
      }
    },
    clearTempCategories() {
      this.localCategories = this.localCategories.filter(
        (category) => !category.startsWith('Criar categoria e atribuir')
      );
      this.emitChanges();
    },
  },
};
</script>

<style scoped>
/* Adicione estilos conforme necessário */
</style>
