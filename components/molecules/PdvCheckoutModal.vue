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
        <v-stepper-header class="bg-white no-box-shadow">
          <template v-for="(step) in checkoutSteps">
            <v-stepper-step 
              :key="step.step" 
              :complete="currentStep > step.step" 
              :step="step.step">
              {{ step.title }}
            </v-stepper-step>
          </template>
        </v-stepper-header>

        <v-stepper-items>
          <!-- Etapa 1: Seleção de Ingressos -->
          <v-stepper-content step="1" class="bg-transparent px-0 py-0">
            <TicketSelectionStep
              :grouped-tickets="groupedTickets"
              :selected-quantities="selectedQuantities"
              :selected-tickets="selectedTickets"
              :total-amount="totalAmount"
              :calculate-fee="calculateFee"
              :net-amount="netAmount"
              :event-fee-percentage="eventFeePercentage"
              :is-loading="isLoading"
              :is-processing="isProcessing"
              @increment-ticket="incrementTicket"
              @decrement-ticket="decrementTicket"
              @next-step="nextStep"
            />
          </v-stepper-content>

          <!-- Etapa 2: Informações do Comprador -->
          <v-stepper-content step="2" class="bg-transparent px-0 py-0">
            <BuyerInfoStep
              ref="buyerInfoStep"
              :selected-tickets="selectedTickets"
              :ticket-form-groups="ticketFormGroups"
              :checkout-fields="checkoutFields"
              :checkout-field-options="checkoutFieldOptions"
              :person-type-options="personTypeOptions"
              :expanded-form-panels="expandedFormPanels"
              :total-amount="totalAmount"
              :calculate-fee="calculateFee"
              :net-amount="netAmount"
              :event-fee-percentage="eventFeePercentage"
              :is-loading-fields="isLoadingFields"
              :is-processing="isProcessing"
              @update:expanded-form-panels="expandedFormPanels = $event"
              @update:ticket-form-groups="ticketFormGroups = $event"
              @previous-step="previousStep"
              @next-step="nextStep"
            />
          </v-stepper-content>

          <!-- Etapa 3: Pagamento -->
          <v-stepper-content step="3" class="bg-transparent px-0 py-0 fixed-height-content">
            <PaymentStep
              :selected-tickets="selectedTickets"
              :total-amount="totalAmount"
              :calculate-fee="calculateFee"
              :net-amount="netAmount"
              :event-fee-percentage="eventFeePercentage"
              :payment-method="paymentMethod"
              :is-processing="isProcessing"
              @update:payment-method="paymentMethod = $event"
              @previous-step="previousStep"
              @process-payment="processPdvPayment"
            />
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </v-dialog>
</template>

<script>
import { eventGeneralInfo, eventCheckout, eventPdv, eventTickets, toast } from '@/store';
import { formatRealValue } from '@/utils/formatters';
import { isUserAdmin, isUserManager } from '@/utils/utils';
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
      return this.$cookies.get('user_id');
    },

    isAdminOrManager() {
      return isUserAdmin(this.$cookies) || isUserManager(this.$cookies);
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
    
    currentEvent() {
      return eventGeneralInfo.$info;
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

        if (this.isAdminOrManager) {
          console.log('Carregando ingressos para admins');
          await this.loadTicketsForAdmins();
        } else {
          console.log('Carregando ingressos para usuários disponíveis para PDV');
          await this.loadTicketsForAvailableUsers();
        }
      
        const categoryCount = Object.keys(this.groupedTickets).length;
        if (categoryCount > 0) {
          this.expandedPanels = [...Array(categoryCount).keys()];
        }

      } catch (error) {
        console.error('Erro ao carregar ingressos:', error);
        toast.setToast({ text: 'Erro ao carregar ingressos.', type: 'error', time: 3000 });
      }
    },

    async loadTicketsForAdmins() {
      try {
        this.isLoading = true;
        const response = await eventTickets.fetchAndPopulateByEventId(this.eventId);

        if (response.success && response.data) {
          this.pdvTickets = response.data;
        }
      } catch (error) {
        console.error('Erro ao carregar ingressos:', error);
        toast.setToast({ text: 'Erro ao carregar ingressos.', type: 'error', time: 3000 });
      } finally {
        this.isLoading = false;
      }
    },

    async loadTicketsForAvailableUsers() {
      try {
        this.isLoading = true;
        const response = await eventPdv.fetchPdvFromEventAndUserId({ eventId: this.eventId, userId: this.userId });

        if (response.success && response.data) {

          // Sabendo que o usuário só tem um PDV, pegamos o primeiro
          this.pdvId = response.data[0].id;

          response.data.forEach(pdv => {
            pdv.pdvTickets.forEach(pdvTicket => {
              this.pdvTickets.push(pdvTicket.ticket);
            });
          });
        }
      } catch (error) {
        console.error('Erro ao carregar ingressos:', error);
        toast.setToast({ text: 'Erro ao carregar ingressos.', type: 'error', time: 3000 });
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
        const checkoutFieldsResponse = await eventCheckout.fetchCheckoutFields(this.eventId);
        
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
        toast.setToast({ text: 'Erro ao carregar campos de checkout.', type: 'error', time: 3000 });
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
              this.checkoutFieldOptions[fieldId] = await eventCheckout.fetchCheckoutFieldOptions(fieldId);
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
    
    async processPdvPayment() {
      if (this.selectedTickets.length === 0) {
        toast.setToast({ text: 'Selecione pelo menos um ingresso para continuar.', type: 'error', time: 3000 });
        return;
      }
      
      if (!this.validateCheckoutFields()) {
        toast.setToast({ text: 'Por favor, preencha todos os campos obrigatórios.', type: 'error', time: 3000 });
        return;
      }
      
      try {
        this.isProcessing = true;
        
        await checkoutService.processPdvPayment(this, {
          tickets: this.selectedTickets,
          ticketFormGroups: this.ticketFormGroups,
          checkoutFields: this.checkoutFields,
          checkoutFieldOptions: this.checkoutFieldOptions,
          totalAmount: this.totalAmount,
          netAmount: this.netAmount,
          pdvId: this.pdvId
        });

        toast.setToast({ text: 'Pedido PDV realizado com sucesso!', type: 'success', time: 3000 });
        this.close();
        this.$emit('order-created');
      } catch (error) {
        console.error('Erro ao processar PDV:', error);
        toast.setToast({ text: 'Erro ao processar pedido PDV: ' + (error.message || 'Erro desconhecido'), type: 'error', time: 3000 });
      } finally {
        this.isProcessing = false;
      }
    }
  }
};
</script>

<style scoped>
.ticket-section-title { font-size: 18px; font-weight: 700; color: var(--black-text); font-family: var(--font-family-inter-bold); }
.ticket-category-name { font-size: 16px; font-weight: 700; color: var(--primary); font-family: var(--font-family-inter-bold); }
</style>