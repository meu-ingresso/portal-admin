<template>
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
      <GenericAutocomplete
        :value="localTicket.category"
        :items="localCategories"
        label="Grupo de Ingressos"
        placeholder="Digite ou selecione um grupo de ingresso"
        @input="onCategoryChange"
        @update:items="updateCategories" />
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-text-field
        v-model="localTicket.price"
        label="Preço"
        required
        outlined
        dense
        prefix="R$"
        hide-details="auto"
        @input="onPriceChange" />
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
    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="openDateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="formattedOpenDate"
            label="Data. Abertura"
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
    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="closeDateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="formattedCloseDate"
            label="Data. Fechamento"
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
    <v-col cols="12" md="3" sm="12">
      <v-select
        v-model="localTicket.availability"
        :items="availabilityList"
        return-object
        label="Disponibilidade"
        outlined
        placeholder="Selecione a disponibilidade"
        required
        dense
        hide-details="auto" />
    </v-col>
    <v-col md="2" sm="8" class="d-flex align-center">
      <v-checkbox
        v-model="localTicket.visible"
        label="Visível"
        class="inline-switch-checkbox"
        hide-details="auto"
        dense
        @change="emitChanges" />
    </v-col>
    <v-col md="1" sm="4" class="d-flex align-center">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn icon small v-bind="attrs" @click="removeTicket" v-on="on">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>Remover Ingresso</span>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script>
import { formatPrice, formatDateToBr } from '@/utils/formatters';
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
      availabilityList: [
        { text: 'Para todo o público', value: 'Publico' },
        { text: 'Restrito a convidados', value: 'Restrito' },
        { text: 'Apenas PDV interno', value: 'Interno' },
      ],
      openDateMenu: false,
      closeDateMenu: false,
    };
  },

  computed: {
    formattedOpenDate() {
      return this.localTicket.open_date ? formatDateToBr(this.localTicket.open_date) : '';
    },
    formattedCloseDate() {
      return this.localTicket.close_date
        ? formatDateToBr(this.localTicket.close_date)
        : '';
    },
  },

  watch: {
    ticket: {
      handler() {
        this.localTicket = { ...this.ticket };
      },
      deep: true,
    },
  },

  methods: {
    emitChanges() {
      this.$emit('update:ticket', this.localTicket);
      this.$emit('update:categories', this.localCategories);
    },
    onCategoryChange(value) {
      this.localTicket.category = value;
      this.emitChanges();
    },
    onPriceChange() {
      this.localTicket.price = formatPrice(this.localTicket.price);
      this.emitChanges();
    },
    onDateChange(field, value) {
      this.localTicket[field] = value;
      this.openDateMenu = false;
      this.closeDateMenu = false;
      this.emitChanges();
    },
    updateCategories(categories) {
      this.localCategories = [...categories];
      this.emitChanges();
    },
    removeTicket() {
      this.$emit('remove:ticket');
    },
  },
};
</script>

<style scoped>
</style>
