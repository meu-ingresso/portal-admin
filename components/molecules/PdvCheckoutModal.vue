<template>
  <v-dialog :value="show" fullscreen persistent @input="$emit('update:show', $event)">
    <v-card tile>
      <v-card-title class="d-flex justify-space-between align-center">
        <h3 class="modalTitle">PDV - Ponto de Venda</h3>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-row>
          <v-col cols="12" md="8">
            <v-card outlined class="pa-4 mb-4">
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
                        @increment="incrementTicket(ticket.id)"
                        @decrement="decrementTicket(ticket.id)"
                      />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <CheckoutSummary
              :selected-tickets="selectedTickets"
              :total-amount="totalAmount"
              :calculate-fee="calculateFee"
              :net-amount="netAmount"
              :is-processing="isProcessing"
              :event-fee-percentage="eventFeePercentage"
              @process-payment="processPdvPayment"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { eventTickets, eventGeneralInfo, status, toast, payment, user } from '@/store';
import { formatRealValue } from '@/utils/formatters';

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
      selectedQuantities: {},
      isLoading: false,
      isProcessing: false,
      expandedPanels: []
    };
  },
  computed: {
    tickets() {
      return eventTickets.$tickets.filter(ticket => 
        !ticket._deleted && 
        ticket.status?.name !== 'Indisponível' &&
        (ticket.total_quantity - ticket.total_sold) > 0
      );
    },
    groupedTickets() {
      return this.tickets.reduce((acc, ticket) => {
        const categoryId = ticket.category?.id || 'uncategorized';
        const categoryName = ticket.category?.text || 'Sem Categoria';
        if (!acc[categoryId]) {
          acc[categoryId] = { name: categoryName, tickets: [] };
        }
        acc[categoryId].tickets.push(ticket);
        return acc;
      }, {});
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
      return (this.totalAmount * this.eventFeePercentage) / 100;
    },
    netAmount() {
      return this.totalAmount - this.calculateFee;
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.loadData();
      } else {
        this.resetData();
      }
    }
  },
  methods: {
    formatRealValue,
    async loadData() {
      try {
        this.isLoading = true;
        await eventTickets.fetchAndPopulateByEventId(this.eventId);
        const categoryCount = Object.keys(this.groupedTickets).length;
        if (categoryCount > 0) {
          this.expandedPanels = [...Array(categoryCount).keys()];
        }
        this.isLoading = false;
      } catch (error) {
        console.error('Erro ao carregar ingressos:', error);
        toast.setToast({ text: 'Erro ao carregar ingressos.', type: 'error', time: 3000 });
        this.isLoading = false;
      }
    },
    resetData() {
      this.selectedQuantities = {};
      this.expandedPanels = [];
    },
    close() {
      this.resetData();
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
    async processPdvPayment() {
      if (this.selectedTickets.length === 0) {
        toast.setToast({ text: 'Selecione pelo menos um ingresso para continuar.', type: 'error', time: 3000 });
        return;
      }
      try {
        this.isProcessing = true;
        const paymentApprovedStatus = await status.fetchStatusByModuleAndName({ module: 'payment', name: 'Aprovado' });
        if (!paymentApprovedStatus) throw new Error('Status de pagamento aprovado não encontrado');
        
        const paymentPayload = {
          data: [{
            user_id: this.$cookies.get('user_id'),
            status_id: paymentApprovedStatus.id,
            payment_method: 'PDV',
            gross_value: this.totalAmount,
            net_value: this.netAmount,
            paid_at: new Date().toISOString()
          }]
        };
        const paymentResponse = await payment.createPayment(paymentPayload);
        const paymentId = paymentResponse[0].id;

        const ticketAvailableStatus = await status.fetchStatusByModuleAndName({ module: 'customer-ticket', name: 'Disponível' });
        if (!ticketAvailableStatus) throw new Error('Status de ingresso disponível não encontrado');

        const userResponse = await user.get(this.$cookies.get('user_id'));
        const customerTicketsPayload = {
          data: this.selectedTickets.flatMap(ticket => 
            Array(ticket.quantity).fill().map(() => ({
              ticket_id: ticket.id,
              current_owner_id: userResponse.people.id,
              payment_id: paymentId,
              status_id: ticketAvailableStatus.id
            }))
          )
        };
        await payment.createCustomerTicket(customerTicketsPayload);

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
.ticket-category-panels { border-radius: 0;}
.ticket-category-panel { margin-bottom: 8px; border: none !important; border-radius: 8px !important; overflow: hidden;background-color: #f5f5f5 !important; }
::v-deep .v-expansion-panel-content__wrap { padding: 18px 14px; }
::v-deep .v-expansion-panel::before { box-shadow: none; }
.ticket-category-name { font-size: 16px; font-weight: 700; color: var(--primary); font-family: var(--font-family-inter-bold); }
.ticket-category-count { font-size: 14px; }
.empty-tickets-message { color: var(--black-text); font-size: 14px; text-align: center; padding: 20px 0; }
</style>