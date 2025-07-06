<template>
  <v-dialog :value="show" fullscreen persistent @input="$emit('update:show', $event)">
    <v-card tile>
      <v-card-title class="d-flex justify-space-between align-center">
        <h3 class="modalTitle">PDV - Ponto de Venda</h3>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-stepper v-model="currentStep" flat class="bg-beige">
        <!-- Header normal do stepper -->
        <v-stepper-header class="bg-white no-box-shadow">
          <template v-for="(step) in checkoutSteps">
            <v-stepper-step :key="step.step" :complete="currentStep > step.step" :step="step.step">
              {{ step.title }}
            </v-stepper-step>
          </template>
        </v-stepper-header>

        <v-stepper-items>
          <!-- Etapa 1: Seleção de Ingressos -->
          <v-stepper-content step="1" class="bg-transparent px-0 py-0">
            <TicketSelectionStep :grouped-tickets="groupedTickets" :selected-quantities="selectedQuantities"
              :selected-tickets="selectedTickets" :total-amount="totalAmount" :calculate-fee="calculateFee"
              :net-amount="netAmount" :event-fee-percentage="eventFeePercentage" :is-loading="isLoading"
              :is-processing="isProcessing" @increment-ticket="incrementTicket" @decrement-ticket="decrementTicket"
              @next-step="nextStep" />
          </v-stepper-content>

          <!-- Etapa 2: Informações do Comprador -->
          <v-stepper-content step="2" class="bg-transparent px-0 py-0">
            <BuyerInfoStep ref="buyerInfoStep" :selected-tickets="selectedTickets"
              :ticket-form-groups="ticketFormGroups" :checkout-fields="checkoutFields"
              :checkout-field-options="checkoutFieldOptions" :person-type-options="personTypeOptions"
              :expanded-form-panels="expandedFormPanels" :total-amount="totalAmount" :calculate-fee="calculateFee"
              :net-amount="netAmount" :event-fee-percentage="eventFeePercentage" :is-loading-fields="isLoadingFields"
              :is-processing="isProcessing" @update:expanded-form-panels="expandedFormPanels = $event"
              @update:ticket-form-groups="ticketFormGroups = $event" @previous-step="previousStep"
              @next-step="nextStep" />
          </v-stepper-content>

          <!-- Etapa 3: Pagamento -->
          <v-stepper-content step="3" class="bg-transparent px-0 py-0 fixed-height-content">
            <!-- Conteúdo normal quando não está processando -->
            <PaymentStep :selected-tickets="selectedTickets" :total-amount="totalAmount" :calculate-fee="calculateFee"
              :net-amount="netAmount" :event-fee-percentage="eventFeePercentage" :payment-method="paymentMethod"
              :is-processing="isProcessing" @update:payment-method="paymentMethod = $event"
              @previous-step="previousStep" @process-payment="processPdvPaymentV2" />
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
    <Toast />
  </v-dialog>
</template>

<script>
import { formatRealValue } from '@/utils/formatters';
import { isMultiOptionField } from '@/utils/customFieldsHelpers';
import checkoutService from '@/services/checkout/checkoutService';

export default {

  props: {
    show: {
      type: Boolean,
      required: true
    },
    eventId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      pdvId: null,
      selectedQuantities: {},
      isLoading: false,
      isLoadingFields: false,
      isProcessing: false,
      pdvTickets: [],
      expandedPanels: [],
      expandedFormPanels: [],
      currentStep: 1,
      checkoutFields: [],
      checkoutFieldOptions: {},
      ticketFormGroups: [],
      paymentMethod: 'PDV',
      personTypeOptions: [
        { text: 'Pessoa Física', value: 'PF' },
        { text: 'Pessoa Jurídica', value: 'PJ' },
        { text: 'Estrangeiro', value: 'ESTRANGEIRO' }
      ],
      checkoutSteps: [
        { step: 1, title: 'Seleção de Ingressos' },
        { step: 2, title: 'Informações do Comprador' },
        { step: 3, title: 'Pagamento' }
      ]
    };
  },

  computed: {

    userId() {
      return this.$auth.user?.id;
    },

    isAdminOrManager() {
      const role = this.$auth.user?.role;
      return role && (role.name === 'Admin' || role.name === 'Manager');
    },

    currentEvent() {
      return this.$store.getters['eventGeneralInfo/$info'];
    },

    tickets() {
      return this.pdvTickets.filter(ticket =>
        !ticket._deleted &&
        ticket.status?.name !== 'Indisponível' &&
        (ticket.total_quantity - ticket.total_sold) > 0
      );
    },

    groupedTickets() {
      const grouped = this.tickets.reduce((acc, ticket) => {
        const categoryId = ticket.category?.id || 'uncategorized';
        const categoryName = ticket.category?.text || 'Sem Categoria';
        if (!acc[categoryId]) {
          acc[categoryId] = { name: categoryName, tickets: [] };
        }
        acc[categoryId].tickets.push(ticket);
        return acc;
      }, {});

      // Ordenar ingressos pelo display_order em cada categoria
      Object.keys(grouped).forEach(categoryId => {
        grouped[categoryId].tickets.sort((a, b) => {
          const orderA = a.display_order !== undefined ? a.display_order : Number.MAX_SAFE_INTEGER;
          const orderB = b.display_order !== undefined ? b.display_order : Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
      });

      return grouped;
    },

    eventFeePercentage() {
      return parseFloat(this.currentEvent?.fees?.platform_fee) || 0;
    },

    selectedTickets() {
      return Object.keys(this.selectedQuantities)
        .filter(id => this.selectedQuantities[id] > 0)
        .map(id => {
          const ticket = this.tickets.find(t => t.id === id);
          return {
            id,
            name: ticket.name,
            price: parseFloat(ticket.price),
            quantity: this.selectedQuantities[id],
            total: parseFloat(ticket.price) * this.selectedQuantities[id]
          };
        });
    },

    totalAmount() {
      return this.selectedTickets.reduce((sum, item) => sum + item.total, 0);
    },

    calculateFee() {
      return 0;
    },

    netAmount() {
      return this.totalAmount - this.calculateFee;
    }
  },

  watch: {
    selectedTickets: {
      handler(newVal) {
        if (newVal.length > 0 && this.currentStep === 2) {
          this.generateTicketForms();
        }
      },
      deep: true
    }
  },

  mounted() {
    this.loadData();
  },

  beforeDestroy() {
    this.resetData();
  },

  methods: {
    formatRealValue,

    async loadData() {
      try {

        await this.loadTicketsForAvailableUsers();

        const categoryCount = Object.keys(this.groupedTickets).length;
        if (categoryCount > 0) {
          this.expandedPanels = [...Array(categoryCount).keys()];
        }

      } catch (error) {
        console.error('Erro ao carregar ingressos:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao carregar ingressos.',
          type: 'error',
          time: 3000
        });
      }
    },

    async loadTicketsForAdmins() {
      try {
        this.isLoading = true;
        const response = await this.$store.dispatch('eventTickets/fetchAndPopulateByEventId', this.eventId);

        if (response.success && response.data) {
          this.pdvTickets = response.data;
        }
      } catch (error) {
        console.error('Erro ao carregar ingressos:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao carregar ingressos.',
          type: 'error',
          time: 3000
        });
      } finally {
        this.isLoading = false;
      }
    },

    async loadTicketsForAvailableUsers() {
      try {
        this.isLoading = true;
        const response = await this.$store.dispatch('eventPdv/fetchPdvFromEventAndUserId', {
          eventId: this.eventId,
          userId: this.userId
        });

        if (response.success && response.data && response.data.length > 0) {

          const openPdv = response.data.find(pdv => pdv.status?.name === 'Disponível');

          if (!openPdv) {
            this.$store.dispatch('toast/setToast', {
              text: 'Nenhum PDV disponível encontrado.',
              type: 'info',
              time: 3000
            });
            return;
          }

          // Sabendo que o usuário só tem um PDV, pegamos o primeiro
          this.pdvId = openPdv.id;

          this.$store.dispatch('toast/setToast', {
            text: 'PDV disponível encontrado!',
            type: 'info',
            time: 3000
          });

          openPdv.pdvTickets.forEach(pdvTicket => {
            this.pdvTickets.push(pdvTicket.ticket);
          });
        }
      } catch (error) {
        console.error('Erro ao carregar ingressos:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao carregar ingressos.',
          type: 'error',
          time: 3000
        });
      } finally {
        this.isLoading = false;
      }
    },

    resetData() {
      this.selectedQuantities = {};
      this.expandedPanels = [];
      this.expandedFormPanels = [];
      this.currentStep = 1;
      this.checkoutFields = [];
      this.checkoutFieldOptions = {};
      this.ticketFormGroups = [];
      this.paymentMethod = 'PDV';

      this.isLoading = false;
      this.isLoadingFields = false;
      this.isProcessing = false;
    },

    close() {
      this.isLoading = false;
      this.isLoadingFields = false;
      this.isProcessing = false;

      this.$emit('update:show', false);
    },

    getTicketQuantity(ticketId) {
      return this.selectedQuantities[ticketId] || 0;
    },

    incrementTicket(ticketId) {
      const currentQty = this.selectedQuantities[ticketId] || 0;
      const ticket = this.tickets.find(t => t.id === ticketId);
      const available = ticket.total_quantity - ticket.total_sold;
      if (currentQty < available) {
        this.$set(this.selectedQuantities, ticketId, currentQty + 1);
      }
    },

    decrementTicket(ticketId) {
      if (this.selectedQuantities[ticketId] > 0) {
        this.$set(this.selectedQuantities, ticketId, this.selectedQuantities[ticketId] - 1);
      }
    },

    nextStep() {
      if (this.currentStep === 1) {
        this.fetchCheckoutFields();
      }
      if (this.currentStep < 3) {
        this.currentStep++;
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },

    async fetchCheckoutFields() {
      try {
        this.isLoadingFields = true;
        const checkoutFieldsResponse = await this.$store.dispatch('eventCheckout/fetchCheckoutFields', this.eventId);

        if (!checkoutFieldsResponse || checkoutFieldsResponse.length === 0) {
          this.checkoutFields = [];
          this.isLoadingFields = false;
          return;
        }

        // Ordena os campos de checkout pelo display_order
        this.checkoutFields = checkoutFieldsResponse.sort((a, b) => a.eventCheckoutField.display_order - b.eventCheckoutField.display_order);

        await this.fetchFieldOptions();
        this.generateTicketForms();
        this.isLoadingFields = false;
      } catch (error) {
        console.error('Erro ao carregar campos de checkout:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao carregar campos de checkout.',
          type: 'error',
          time: 3000
        });
        this.isLoadingFields = false;
        this.checkoutFields = [];
      }
    },

    async fetchFieldOptions() {
      try {
        const specialFields = this.checkoutFields.filter(field =>
          field.eventCheckoutField && isMultiOptionField(field.eventCheckoutField.type)
        );

        if (!specialFields || specialFields.length === 0) {
          return;
        }

        for (const field of specialFields) {
          try {
            const fieldId = field.eventCheckoutField.id;
            if (!this.checkoutFieldOptions[fieldId]) {
              this.checkoutFieldOptions[fieldId] = await this.$store.dispatch('eventCheckout/fetchCheckoutFieldOptions', fieldId);
            }
          } catch (error) {
            console.error(`Erro ao carregar opções para o campo ${field.eventCheckoutField.id}:`, error);
            this.checkoutFieldOptions[field.eventCheckoutField.id] = [];
          }
        }
      } catch (error) {
        console.error('Erro geral ao carregar opções de campos:', error);
        this.checkoutFieldOptions = {};
      }
    },

    generateTicketForms() {
      this.ticketFormGroups = [];
      this.expandedFormPanels = [];

      let panelIndex = 0;

      this.selectedTickets.forEach(selectedTicket => {
        const ticket = this.tickets.find(t => t.id === selectedTicket.id);
        if (!ticket) return;

        const instances = [];
        for (let i = 0; i < selectedTicket.quantity; i++) {
          instances.push({
            personType: 'PF',
            fields: {}
          });
        }

        this.ticketFormGroups.push({
          ticketId: ticket.id,
          ticketName: ticket.name,
          quantity: selectedTicket.quantity,
          instances
        });

        this.expandedFormPanels.push(panelIndex);
        panelIndex++;
      });
    },

    validateCheckoutFields() {
      if (!this.$refs.buyerInfoStep) return true;
      return this.$refs.buyerInfoStep.validateFields();
    },

    async processPdvPaymentV2() {
      if (this.selectedTickets.length === 0) {
        this.$store.dispatch('toast/setToast', {
          text: 'Selecione pelo menos um ingresso para continuar.',
          type: 'error',
          time: 3000
        });
        return;
      }

      if (!this.validateCheckoutFields()) {
        this.$store.dispatch('toast/setToast', {
          text: 'Por favor, preencha todos os campos obrigatórios.',
          type: 'error',
          time: 3000
        });
        return;
      }

      try {
        this.isProcessing = true;

        await checkoutService.processPdvPaymentV2(this, {
          tickets: this.selectedTickets,
          ticketFormGroups: this.ticketFormGroups,
          checkoutFields: this.checkoutFields,
          totalAmount: this.totalAmount,
          netAmount: this.netAmount,
          pdvId: this.pdvId,
          eventId: this.eventId
        });

        this.$store.dispatch('toast/setToast', {
          text: 'Pedido PDV realizado com sucesso!',
          type: 'success',
          time: 3000
        });
        this.close();
        this.$emit('order-created');
      } catch (error) {
        console.error('Erro ao processar PDV V2:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao processar pedido PDV: ' + (error.message || 'Erro desconhecido'),
          type: 'error',
          time: 3000
        });
      } finally {
        this.isProcessing = false;
      }
    }
  }
};
</script>

<style scoped>
.ticket-section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

.ticket-category-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  font-family: var(--font-family-inter-bold);
}

/* Estilos para o loading diferenciado do PDV */
.pdv-loading-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

.pdv-loading-content {
  text-align: center;
  padding: 2rem;
}

.pdv-loading-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.pdv-progress-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pdv-loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 0.5rem;
  font-family: var(--font-family-inter-bold);
}

.pdv-loading-subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
}

.pdv-loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary);
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot-1 {
  animation-delay: -0.32s;
}

.dot-2 {
  animation-delay: -0.16s;
}

.dot-3 {
  animation-delay: 0s;
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>