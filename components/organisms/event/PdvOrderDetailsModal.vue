<template>
  <v-dialog :value="show" max-width="800" @input="$emit('update:show', $event)">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h3 class="modalTitle">Detalhes do Pedido (PDV)</h3>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <template v-if="isLoading">
          <div class="text-center py-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-2">Carregando detalhes do pedido...</p>
          </div>
        </template>
        <template v-else-if="!payment">
          <div class="text-center py-4">
            <p>Não foi possível carregar os detalhes do pedido.</p>
          </div>
        </template>
        <template v-else>
          <v-row>
            <v-col cols="12" md="6">
              <h4 class="subtitle-1 font-weight-bold mb-2">Informações do Pedido</h4>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Código do Pedido</v-list-item-title>
                  <v-list-item-subtitle>{{ payment.id }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Data da Compra</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTimeWithTimezone(payment.created_at) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Status</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip small :color="getStatusColor(payment.status?.name)" text-color="white">
                      {{ payment.status?.name }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Método de Pagamento</v-list-item-title>
                  <v-list-item-subtitle>{{ getPaymentMethod(payment.payment_method) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Comprador</v-list-item-title>
                  <v-list-item-subtitle>{{ payment.user?.people?.first_name }} {{ payment.user?.people?.last_name }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <h4 class="subtitle-1 font-weight-bold mb-2">Valores</h4>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Valor Total</v-list-item-title>
                  <v-list-item-subtitle>{{ formatRealValue(payment.gross_value) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Taxa do Evento</v-list-item-title>
                  <v-list-item-subtitle>{{ getEventFeePercentage }}%</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Valor Líquido</v-list-item-title>
                  <v-list-item-subtitle>{{ formatRealValue(payment.net_value) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h4 class="subtitle-1 font-weight-bold mb-4">Ingressos</h4>
          <v-data-table
            :headers="ticketHeaders"
            :items="customerTickets"
            :items-per-page="5"
            :no-data-text="'Nenhum ingresso encontrado'"
            class="elevation-1">

            <template #[`item.ticket.name`]="{ item }">
              {{ item.ticket.name }}
            </template>

            <template #[`item.ticket.price`]="{ item }">
              {{ formatRealValue(item.ticket.price) }}
            </template>

            <template #[`item.status.name`]="{ item }">
              <v-chip small :color="getTicketStatusColor(item.status?.name)" text-color="white">
                {{ item.status?.name }}
              </v-chip>
            </template>
          </v-data-table>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <DefaultButton text="Fechar" @click="close" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { payment, toast } from '@/store';
import { formatDateTimeWithTimezone, formatRealValue } from '@/utils/formatters';
import { getPaymentMethod } from '@/utils/utils';

export default {
  props: {
    show: {
      type: Boolean,
      required: true
    },
    paymentId: {
      type: String,
      required: false,
      default: ''
    }
  },

  data() {
    return {
      isLoading: false,
      ticketHeaders: [
        { text: 'Tipo de Ingresso', value: 'ticket.name', sortable: true },
        { text: 'Valor', value: 'ticket.price', sortable: true },
        { text: 'Status', value: 'status.name', sortable: true }
      ]
    };
  },

  computed: {
    payment() {
      return payment.$payment;
    },

    customerTickets() {
      return payment.$relatedTickets;
    },

    getEventFeePercentage() {
      if (this.customerTickets && this.customerTickets.length > 0 && 
          this.customerTickets[0].ticket && 
          this.customerTickets[0].ticket.event && 
          this.customerTickets[0].ticket.event.fees) {
        return this.customerTickets[0].ticket.event.fees.platform_fee || 0;
      }
      return 0;
    }
  },

  watch: {
    show(newVal) {
      if (newVal && this.paymentId) {
        this.loadPaymentDetails();
      } else {
        this.resetDetails();
      }
    },
    
    paymentId(newVal) {
      if (this.show && newVal) {
        this.loadPaymentDetails();
      }
    }
  },

  methods: {
    formatDateTimeWithTimezone,
    formatRealValue,
    getPaymentMethod,

    async loadPaymentDetails() {
      try {
        this.isLoading = true;
        await payment.fetchPaymentDetails(this.paymentId);
      } catch (error) {
        console.error('Erro ao carregar detalhes do pagamento:', error);
        toast.showErrorToast('Erro ao carregar detalhes do pagamento.');
      } finally {
        this.isLoading = false;
      }
    },

    resetDetails() {
      payment.resetPaymentDetails();
    },

    close() {
      this.$emit('update:show', false);
    },

    getStatusColor(status) {
      const colors = {
        'Aprovado': 'success',
        'Pendente': 'warning',
        'Cancelado': 'error'
      };
      return colors[status] || 'grey';
    },

    getTicketStatusColor(status) {
      const colors = {
        'Disponível': 'success',
        'Utilizado': 'info',
        'Cancelado': 'error',
        'Expirado': 'warning'
      };
      return colors[status] || 'grey';
    }
  }
};
</script>

<style scoped>
.modalTitle {
  font-size: 1.5rem;
  font-weight: 500;
}
</style> 