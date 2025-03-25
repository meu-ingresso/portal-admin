<template>
  <v-card-text class="checkout-container">
    <v-row class="checkout-row">
      <v-col cols="12" md="8" class="checkout-col">
        <v-card outlined class="pa-4 checkout-card">
          <div class="checkout-content">
            <h3 class="ticket-section-title mb-4">Informações do Comprador</h3>
            
            <div v-if="isLoadingFields" class="text-center py-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="mt-2">Carregando campos customizados...</p>
            </div>
            
            <div v-else-if="!checkoutFields || checkoutFields.length === 0" class="text-center py-4">
              <p class="info-message">Não há campos adicionais para preencher.</p>
              <v-icon large color="success" class="mt-2">mdi-check-circle</v-icon>
            </div>
            
            <template v-else>
              <v-expansion-panels
                v-model="internalExpandedFormPanels"
                multiple
                class="ticket-forms-panels"
              >
                <v-expansion-panel
                  v-for="(ticketGroup, index) in internalTicketFormGroups"
                  :key="index"
                  class="ticket-form-panel"
                >
                  <v-expansion-panel-header class="group-header">
                    <div class="d-flex align-center justify-space-between w-100">
                      <span class="ticket-name">{{ ticketGroup.ticketName }}</span>
                      <span class="ticket-quantity grey--text">{{ ticketGroup.quantity }} {{ ticketGroup.quantity === 1 ? 'ingresso' : 'ingressos' }}</span>
                    </div>
                  </v-expansion-panel-header>

                  <v-expansion-panel-content>
                    <CheckoutTicketForm
                      v-for="(instance, instanceIndex) in ticketGroup.instances"
                      :key="instanceIndex"
                      ref="ticketForms"
                      v-model="internalTicketFormGroups[index].instances[instanceIndex]"
                      :ticket-id="ticketGroup.ticketId"
                      :ticket-name="ticketGroup.ticketName"
                      :instance-index="instanceIndex"
                      :checkout-fields="checkoutFields"
                      :checkout-field-options="checkoutFieldOptions"
                      :person-type-options="personTypeOptions"
                    ></CheckoutTicketForm>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </template>
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
            <div class="d-flex justify-space-between">
              <DefaultButton
                text="Voltar"
                outlined
                class="mr-2"
                @click="$emit('previous-step')"
              />
              <DefaultButton
                :disabled="!canProceed"
                text="Próximo"
                @click="$emit('next-step')"
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
    ticketFormGroups: {
      type: Array,
      required: true
    },
    checkoutFields: {
      type: Array,
      required: true
    },
    checkoutFieldOptions: {
      type: Object,
      required: true
    },
    personTypeOptions: {
      type: Array,
      required: true
    },
    expandedFormPanels: {
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
    isLoadingFields: {
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
      internalExpandedFormPanels: [...this.expandedFormPanels],
      internalTicketFormGroups: JSON.parse(JSON.stringify(this.ticketFormGroups))
    };
  },
  
  computed: {
    canProceed() {
      if (!this.checkoutFields || this.checkoutFields.length === 0) {
        return true;
      }

      if (this.isLoadingFields) {
        return false;
      }
      
      return this.validateFields();
    }
  },
  
  watch: {
    internalExpandedFormPanels(newVal) {
      this.$emit('update:expanded-form-panels', newVal);
    },
    internalTicketFormGroups: {
      handler(newVal) {
        this.$emit('update:ticket-form-groups', newVal);
      },
      deep: true
    },
    ticketFormGroups: {
      handler(newVal) {
        const currentValueStr = JSON.stringify(this.internalTicketFormGroups);
        const newValueStr = JSON.stringify(newVal);
        
        if (currentValueStr !== newValueStr) {
          this.internalTicketFormGroups = JSON.parse(JSON.stringify(newVal));
        }
      },
      deep: true
    },
    expandedFormPanels: {
      handler(newVal) {
        const currentValueStr = JSON.stringify(this.internalExpandedFormPanels);
        const newValueStr = JSON.stringify(newVal);
        
        if (currentValueStr !== newValueStr) {
          this.internalExpandedFormPanels = [...newVal];
        }
      }
    }
  },
  
  methods: {
    formatRealValue,
    
    validateFields() {
      if (!this.$refs.ticketForms) {
        return false;
      }

      if (this.$refs.ticketForms.length === 0) {
        return true;
      }
      
      const isValid = this.$refs.ticketForms.every(form => {
        const result = form.validate();
        return result;
      });
      
      return isValid;
    }
  }
};
</script>

<style scoped>
.buyer-info-step-card {
  height: 100%;
} 

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

.ticket-section-title { font-size: 18px; font-weight: 700; color: var(--black-text); font-family: var(--font-family-inter-bold); }
.ticket-forms-panels { border-radius: 0;}
.ticket-form-panel { margin-bottom: 8px; border: none !important; border-radius: 8px !important; overflow: hidden;background-color: #f5f5f5 !important; }
::v-deep .v-expansion-panel-content__wrap { padding: 18px 14px; }
::v-deep .v-expansion-panel::before { box-shadow: none; }
.ticket-name { font-weight: 500; }
.ticket-quantity { font-size: 13px; color: var(--grey-text); }
.total-value { font-weight: 700; color: var(--primary); font-size: 18px; }
</style> 