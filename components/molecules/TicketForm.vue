<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="12">
        <v-text-field
          v-model="localTicket.name"
          label="Nome do Ingresso"
          placeholder="Ex: Ingresso VIP"
          required
          outlined
          @input="emitChanges"
        />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.price"
          label="Preço (R$)"
          type="number"
          min="0"
          required
          outlined
          @input="emitChanges"
        />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.max_quantity"
          label="Quantidade Máxima"
          type="number"
          min="0"
          required
          outlined
          @input="emitChanges"
        />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.min_purchase"
          label="Compra Mínima"
          type="number"
          min="0"
          outlined
          @input="emitChanges"
        />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.max_purchase"
          label="Compra Máxima"
          type="number"
          min="0"
          outlined
          @input="emitChanges"
        />
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-menu
          v-model="openDateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="localTicket.open_date"
              label="Data de Abertura"
              readonly
              v-bind="attrs"
              outlined
              v-on="on"
              @input="emitChanges"
            />
          </template>
          <v-date-picker
            v-model="localTicket.open_date"
            locale="pt-br"
            @input="onDateChange('open_date', $event)"
          />
        </v-menu>
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-menu
          v-model="closeDateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="localTicket.close_date"
              label="Data de Fechamento"
              readonly
              v-bind="attrs"
              outlined
              v-on="on"
              @input="emitChanges"
            />
          </template>
          <v-date-picker
            v-model="localTicket.close_date"
            locale="pt-br"
            @input="onDateChange('close_date', $event)"
          />
        </v-menu>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    ticket: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      localTicket: { ...this.ticket }, // Cria uma cópia local da prop
      openDateMenu: false,
      closeDateMenu: false,
    };
  },
  methods: {
    emitChanges() {
      this.$emit('update:ticket', this.localTicket); // Emite as alterações para o componente pai
    },
    onDateChange(field, value) {
      this.localTicket[field] = value;
      this.emitChanges(); // Emite as alterações
    },
  },
};
</script>

<style scoped>
/* Adicione estilos conforme necessário */
</style>
