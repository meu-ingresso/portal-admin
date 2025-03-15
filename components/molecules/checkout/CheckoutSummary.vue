<template>
  <v-card outlined class="pa-4">
    <h3 class="ticket-section-title mb-4">Resumo do Pedido</h3>
    
    <div v-if="selectedTickets.length === 0" class="text-center py-4">
      <p class="empty-cart-message">Seu carrinho está vazio</p>
      <p class="empty-cart-description">Selecione pelo menos um ingresso para continuar</p>
    </div>
    
    <template v-else>
      <div class="selected-tickets-list mb-4">
        <div v-for="(item, index) in selectedTickets" :key="index" class="selected-ticket-item mb-2">
          <div class="d-flex justify-space-between">
            <div>
              <div class="ticket-name">{{ item.name }}</div>
              <div class="ticket-quantity">{{ item.quantity }}x {{ formatRealValue(item.price) }}</div>
            </div>
            <div class="ticket-total">{{ formatRealValue(item.total) }}</div>
          </div>
        </div>
      </div>
      
      <v-divider class="mb-4"></v-divider>
      
      <div class="d-flex justify-space-between mb-2">
        <span>Subtotal</span>
        <span class="font-weight-bold">{{ formatRealValue(totalAmount) }}</span>
      </div>
      
      <div class="d-flex justify-space-between mb-2">
        <span>Taxa plataforma ({{ eventFeePercentage }}%)</span>
        <span>{{ formatRealValue(calculateFee) }}</span>
      </div>
      
      <div class="d-flex justify-space-between mb-4">
        <span class="font-weight-bold">Total</span>
        <span class="total-value">{{ formatRealValue(netAmount) }}</span>
      </div>

      <slot name="actions"></slot>
    </template>
  </v-card>
</template>

<script>
import { formatRealValue } from '@/utils/formatters';

export default {
  props: {
    selectedTickets: {
      type: Array,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    calculateFee: {
      type: Number,
      required: true
    },
    netAmount: {
      type: Number,
      required: true
    },
    eventFeePercentage: {
      type: Number,
      required: true
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    formatRealValue
  }
};
</script>

<style scoped>
.ticket-section-title { font-size: 18px; font-weight: 700; color: var(--black-text); font-family: var(--font-family-inter-bold); }
.empty-cart-message { font-size: 16px; font-weight: 700; color: var(--black-text); margin-bottom: 8px; }
.empty-cart-description { font-size: 14px; color: var(--grey-text); }
.ticket-name { font-weight: 500; }
.ticket-quantity { font-size: 13px; color: var(--grey-text); }
.total-value { font-weight: 700; color: var(--primary); font-size: 18px; }
</style> 