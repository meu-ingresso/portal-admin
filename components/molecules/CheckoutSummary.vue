<template>
  <v-card outlined class="pa-4 mb-4 checkout-summary">
    <h4 class="ticket-section-title mb-4">Resumo do Pedido</h4>
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
      <v-divider class="my-4"></v-divider>
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

      <ButtonWithIcon 
        class="mt-4"
        block
        color="primary"
        text="Finalizar Pedido"
        icon="mdi-arrow-right"
        icon-position="right"
        :loading="isProcessing"
        :disabled="selectedTickets.length === 0 || isProcessing"
        @click="$emit('process-payment')"
      />
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
.checkout-summary { background-color: white; border-radius: 8px; }
.selected-tickets-list { max-height: 300px; overflow-y: auto; }
.selected-ticket-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; margin-bottom: 4px; }
.selected-ticket-info { display: flex; align-items: center; gap: 8px; }
.selected-ticket-quantity { font-weight: 700; color: var(--primary); }
.selected-ticket-name { font-size: 14px; }
.selected-ticket-price { font-weight: 500; }
.checkout-totals { margin-top: 16px; }
.checkout-total-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.empty-cart-message { color: var(--black-text); font-size: 14px; text-align: center; padding: 20px 0; }
</style>