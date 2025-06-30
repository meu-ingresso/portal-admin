<template>
  <v-dialog :value="show" max-width="960px" :fullscreen="isMobile" persistent content-class="secondary-dialog"
    @input="$emit('update:show', $event)">
    <v-card :tile="isMobile">
      <v-card-title class="d-flex justify-space-between align-center">
        <h3 class="modalTitle">Detalhes do Pagamento</h3>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <Lottie v-if="isLoading" path="./animations/loading_default.json" height="300" width="300" />

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
                  <v-chip small :color="getStatusColor(payment.status?.name)" text-color="white">
                    {{ payment.status?.name }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Titular da compra</div>
                <div class="info-value">
                  {{ payment.people?.first_name }}
                  {{ payment.people?.last_name }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Email</div>
                <div class="info-value">
                  {{ payment.people?.email }}
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
                <div class="info-label">Desconto</div>
                <div class="info-value">
                  {{ formatRealValue(getDiscountValue) }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">
                  Valor pago

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-icon v-bind="attrs" small class="mb-1" v-on="on">
                        mdi-information-outline
                      </v-icon>
                    </template>
                    <span>Valor bruto - Desconto</span>
                  </v-tooltip>
                </div>
                <div class="info-value">
                  {{ formatRealValue(getTotalValue) }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">Taxa</div>
                <div class="info-value">{{ formatRealValue(getOrderFee) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="info-label">
                  Valor a receber

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-icon v-bind="attrs" small class="mb-1" v-on="on">
                        mdi-information-outline
                      </v-icon>
                    </template>
                    <span>Valor original do ingresso (antes da taxa)</span>
                  </v-tooltip>
                </div>
                <div class="info-value">{{ formatRealValue(getNetValueWithoutFee) }}</div>
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
                    <th>Data. Check-in</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ticket in relatedTickets" :key="ticket.id">
                    <td>{{ ticket.paymentTickets.ticket?.name }}</td>
                    <td>{{ ticket.ticket_identifier }}</td>
                    <td>
                      <v-chip x-small :color="ticket.validated ? 'green' : 'orange'" text-color="white">
                        {{ ticket.validated ? 'Validado' : 'Não Validado' }}
                      </v-chip>
                    </td>
                    <td>
                      {{ ticket.validated ? formatDateTimeWithTimezone(ticket.validated_at) : '-' }}
                    </td>
                    <td>
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <div v-bind="attrs" v-on="on">
                            <v-btn x-small :disabled="!is24HoursOrMoreBeforeEventStart" icon color="primary"
                              @click="openTicketEditModal(ticket)">
                              <v-icon small>mdi-pencil</v-icon>
                            </v-btn>
                          </div>
                        </template>
                        <span v-if="is24HoursOrMoreBeforeEventStart">Editar participante</span>
                        <span v-else>
                          Não é possível editar participantes de eventos que já aconteceram ou estão a menos de 24 horas
                          do início
                        </span>
                      </v-tooltip>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
          <v-divider />
          <div class="tickets-actions d-flex align-center justify-space-between mt-4">
            <div class="d-flex align-center">
              <ButtonWithIcon text="Cancelar pedido" outlined color="error" :loading="isCancelling" icon="mdi-cancel"
                class="ml-2" @click="showCancelConfirmation" />
            </div>

            <div class="d-flex justify-end">
              <ButtonWithIcon text="Reenviar ingressos" outlined :loading="isResending" icon="mdi-email" class="mr-2"
                @click="resendTickets" />

              <ButtonWithIcon text="Imprimir ingressos" outlined :loading="isPrinting" icon="mdi-printer"
                @click="generatePDF" />
            </div>
          </div>
        </template>
      </v-card-text>
    </v-card>

    <!-- Modal de Edição de Campos do Ingresso -->
    <TicketFieldsEditModal :show="showTicketFieldsEditModal" :customer-ticket-id="selectedTicketId"
      @update:show="showTicketFieldsEditModal = $event" @fields-updated="handleTicketFieldsUpdated" />

    <!-- Modal de Confirmação de Cancelamento -->
    <ConfirmDialog v-model="showCancelDialog" title="Cancelar Pedido"
      message="Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita."
      confirm-text="Sim, cancelar" cancel-text="Não, voltar" confirm-color="error" :loading="isCancelling"
      @cancel="showCancelDialog = $event" @confirm="cancelOrder" />
  </v-dialog>
</template>

<script>
import { TicketPdfGenerator } from '@/services/pdf/ticketPdfGenerator';
import { formatDateTimeWithTimezone, formatRealValue } from '@/utils/formatters';
import { isMobileDevice, getPaymentMethod, is24HoursOrMoreBeforeDate } from '@/utils/utils';

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
      showTicketFieldsEditModal: false,
      selectedTicketId: null,
    };
  },

  computed: {

    getDiscountValue() {
      if (!this.payment) return 0;
      return parseFloat(this.payment.gross_value) - parseFloat(this.payment.net_value);
    },

    getUserEventPermissions() {
      return this.$store.getters['permissions/$eventPermissions'];
    },

    canCancelOrder() {
      return Object.values(this.getUserEventPermissions).some(permissions => permissions.includes('cancel_event_orders'));
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getEvent() {
      if (!this.payment?.event) return null;

      return this?.payment?.event;
    },

    is24HoursOrMoreBeforeEventStart() {
      const event = this.getEvent;
      return event?.start_date ? is24HoursOrMoreBeforeDate(event.start_date) : false;
    },

    isLoading() {
      return this.$store.getters['payment/$isLoading'];
    },
    payment() {
      return this.$store.getters['payment/$payment'] || {};
    },
    relatedTickets() {
      return this.$store.getters['payment/$relatedTickets'];
    },

    getTotalValue() {
      if (!this.payment) return 0;
      return parseFloat(this.payment.net_value);
    },

    getEventFeePercentage() {
      if (!this.payment?.event) return 0;
      return this.payment.payment_method !== "PDV"
        ? this.payment.event?.fees?.platform_fee || 0
        : 0;
    },

    getNetValueWithoutFee() {
      if (!this.payment) return 0;
      const netValue = parseFloat(this.payment.net_value) || 0;
      const fee = this.getEventFeePercentage;
      // O netValue já inclui a taxa, então precisamos calcular o valor original
      // Fórmula: valorOriginal = valorComTaxa / (1 + taxa/100)
      return fee > 0 ? netValue / (1 + fee / 100) : netValue;
    },

    // retorna a comissão da plataforma
    // Valor pago * taxa do evento
    getOrderFee() {
      if (!this.payment?.event) return 0;
      return this.getTotalValue * (this.getEventFeePercentage / 100);
    },
  },

  watch: {
    show(newValue) {
      if (newValue && this.paymentId) {
        this.$store.dispatch('payment/fetchPaymentDetails', this.paymentId);
      } else if (!newValue) {
        this.$store.dispatch('payment/resetPaymentDetails');
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
        // @TODO: Implementar lógica de reenvio
        this.$store.dispatch('toast/setToast', {
          text: 'Ingressos reenviados com sucesso!',
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        console.error('Erro ao reenviar ingressos:', error);
        this.$store.dispatch('toast/setToast', {
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
        // @TODO: Implementar lógica de cancelamento
        this.$store.dispatch('toast/setToast', {
          text: 'Pedido cancelado com sucesso!',
          type: 'success',
          time: 5000,
        });
        this.showCancelDialog = false;
        this.close();
      } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        this.$store.dispatch('toast/setToast', {
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
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao gerar PDF dos ingressos',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isPrinting = false;
      }
    },

    openTicketEditModal(ticket) {
      this.selectedTicketId = ticket.id;
      this.showTicketFieldsEditModal = true;
    },

    handleTicketFieldsUpdated() {
      // Recarregar os dados do pagamento para refletir as alterações
      this.$store.dispatch('payment/fetchPaymentDetails', this.paymentId);
      this.$store.dispatch('toast/setToast', {
        text: 'Dados do ingresso atualizados com sucesso!',
        type: 'success',
        time: 5000,
      });
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
