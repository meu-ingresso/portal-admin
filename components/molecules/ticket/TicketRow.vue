<template>
  <v-row class="ticket-row cursor-pointer mr-0 ml-0">
    <v-col cols="12" md="6" sm="12">
      <div class="first-ticket-column">
        <div class="ticket-name">{{ name }}</div>

        <v-icon>mdi-circle-small</v-icon>

        <div class="ticket-price">{{ formatToMoney(price) }}</div>
      </div>
    </v-col>

    <v-col cols="12" md="6" sm="12">
      <div class="second-ticket-column">
        <StatusBadge :text="status" />

        <v-icon>mdi-circle-small</v-icon>

        <div class="ticket-sold">{{ sold }} / {{ total }}</div>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { formatRealValue } from '@/utils/formatters';
export default {
  props: {
    name: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, required: true },
    sold: { type: Number, required: true },
    total: { type: Number, required: true },
  },

  methods: {
    formatToMoney(value) {
      return formatRealValue(value);
    },
  },
};
</script>

<style scoped>
.ticket-row {
  margin-bottom: 12px;
  background-color: var(--tertiary);
  border-radius: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-right: 14px;
  padding-left: 14px;
  align-items: center;
  transition: transform 0.3s ease;
}

.ticket-row:hover {
  transform: scale(1.005);
}

.first-ticket-column,
.second-ticket-column {
  display: flex;
  align-items: center;
}

.second-ticket-column {
  justify-content: flex-end;
}

.ticket-name {
  color: var(--primary);
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-family-poppins-bold);
}

.ticket-price {
  color: var(--black-text);
  font-size: 16px;
  font-weight: 400;
  font-family: var(--font-family);
}
</style>
