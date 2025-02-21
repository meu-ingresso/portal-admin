<template>
  <div>
    <template v-if="isLoading">
      <Lottie path="./animations/loading_default.json" height="300" width="300" />
    </template>

    <!-- Estado vazio -->
    <template v-else-if="orders.length === 0">
      <EmptyState
        title="Ainda não há pedidos"
        subtitle="Uma vez criados, seus pedidos aparecerão aqui"
        icon="mdi-cart-outline">
      </EmptyState>
    </template>
    <template v-else>
      <v-card flat class="mt-4">
        <v-data-table
          :headers="headers"
          :items="orders"
          :loading="isLoading"
          :server-items-length="meta.total"
          :options.sync="options"
          :footer-props="{
            itemsPerPageOptions: [10, 25, 50],
            itemsPerPageText: 'Pedidos por página',
            pageText: '{0}-{1} de {2}',
          }"
          :no-data-text="'Nenhum pedido encontrado'"
          :no-results-text="'Nenhum pedido encontrado'"
          :loading-text="'Carregando...'"
          class="orders-table"
          @update:options="handleTableUpdate">
          <!-- Data -->
          <template #[`item.created_at`]="{ item }">
            {{ formatDateTimeWithTimezone(item.created_at) }}
          </template>

          <!-- Comprador -->
          <template #[`item.buyer`]="{ item }">
            {{ item.user?.people?.first_name }} {{ item.user?.people?.last_name }}
          </template>

          <!-- Valor -->
          <template #[`item.value`]="{ item }">
            {{ formatRealValue(item.gross_value) }}
          </template>

          <!-- Forma de pagamento -->
          <template #[`item.payment_method`]="{ item }">
            {{ getPaymentMethod(item.payment_method) }}
          </template>

          <!-- Status -->
          <template #[`item.status`]="{ item }">
            <v-chip small :color="getStatusColor(item.status?.name)" text-color="white">
              {{ item.status?.name }}
            </v-chip>
          </template>

          <!-- Ações -->
          <template #[`item.actions`]="{ item }">
            <v-icon left small color="primary" @click="showDetails(item)">mdi-eye</v-icon>
          </template>
        </v-data-table>

        <PaymentDetailsModal
          :show.sync="showPaymentDetails"
          :payment-id="selectedPaymentId" />
      </v-card>
    </template>
  </div>
</template>

<script>
import { payment } from '@/store';
import { formatDateTimeWithTimezone, formatRealValue } from '@/utils/formatters';
import { getPaymentMethod } from '@/utils/utils';

export default {
  data() {
    return {
      headers: [
        { text: 'Data', value: 'created_at', sortable: true },
        { text: 'Titular da compra', value: 'buyer', sortable: false },
        { text: 'Forma de pagamento', value: 'payment_method', sortable: false },
        { text: 'Valor', value: 'value', sortable: false },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Ações', value: 'actions', sortable: false, align: 'center' },
      ],
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['created_at'],
        sortDesc: [true],
      },
      showPaymentDetails: false,
      selectedPaymentId: null,
    };
  },

  computed: {
    isLoading() {
      return payment.$isLoadingOrders;
    },

    orders() {
      return payment.$orders;
    },

    meta() {
      return payment.$ordersMeta;
    },
  },

  mounted() {
    this.fetchOrders();
  },

  methods: {
    formatDateTimeWithTimezone,
    formatRealValue,
    getPaymentMethod,

    getStatusColor(status) {
      const colors = {
        Aprovado: 'green',
        Pendente: 'warning',
        Cancelado: 'error',
      };
      return colors[status] || 'grey';
    },

    buildQueryParams(page = 1, limit = 10) {
      return {
        eventId: this.$route.params.id,
        page,
        limit,
        sort: '-created_at',
      };
    },

    isQueryDifferent(newQuery, force = false) {
      // Se forceUpdate está ativo ou não há query atual, permite a atualização
      if (force || !this.currentQuery) {
        this.currentQuery = JSON.stringify(newQuery);
        return true;
      }

      const stringifiedNewQuery = JSON.stringify(newQuery);
      if (this.currentQuery !== stringifiedNewQuery) {
        this.currentQuery = stringifiedNewQuery;
        return true;
      }

      return false;
    },

    async handleTableUpdate({ page, itemsPerPage }) {
      const newQuery = this.buildQueryParams(page, itemsPerPage);
      if (this.isQueryDifferent(newQuery)) {
        await this.fetchOrders(page, itemsPerPage);
      }
    },

    async fetchOrders(page = 1, limit = 10, force = false) {
      try {
        const query = this.buildQueryParams(page, limit);
        if (this.isQueryDifferent(query, force)) {
          await payment.fetchEventOrders(query);
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      }
    },

    showDetails(order) {
      this.selectedPaymentId = order.id;
      this.showPaymentDetails = true;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .orders-table {
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

  /* Ajuste do padding das células */
  td,
  th {
    padding: 12px 16px !important;
  }
}
</style> 