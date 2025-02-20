<template>
  <v-dialog
    :value="show"
    max-width="720px"
    :fullscreen="isMobile"
    @input="$emit('update:show', $event)">
    <v-card :tile="isMobile">
      <v-card-title class="d-flex justify-space-between align-center">
        <h3>Detalhes do Pagamento</h3>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-skeleton-loader v-if="isLoading" type="article" />

        <template v-else>
          <!-- Informações do Pagamento -->
          <div class="payment-info mb-6">
            <h3 class="subtitle-1 font-weight-bold mb-3">Informações Gerais</h3>
            <v-row dense>
              <v-col cols="6">
                <div class="info-label">ID do Pagamento</div>
                <div class="info-value">{{ payment.id }}</div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <v-chip small :color="getStatusColor(payment.status?.name)">
                    {{ payment.status?.name }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Método</div>
                <div class="info-value text-capitalize">{{ payment.payment_method }}</div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Data do pedido</div>
                <div class="info-value">
                  {{ formatDateTimeWithTimezone(payment.created_at) }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Valor Bruto</div>
                <div class="info-value">{{ formatRealValue(payment.gross_value) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Valor Líquido</div>
                <div class="info-value">{{ formatRealValue(payment.net_value) }}</div>
              </v-col>
            </v-row>
          </div>

          <!-- Lista de Ingressos -->
          <div class="tickets-list">
            <h3 class="subtitle-1 font-weight-bold mb-3">Ingressos da Compra</h3>
            <v-simple-table>
              <template #default>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Identificador</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ticket in relatedTickets" :key="ticket.id">
                    <td>{{ ticket.ticket?.name }}</td>
                    <td>{{ ticket.ticket_identifier }}</td>
                    <td>
                      <v-chip
                        x-small
                        :color="ticket.validated ? 'success' : 'warning'"
                        text-color="white">
                        {{ ticket.validated ? 'Validado' : 'Não Validado' }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { formatDateTimeWithTimezone, formatRealValue } from '@/utils/formatters';
import { payment } from '@/store';
import { isMobileDevice } from '@/utils/utils';
export default {
  name: 'PaymentDetailsModal',

  props: {
    show: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: String,
      default: '',
    },
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isLoading() {
      return payment.$isLoading;
    },
    payment() {
      return payment.$payment || {};
    },
    relatedTickets() {
      return payment.$relatedTickets;
    },
  },

  watch: {
    show(newValue) {
      if (newValue && this.paymentId) {
        payment.fetchPaymentDetails(this.paymentId);
      } else if (!newValue) {
        payment.resetPaymentDetails();
      }
    },
  },

  methods: {
    formatDateTimeWithTimezone,
    formatRealValue,

    close() {
      this.$emit('update:show', false);
    },

    getStatusColor(status) {
      const colors = {
        Aprovado: 'success',
        Pendente: 'warning',
        Cancelado: 'error',
      };
      return colors[status] || 'grey';
    },
  },
};
</script>

<style scoped>
.info-label {
  font-size: 12px;
  color: var(--grey-dark);
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--black-text);
}
</style> 