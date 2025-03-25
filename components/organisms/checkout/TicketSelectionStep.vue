<template>
  <v-card-text class="checkout-container">
    <v-row class="checkout-row">
      <v-col cols="12" md="8" class="checkout-col">
        <v-card outlined class="pa-4 mb-4 checkout-card">
          <div class="checkout-content">
            <div v-if="isLoading" class="text-center py-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="mt-2">Carregando ingressos...</p>
            </div>
            
            <div v-else-if="Object.keys(groupedTickets).length === 0" class="text-center py-4">
              <p class="empty-tickets-message">Não há ingressos disponíveis para venda.</p>
            </div>
            
            <div v-else>
              <v-expansion-panels
                v-model="expandedPanels"
                multiple
                class="ticket-category-panels"
              >
                <v-expansion-panel
                  v-for="(category, categoryId) in groupedTickets"
                  :key="categoryId"
                  class="ticket-category-panel"
                >
                  <v-expansion-panel-header class="group-header">
                    <div class="d-flex align-center justify-space-between w-100">
                      <span class="ticket-category-name">{{ category.name }}</span>
                      <span class="ticket-category-count grey--text">{{ category.tickets.length }} {{ category.tickets.length === 1 ? 'ingresso' : 'ingressos' }}</span>
                    </div>
                  </v-expansion-panel-header>

                  <v-expansion-panel-content>
                    <CheckoutTicketRow
                      v-for="ticket in category.tickets"
                      :key="ticket.id"
                      :ticket="ticket"
                      :selected-quantity="getTicketQuantity(ticket.id)"
                      @increment="$emit('increment-ticket', ticket.id)"
                      @decrement="$emit('decrement-ticket', ticket.id)"
                    />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="checkout-col">
        <CheckoutSummary
          :selected-tickets="selectedTickets"
          :total-amount="totalAmount"
          :calculate-fee="calculateFee"
          :net-amount="netAmount"
          :event-fee-percentage="eventFeePercentage"
          :is-processing="isProcessing"
        >
          <template #actions>
            <DefaultButton
              :disabled="selectedTickets.length === 0"
              text="Próximo"
              block
              @click="$emit('next-step')"
            />
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
    groupedTickets: {
      type: Object,
      required: true
    },
    selectedTickets: {
      type: Array,
      required: true
    },
    selectedQuantities: {
      type: Object,
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
    isLoading: {
      type: Boolean,
      default: false
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      expandedPanels: [],
    };
  },
  
  watch: {
    groupedTickets: {
      handler(newVal) {
        const categoryCount = Object.keys(newVal).length;
        if (categoryCount > 0) {
          this.expandedPanels = [...Array(categoryCount).keys()];
        }
      },
      immediate: true
    }
  },
  
  methods: {
    formatRealValue,
    
    getTicketQuantity(ticketId) {
      return this.selectedQuantities[ticketId] || 0;
    }
  }
};
</script>

<style scoped>
.ticket-section-title { font-size: 18px; font-weight: 700; color: var(--black-text); font-family: var(--font-family-inter-bold); }
.ticket-category-panels { border-radius: 0;}
.ticket-category-panel { margin-bottom: 8px; border: none !important; border-radius: 8px !important; overflow: hidden;background-color: #f5f5f5 !important; }
::v-deep .v-expansion-panel-content__wrap { padding: 18px 14px; }
::v-deep .v-expansion-panel::before { box-shadow: none; }
.ticket-category-name { font-size: 16px; font-weight: 700; color: var(--primary); font-family: var(--font-family-inter-bold); }
.ticket-category-count { font-size: 14px; }
.empty-tickets-message { color: var(--black-text); font-size: 14px; text-align: center; padding: 20px 0; }
.ticket-name { font-weight: 500; }
.ticket-quantity { font-size: 13px; color: var(--grey-text); }
.total-value { font-weight: 700; color: var(--primary); font-size: 18px; }

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