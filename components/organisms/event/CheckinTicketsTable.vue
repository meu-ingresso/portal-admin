<template>
  <v-card flat class="mt-4">
    <v-data-table
      :headers="headers"
      :items="customerTickets"
      :loading="isLoading"
      :server-items-length="meta.total"
      :options.sync="options"
      :footer-props="{
        itemsPerPageOptions: [50, 100, 200],
        itemsPerPageText: 'Participantes por página',
        pageText: '{0}-{1} de {2}',
        itemsPerPageAllText: 'Todos',
      }"
      :no-data-text="'Nenhum registro encontrado'"
      :no-results-text="'Nenhum registro encontrado'"
      :loading-text="'Carregando...'"
      class="checkin-table"
      @update:options="handleTableUpdate">
      <!-- Nome do Comprador -->
      <template #[`item.owner`]="{ item }">
        {{ item.currentOwner.first_name }} {{ item.currentOwner.last_name }}
      </template>

      <!-- Tipo do Ingresso -->
      <template #[`item.ticket_type`]="{ item }">
        {{ item.ticket?.name }}
      </template>

      <!-- Identificador do Ingresso -->
      <template #[`item.ticket_identifier`]="{ item }">
        {{ item.ticket_identifier }}
      </template>

      <!-- Pedido -->
      <template #[`item.payment_id`]="{ item }">
        <span
          v-if="item.payment?.id"
          class="payment-link"
          @click="openPaymentDetails(item.payment.id)">
          {{ item.payment.id }}
        </span>
        <span v-else>-</span>
      </template>

      <!-- Data de Validação -->
      <template #[`item.validated_at`]="{ item }">
        <v-tooltip v-if="item.validated" bottom>
          <template #activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">
              {{ formatDateTimeWithTimezone(item.validated_at) }}
            </span>
          </template>
          <span>Validado por: {{ item.validated_by_name || 'Sistema' }}</span>
        </v-tooltip>
        <span v-else>-</span>
      </template>

      <!-- Status e Ação -->
      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-column align-center">
          <v-btn
            small
            :color="item.validated ? 'green' : 'grey'"
            :loading="validatingId === item.id"
            class="validation-button"
            @click="toggleValidation(item)">
            <template v-if="item.validated">
              <v-icon small color="white">mdi-check</v-icon>
            </template>
            <template v-else>
              <span class="black--text">Fazer Check-in</span>
            </template>
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Modal de Detalhes do Pagamento -->
    <PaymentDetailsModal
      :show.sync="showPaymentDetails"
      :payment-id="selectedPaymentId" />
  </v-card>
</template>

<script>
import { eventCustomerTickets, toast } from '@/store';
import { formatDateTimeWithTimezone } from '@/utils/formatters';

export default {
  data() {
    return {
      headers: [
        { text: 'Comprador', value: 'owner', sortable: true },
        { text: 'Tipo', value: 'ticket_type', sortable: true },
        { text: 'Identificador', value: 'ticket_identifier', sortable: false },
        { text: 'Pedido', value: 'payment_id', sortable: false },
        {
          text: 'Data Validação',
          value: 'validated_at',
          sortable: true,
          align: 'center',
        },
        { text: 'Ações', value: 'actions', sortable: false, align: 'center' },
      ],
      options: {
        page: 1,
        itemsPerPage: 50,
        sortBy: ['created_at'],
        sortDesc: [true],
      },
      selectedTicketId: '',
      validatingId: null,
      showPaymentDetails: false,
      selectedPaymentId: '',
    };
  },

  computed: {
    customerTickets() {
      if (!this.eventId) return [];

      return eventCustomerTickets.$customerTickets;
    },
    meta() {
      return eventCustomerTickets.$meta;
    },
    isLoading() {
      return eventCustomerTickets.$isLoading;
    },
    userId() {
      return this.$cookies.get('user_id');
    },
    eventId() {
      return this.$route.params.id;
    },
  },

  methods: {
    formatDateTimeWithTimezone,

    async handleTableUpdate(newOptions) {
      this.options = newOptions;
      await this.fetchCustomerTickets();
    },

    async fetchCustomerTickets() {
      const query = this.buildQueryParams();
      await eventCustomerTickets.fetchAndPopulateByQuery(
        `${query}&preloads[]=ticket:event&preloads[]=currentOwner&whereHas[ticket][event_id][v]=${this.eventId}&preloads[]=payment:status`
      );
    },

    buildQueryParams() {
      const { sortBy, sortDesc, page, itemsPerPage } = this.options;

      let query = ``;

      if (sortBy.length > 0) {
        const sortField = sortBy[0];
        const sortOrder = sortDesc[0] ? 'desc' : 'asc';
        query += `&orderBy[]=${sortField}:${sortOrder}`;
      }

      query += `&limit=${itemsPerPage}&page=${page - 1}`;
      return query;
    },

    async toggleValidation(ticket) {
      try {
        this.validatingId = ticket.id;

        if (ticket.validated) {
          // Desfazer validação
          await eventCustomerTickets.invalidateCustomerTicket({
            customerTicketId: ticket.id,
            invalidatedBy: this.userId,
          });

          toast.setToast({
            text: 'Check-in desfeito com sucesso!',
            type: 'success',
            time: 5000,
          });
        } else {
          // Fazer validação
          await eventCustomerTickets.validateCustomerTicket({
            customerTicketId: ticket.id,
            validatedBy: this.userId,
          });

          toast.setToast({
            text: 'Check-in realizado com sucesso!',
            type: 'success',
            time: 5000,
          });
        }

        // Atualiza a tabela após a ação
        await this.fetchCustomerTickets();
      } catch (error) {
        toast.setToast({
          text: ticket.validated
            ? 'Erro ao desfazer check-in'
            : 'Erro ao realizar check-in',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.validatingId = null;
      }
    },

    openPaymentDetails(paymentId) {
      this.selectedPaymentId = paymentId;
      this.showPaymentDetails = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.payment-link {
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.validation-info {
  font-size: 12px;
  text-align: center;
}

/* Estilos da tabela */
::v-deep .checkin-table {
  /* Estilo do cabeçalho */
  .v-data-table-header {
    th {
      font-size: 16px !important;
      font-weight: 700 !important;
      font-family: var(--font-family-inter-bold) !important;
      color: var(--black-text) !important;
      white-space: nowrap;
    }
  }

  /* Estilo das células */
  .v-data-table__wrapper {
    tbody {
      td {
        font-size: 14px;
        color: var(--black-text);
      }
    }
  }

  /* Ajuste para o botão de check */
  .validation-button {
    height: 34px !important;
    min-width: 120px !important;
  }

  /* Ajuste do padding das células para comportar fonte maior */
  td,
  th {
    padding: 8px 16px !important;
  }
}
</style> 