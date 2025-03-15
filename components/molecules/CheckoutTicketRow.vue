<template>
  <div class="ticket-row mb-3">
    <div class="first-ticket-column">
      <div class="ticket-name">{{ ticket.name }}</div>
      <v-icon>mdi-circle-small</v-icon>
      <div class="ticket-price">{{ formatRealValue(ticket.price) }}</div>
    </div>
    <div class="second-ticket-column">
      <div class="ticket-status">
        <v-chip small color="primary" text-color="white" class="ticket-status-chip">
          Disponível: {{ ticket.total_quantity - ticket.total_sold }}
        </v-chip>
      </div>
      <div class="quantity-controls d-flex align-center">
        <v-btn 
          icon 
          color="primary"
          :disabled="selectedQuantity <= 0" 
          @click="$emit('decrement')"
        >
          <v-icon>mdi-minus</v-icon>
        </v-btn>
        <span class="mx-3 ticket-quantity">{{ selectedQuantity }}</span>
        <v-btn 
          icon 
          color="primary"
          :disabled="selectedQuantity >= ticket.total_quantity - ticket.total_sold"
          @click="$emit('increment')"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { formatRealValue } from '@/utils/formatters';

export default {
  props: {
    ticket: { type: Object, required: true },
    selectedQuantity: { type: Number, required: true }
  },
  methods: { formatRealValue }
};
</script>

<style scoped>
.ticket-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background-color: var(--tertiary); border-radius: 8px; transition: all 0.2s ease; }
.first-ticket-column { display: flex; align-items: center; }
.ticket-name { color: var(--primary); font-size: 16px; font-weight: 700; font-family: var(--font-family-inter-bold); }
.ticket-price { color: var(--black-text); font-size: 16px; font-weight: 400; font-family: var(--font-family); }
.second-ticket-column { display: flex; align-items: center; gap: 12px; }
.ticket-status-chip { height: 24px; font-size: 12px; }
.ticket-quantity { font-size: 16px; font-weight: 700; min-width: 20px; text-align: center; }
@media (max-width: 600px) {
  .ticket-row { flex-direction: column; align-items: flex-start; }
  .second-ticket-column { width: 100%; margin-top: 8px; justify-content: space-between; }
}
</style>