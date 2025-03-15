<template>
  <v-card outlined class="checkout-summary">
    <div class="summary-header">
      <h4 class="ticket-section-title">Resumo do Pedido</h4>
    </div>
    
    <div class="summary-content">
      <div v-if="selectedTickets.length === 0" class="text-center py-4">
        <p class="empty-cart-message">Selecione ingressos para continuar.</p>
      </div>
      <div v-else>
        <div class="selected-tickets-list">
          <div v-for="item in selectedTickets" :key="item.id" class="selected-ticket-item">
            <div class="selected-ticket-info">
              <span class="selected-ticket-quantity">{{ item.quantity }}x</span>
              <span class="selected-ticket-name">{{ item.name }}</span>
            </div>
            <span class="selected-ticket-price">{{ formatRealValue(item.total) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="selectedTickets.length > 0" class="summary-footer">
      <v-divider class="mb-3"></v-divider>
      <div class="checkout-totals">
        <div class="checkout-total-row">
          <span class="checkout-total-label font-weight-bold">Total</span>
          <span class="checkout-total-value font-weight-bold">{{ formatRealValue(totalAmount) }}</span>
        </div>
        <div class="checkout-total-row mt-2">
          <span class="checkout-total-label grey--text">Taxa ({{ eventFeePercentage }}%)</span>
          <span class="checkout-total-value grey--text">{{ formatRealValue(calculateFee) }}</span>
        </div>
        <div class="checkout-total-row mt-2">
          <span class="checkout-total-label grey--text">Valor Líquido</span>
          <span class="checkout-total-value grey--text">{{ formatRealValue(netAmount) }}</span>
        </div>
      </div>

      <div class="mt-4">
        <slot name="actions"></slot>
      </div>
    </div>
  </v-card>
</template>

<script>
import { formatRealValue } from '@/utils/formatters';

export default {
  props: {
    selectedTickets: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
    calculateFee: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    isProcessing: { type: Boolean, required: true },
    eventFeePercentage: { type: Number, required: true }
  },
  methods: { formatRealValue }
};
</script>

<style scoped>
.checkout-summary { 
  background-color: white; 
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-header {
  padding: 16px 16px 8px 16px;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
  min-height: 100px;
}

.summary-footer {
  padding: 8px 16px 16px 16px;
  flex-shrink: 0;
  background-color: white;
}

.selected-tickets-list { 
  overflow-y: visible;
  margin-bottom: 8px;
}

.selected-ticket-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; margin-bottom: 4px; }
.selected-ticket-info { display: flex; align-items: center; gap: 8px; }
.selected-ticket-quantity { font-weight: 700; color: var(--primary); }
.selected-ticket-name { font-size: 14px; }
.selected-ticket-price { font-weight: 500; }
.checkout-totals { margin-top: 8px; }
.checkout-total-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.empty-cart-message { color: var(--black-text); font-size: 14px; text-align: center; padding: 20px 0; }
.ticket-section-title { font-size: 18px; font-weight: 700; color: var(--black-text); font-family: var(--font-family-inter-bold); }
</style>