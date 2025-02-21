<template>
  <v-dialog
    :value="show"
    max-width="960px"
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
                <div class="info-label">Pedido</div>
                <div class="info-value primary--text font-weight-bold">
                  {{ payment.id }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <v-chip
                    small
                    :color="getStatusColor(payment.status?.name)"
                    text-color="white">
                    {{ payment.status?.name }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="info-label">Titular da compra</div>
                <div class="info-value">
                  {{ payment.user?.people?.first_name }}
                  {{ payment.user?.people?.last_name }} -
                  {{ payment.user?.people?.email }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Método</div>
                <div class="info-value text-capitalize">
                  {{ getPaymentMethod(payment.payment_method) }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Data do pedido</div>
                <div class="info-value">
                  {{ formatDateTimeWithTimezone(payment.created_at) }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Valor total</div>
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
                        :color="ticket.validated ? 'green' : 'orange'"
                        text-color="white">
                        {{ ticket.validated ? 'Validado' : 'Não Validado' }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
          <v-divider />
          <div class="tickets-actions d-flex align-center justify-space-between mt-4">
            <div class="d-flex align-center">
              <ButtonWithIcon
                text="Imprimir ingressos"
                outlined
                :loading="isPrinting"
                icon="mdi-printer"
                @click="generatePDF" />

              <ButtonWithIcon
                text="Reenviar ingressos"
                outlined
                :loading="isResending"
                icon="mdi-email"
                class="ml-2"
                @click="resendTickets" />
            </div>

            <ButtonWithIcon
              text="Cancelar pedido"
              outlined
              color="error"
              :loading="isCancelling"
              icon="mdi-cancel"
              class="ml-2"
              @click="showCancelConfirmation" />
          </div>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { TicketPdfGenerator } from '@/services/pdf/ticketPdfGenerator';
import { formatDateTimeWithTimezone, formatRealValue } from '@/utils/formatters';
import { payment, eventCustomerTickets, toast } from '@/store';
import { isMobileDevice, getPaymentMethod } from '@/utils/utils';
export default {
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

  data() {
    return {
      isPrinting: false,
      isResending: false,
      isCancelling: false,
      showCancelDialog: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getEvent() {
      const filteredCustomerTicket = eventCustomerTickets.$customerTickets.find(
        (customerTicket) => customerTicket.payment_id === this.paymentId
      );

      return filteredCustomerTicket?.ticket?.event;
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
    getPaymentMethod,

    close() {
      this.$emit('update:show', false);
    },

    getStatusColor(status) {
      const colors = {
        Aprovado: 'green',
        Pendente: 'orange',
        Cancelado: 'red',
      };
      return colors[status] || 'grey';
    },

    resendTickets() {
      try {
        this.isResending = true;
        // TODO: Implementar lógica de reenvio
        toast.setToast({
          text: 'Ingressos reenviados com sucesso!',
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        console.error('Erro ao reenviar ingressos:', error);
        toast.setToast({
          text: 'Erro ao reenviar ingressos',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isResending = false;
      }
    },

    showCancelConfirmation() {
      this.showCancelDialog = true;
    },

    cancelOrder() {
      try {
        this.isCancelling = true;
        // TODO: Implementar lógica de cancelamento
        toast.setToast({
          text: 'Pedido cancelado com sucesso!',
          type: 'success',
          time: 5000,
        });
        this.showCancelDialog = false;
        this.close();
      } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        toast.setToast({
          text: 'Erro ao cancelar pedido',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isCancelling = false;
      }
    },

    async generatePDF() {
      try {
        this.isPrinting = true;
        const pdfGenerator = new TicketPdfGenerator(
          this.payment,
          this.getEvent,
          this.relatedTickets
        );
        await pdfGenerator.generate();
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        toast.setToast({
          text: 'Erro ao gerar PDF dos ingressos',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isPrinting = false;
      }
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