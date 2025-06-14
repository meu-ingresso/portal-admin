<template>
  <div class="payment-details-page">
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-btn icon class="mr-2" @click="goBack">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div class="template-title">Detalhes do Pagamento</div>
          </div>
        </v-col>

        <v-col cols="12">
          <v-card outlined>
            <v-card-text class="pt-4">
              <Lottie v-if="isLoading" path="./animations/loading_default.json" height="300" width="300" />

              <template v-else>
                <!-- Informações do Pagamento -->
                <div class="payment-info mb-6">
                  <h3 class="subtitle-1 font-weight-bold mb-3">Informações Gerais</h3>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">Pedido</div>
                      <div class="info-value primary--text font-weight-bold">
                        {{ payment.id }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">Status</div>
                      <div class="info-value">
                        <v-chip small :color="getStatusColor(payment.status?.name)" text-color="white">
                          {{ payment.status?.name }}
                        </v-chip>
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">Titular da compra</div>
                      <div class="info-value">
                        {{ payment.user?.people?.first_name }}
                        {{ payment.user?.people?.last_name }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">Email</div>
                      <div class="info-value">
                        {{ payment.user?.people?.email }}
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">Método</div>
                      <div class="info-value text-capitalize">
                        {{ getPaymentMethod(payment.payment_method) }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">Data do pedido</div>
                      <div class="info-value">
                        {{ formatDateTimeWithTimezone(payment.created_at) }}
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">Valor bruto</div>
                      <div class="info-value">{{ formatRealValue(payment.gross_value) }}</div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">Desconto</div>
                      <div class="info-value">
                        {{ formatRealValue(getDiscountValue) }}
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">
                        Valor total

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
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">Taxa</div>
                      <div class="info-value">{{ getEventFee }}%</div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="info-label font-weight-bold">
                        Valor líquido

                        <v-tooltip bottom>
                          <template #activator="{ on, attrs }">
                            <v-icon v-bind="attrs" small class="mb-1" v-on="on">
                              mdi-information-outline
                            </v-icon>
                          </template>
                          <span>Valor Total - Taxa</span>
                        </v-tooltip>
                      </div>
                      <div class="info-value">{{ formatRealValue(payment.net_value) }}</div>
                    </v-col>
                  </v-row>
                </div>

                <!-- Lista de Ingressos -->
                <div class="tickets-list mb-6">
                  <h3 class="subtitle-1 font-weight-bold mb-3">Ingressos da Compra</h3>

                  <!-- Versão Desktop da tabela -->
                  <v-simple-table v-if="$vuetify.breakpoint.mdAndUp" fixed-header>
                    <template #default>
                      <thead>
                        <tr>
                          <th>Identificador</th>
                          <th>Nome completo / Email</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Taxa</th>
                          <th>Total</th>
                          <th>Data. Check-in</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="ticket in relatedTickets" :key="ticket.id">
                          <td>{{ ticket.ticket_identifier }}</td>
                          <td>{{ defaultFields?.[ticket.id]?.[0]?.value }} <br> {{
                            defaultFields?.[ticket.id]?.[1]?.value }}</td>
                          <td>{{ ticket.ticket?.name }}</td>
                          <td>{{ formatRealValue(ticket.ticket?.price) }}</td>
                          <td>{{ getEventFee }}%</td>
                          <td>{{ formatRealValue(ticket.ticket?.price - (ticket.ticket?.price * (getEventFee || 0) /
                            100)) }}</td>
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
                                  <v-btn x-small icon :disabled="!is24HoursOrMoreBeforeEventStart" color="primary"
                                    @click="openTicketEditModal(ticket)">
                                    <v-icon small>mdi-pencil</v-icon>
                                  </v-btn>
                                </div>
                              </template>
                              <span v-if="is24HoursOrMoreBeforeEventStart">Editar participante</span>
                              <span v-else>
                                Não é possível editar participantes de eventos que já aconteceram ou estão a menos de 24
                                horas do início
                              </span>
                            </v-tooltip>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>

                  <!-- Versão Mobile (cards) -->
                  <div v-else class="ticket-cards">
                    <v-card v-for="ticket in relatedTickets" :key="ticket.id" outlined class="mb-3 ticket-card">
                      <v-card-text>
                        <div class="d-flex justify-space-between align-center mb-2">
                          <div>
                            <div class="caption grey--text">Tipo</div>
                            <div class="subtitle-2 font-weight-medium">{{ ticket.ticket?.name }}</div>
                          </div>

                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <div v-bind="attrs" v-on="on">
                                <v-btn small icon color="primary" :disabled="!is24HoursOrMoreBeforeEventStart"
                                  @click="openTicketEditModal(ticket)">
                                  <v-icon small>mdi-pencil</v-icon>
                                </v-btn>
                              </div>
                            </template>
                            <span v-if="is24HoursOrMoreBeforeEventStart">Editar participante</span>
                            <span v-else>
                              Não é possível editar participantes de eventos que já aconteceram ou estão a menos de 24
                              horas do início
                            </span>
                          </v-tooltip>
                        </div>

                        <v-divider class="my-2"></v-divider>

                        <div class="d-flex flex-column">
                          <div class="mb-2">
                            <div class="caption grey--text">Identificador</div>
                            <div class="body-2">{{ ticket.ticket_identifier }}</div>
                          </div>

                          <div class="mb-2">
                            <div class="caption grey--text">Status</div>
                            <div>
                              <v-chip x-small :color="ticket.validated ? 'green' : 'orange'" text-color="white">
                                {{ ticket.validated ? 'Validado' : 'Não Validado' }}
                              </v-chip>
                            </div>
                          </div>

                          <div>
                            <div class="caption grey--text">Data Check-in</div>
                            <div class="body-2">
                              {{ ticket.validated ? formatDateTimeWithTimezone(ticket.validated_at) : '-' }}
                            </div>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>

                <!-- Ações -->
                <v-divider />
                <div class="tickets-actions mt-4" :class="{
                  'd-flex align-center justify-space-between': $vuetify.breakpoint.mdAndUp,
                  'mobile-actions': $vuetify.breakpoint.smAndDown
                }">
                  <div :class="{ 'd-flex align-center': $vuetify.breakpoint.mdAndUp }">
                    <ButtonWithIcon v-if="canCancelOrder" text="Cancelar pedido" outlined color="error"
                      :loading="isCancelling" icon="mdi-cancel"
                      :class="{ 'ml-2': $vuetify.breakpoint.mdAndUp, 'mb-3': $vuetify.breakpoint.smAndDown, 'full-width-mobile': $vuetify.breakpoint.smAndDown }"
                      @click="showCancelConfirmation" />
                  </div>

                  <div :class="{ 'd-flex justify-end': $vuetify.breakpoint.mdAndUp }">
                    <ButtonWithIcon v-if="canResendTickets" text="Reenviar ingressos" outlined :loading="isResending"
                      icon="mdi-email"
                      :class="{ 'mr-2': $vuetify.breakpoint.mdAndUp, 'mb-3': $vuetify.breakpoint.smAndDown, 'full-width-mobile': $vuetify.breakpoint.smAndDown }"
                      @click="resendTickets" />

                    <ButtonWithIcon v-if="canPrintTickets" text="Imprimir ingressos" outlined :loading="isPrinting"
                      icon="mdi-printer" :class="{ 'full-width-mobile': $vuetify.breakpoint.smAndDown }"
                      @click="generatePDF" />
                  </div>
                </div>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Modal de Edição de Campos do Ingresso -->
    <TicketFieldsEditModal :show.sync="showTicketFieldsEditModal" :customer-ticket-id="selectedTicketId"
      @update:show="showTicketFieldsEditModal = $event" @fields-updated="handleTicketFieldsUpdated" />

    <!-- Modal de Confirmação de Cancelamento -->
    <ConfirmDialog v-model="showCancelDialog" title="Cancelar Pedido"
      message="Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita."
      confirm-text="Sim, cancelar" cancel-text="Não, voltar" confirm-color="error" :loading="isCancelling"
      @cancel="showCancelDialog = $event" @confirm="cancelOrder" />
  </div>
</template>

<script>
import { TicketPdfGenerator } from '@/services/pdf/ticketPdfGenerator';
import { formatDateTimeWithTimezone, formatRealValue } from '@/utils/formatters';
import { getPaymentMethod, is24HoursOrMoreBeforeDate } from '@/utils/utils';
import { EVENT_PERMISSIONS } from '@/utils/permissions-config';

export default {
  layout: 'default',

  data() {
    return {
      isPrinting: false,
      isResending: false,
      isCancelling: false,
      showCancelDialog: false,
      showTicketFieldsEditModal: false,
      selectedTicketId: null,
      defaultFields: {},
    };
  },

  computed: {

    isLoadingEventPermissions() {
      return this.$store.getters['permissions/$isLoadingEventPermissions'];
    },

    getUserEventPermissions() {
      return this.$store.getters['permissions/$eventPermissions'];
    },

    canCancelOrder() {

      if (this.isLoadingEventPermissions) return false;

      return Object.values(this.getUserEventPermissions).some(permissions => permissions.includes(EVENT_PERMISSIONS.CANCEL_ORDERS));
    },

    canResendTickets() {

      if (this.isLoadingEventPermissions) return false;

      return Object.values(this.getUserEventPermissions).some(permissions => permissions.includes(EVENT_PERMISSIONS.RESEND_TICKETS_FROM_ORDERS));
    },

    canPrintTickets() {

      if (this.isLoadingEventPermissions) return false;

      return Object.values(this.getUserEventPermissions).some(permissions => permissions.includes(EVENT_PERMISSIONS.PRINT_TICKETS_FROM_ORDERS));
    },

    getEvent() {

      if (!this.relatedTickets) return null;

      const firstEventFromRelatedTickets = this.relatedTickets.find(
        (ticket) => ticket.ticket?.event
      );

      return firstEventFromRelatedTickets?.ticket?.event;
    },

    is24HoursOrMoreBeforeEventStart() {
      const event = this.getEvent;
      return event?.start_date ? is24HoursOrMoreBeforeDate(event.start_date) : false;
    },


    getEventFee() {
      if (!this.getEvent) return null;
      return this.payment.payment_method !== 'PDV' ? this.getEvent?.fees?.platform_fee : 0;
    },

    isLoading() {
      return this.$store.getters['payment/$isLoading'];
    },
    payment() {
      return this.$store.getters['payment/$payment'] || {};
    },
    relatedTickets() {
      return this.$store.getters['payment/$relatedTickets'] || [];
    },
    getDiscountValue() {
      if (!this.payment) return 0;
      return parseFloat(this.payment.gross_value) - parseFloat(this.payment.net_value);
    },
    getTotalValue() {
      if (!this.payment) return 0;
      return parseFloat(this.payment.net_value);
    },
  },

  watch: {
    getEvent: {
      async handler() {
        const eventId = this.getEvent?.id;

        if (eventId) {
          const userId = this.$store.state.auth.user?.id;
          const roleId = this.$store.state.auth.user?.role?.id;

          if (eventId && userId && roleId) {
            await this.$store.dispatch('permissions/loadEventPermissions', {
              userId,
              eventId,
              roleId
            });
          }
        }
      },
      deep: true,
    },
  },

  async mounted() {
    const orderId = this.$route.params.orderId;

    if (orderId) {

      await this.$store.dispatch('payment/fetchPaymentDetails', orderId);

      const promises = [
        this.getDefaultFields(),
      ];

      await Promise.all(promises);
    }
  },

  beforeDestroy() {
    this.$store.dispatch('payment/resetPaymentDetails');
  },

  methods: {
    formatDateTimeWithTimezone,
    formatRealValue,
    getPaymentMethod,

    async getDefaultFields() {
      const promises = this.relatedTickets.map(async (ticket) => {
        const fields = await this.$store.dispatch('eventCheckout/getTicketFields', ticket.id);
        this.$set(this.defaultFields, ticket.id, fields.filter(field => field.checkoutField.name === 'Nome Completo' || field.checkoutField.name === 'Email'));
      });

      await Promise.all(promises);
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
        this.$router.go(-1);
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
      this.$store.dispatch('payment/fetchPaymentDetails', this.$route.params.orderId);
      this.getDefaultFields();
      this.$store.dispatch('toast/setToast', {
        text: 'Dados do ingresso atualizados com sucesso!',
        type: 'success',
        time: 5000,
      });
    },

    goBack() {
      // Se estamos vindo da página de eventos, vamos voltar para a lista de pedidos
      if (this.$route.params.id) {
        this.$router.push({
          name: 'eventsDetailsOrders',
          params: { id: this.$route.params.id }
        });
      } else {
        // Caso contrário, voltar para a página anterior
        this.$router.go(-1);
      }
    },
  },
};
</script>

<style scoped>
.payment-details-page {
  padding: 20px 0;
}

.info-label {
  font-family: var(--font-family);
  color: var(--black-text);
  font-size: 14px;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--black-text);
}

.mobile-actions {
  display: flex;
  flex-direction: column;
}

.full-width-mobile {
  width: 100%;
}

.ticket-cards {
  margin-top: 10px;
}

.ticket-card {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.ticket-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ticket-card .caption {
  font-size: 11px;
  margin-bottom: 2px;
}

.ticket-card .body-2 {
  font-weight: 500;
}
</style>