<template>
  <div>
    <!-- Filtros -->
    <v-card flat class="mb-4">
      <v-card-text>
        <v-row>
          <!-- Campo de busca -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="filters.search"
              label="Buscar por nome ou email"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details="auto"
              @input="handleFiltersChange"
            />
          </v-col>

          <!-- Filtro de data -->
          <v-col cols="12" sm="6">
            <v-row>
              <v-col cols="6">
                <v-menu
                  v-model="startDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="filters.startDate"
                      label="Data inicial"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      clearable
                      hide-details="auto"
                      @click:clear="clearStartDate"
                    />
                  </template>
                  <v-date-picker
                    v-model="filters.startDate"
                    no-title
                    locale="pt-br"
                    dense
                    hide-details="auto"
                    @input="handleDateSelect('start')"
                  />
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                  v-model="endDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="filters.endDate"
                      label="Data final"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      clearable
                      hide-details="auto"
                      @click:clear="clearEndDate"
                    />
                  </template>
                  <v-date-picker
                    v-model="filters.endDate"
                   locale="pt-br"
                    no-title
                    dense
                    hide-details="auto"
                    @input="handleDateSelect('end')"
                  />
                </v-menu>
              </v-col>
            </v-row>
          </v-col>

          <!-- Filtros de status e método de pagamento -->
          <v-col cols="12" sm="12">
            <v-row>
              <v-col cols="6">
                <v-select
                  v-model="filters.status"
                  :items="statusOptions"
                  label="Status"
                  clearable
                  hide-details="auto"
                  @change="handleFiltersChange"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="filters.paymentMethod"
                  :items="paymentMethodOptions"
                  label="Forma de pagamento"
                  clearable
                  hide-details="auto"
                  @change="handleFiltersChange"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

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
      filters: {
        search: '',
        startDate: null,
        endDate: null,
        status: null,
        paymentMethod: null,
      },
      startDateMenu: false,
      endDateMenu: false,
      statusOptions: [
        { text: 'Aprovado', value: 'approved' },
        { text: 'Pendente', value: 'pending' },
        { text: 'Cancelado', value: 'cancelled' },
      ],
      paymentMethodOptions: [
        { text: 'Cartão de Crédito', value: 'credit_card' },
        { text: 'PIX', value: 'pix' },
        { text: 'Boleto', value: 'bank_slip' },
      ],
      debounceTimer: null,
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

    handleFiltersChange() {
      // Debounce para evitar múltiplas requisições
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.fetchOrders(this.options.page, this.options.itemsPerPage);
      }, 500);
    },

    handleDateSelect(type) {
      if (type === 'start') {
        this.startDateMenu = false;
      } else {
        this.endDateMenu = false;
      }
      this.handleFiltersChange();
    },

    clearStartDate() {
      this.filters.startDate = null;
      this.handleFiltersChange();
    },

    clearEndDate() {
      this.filters.endDate = null;
      this.handleFiltersChange();
    },

    buildQueryParams(page = 1, limit = 10) {
      return {
        eventId: this.$route.params.id,
        page,
        limit,
        sort: '-created_at',
        search: this.filters.search || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate ? `${this.filters.endDate}T23:59:59.999Z` : undefined,
        status: this.filters.status || undefined,
      };
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
