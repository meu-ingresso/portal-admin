<template>
  <v-card-text class="checkout-container">
    <v-row class="checkout-row">
      <v-col cols="12" md="8" class="checkout-col">
        <v-card outlined class="pa-4 checkout-card">
          <div class="checkout-content">
            <h3 class="ticket-section-title mb-4">Método de Pagamento</h3>
            <v-radio-group v-model="internalPaymentMethod" class="mt-0">
              <v-radio value="PDV" label="Ponto de Venda (PDV)"></v-radio>
            </v-radio-group>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4" class="checkout-col">
        <CheckoutSummary
          :selected-tickets="selectedTickets"
          :total-amount="totalAmount"
          :calculate-fee="calculateFee"
          :net-amount="netAmount"
          :is-processing="isProcessing"
          :event-fee-percentage="eventFeePercentage"
        >
          <template #actions>
            <div class="d-flex">
              <DefaultButton
                outlined
                class="mr-2"
                :disabled="isProcessing"
                text="Voltar"
                @click="$emit('previous-step')"
              />
              <DefaultButton
                text="Finalizar Pedido"
                color="primary"
                class="flex-grow-1"
                :loading="isProcessing"
                :disabled="isProcessing"
                @click="$emit('process-payment')"
              />
            </div>
          </template>
        </CheckoutSummary>
      </v-col>
    </v-row>
  </v-card-text>
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
    paymentMethod: {
      type: String,
      default: 'PDV'
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      internalPaymentMethod: this.paymentMethod
    };
  },
  
  watch: {
    internalPaymentMethod(newVal) {
      this.$emit('update:payment-method', newVal);
    },
    paymentMethod(newVal) {
      if (newVal && newVal !== this.internalPaymentMethod) {
        this.internalPaymentMethod = newVal;
      }
    }
  },
  
  methods: {
    formatRealValue
  }
};
</script>

<style scoped>
.ticket-section-title { font-size: 18px; font-weight: 700; color: var(--black-text); font-family: var(--font-family-inter-bold); }

.checkout-container {
  height: calc(100vh - 134px);
  padding: 0;
  overflow: hidden;
}

.checkout-row {
  height: 100%;
  margin: 0;
}

.checkout-col {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.checkout-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 0 !important;
}

.checkout-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style> 