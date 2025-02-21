<template>
  <div>
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
      @update:options="handleTableUpdate"
    >
      <!-- Slot para filtros -->
      <template #top>
        <v-toolbar flat>
          <v-row>
            <v-col cols="6">
              <!-- Campo de busca -->
              <v-text-field
                v-model="filters.search"
                label="Buscar por nome ou email"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details="auto"
                class="mr-4"
                @input="handleFiltersChange"
              />
            </v-col>
            <v-col cols="6" class="text-right">
              <!-- Menu de filtros -->
              <v-menu
                v-model="showFilters"
                :close-on-content-click="false"
                offset-y
                max-width="500"
              >
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                    color="primary"
                    class="ml-2"
                  >
                    <v-icon size="24">mdi-filter</v-icon>
                    <v-badge
                      v-if="activeFiltersCount"
                      :content="activeFiltersCount.toString()"
                      color="error"
                      offset-x="12"
                      offset-y="-8"
                      dot
                    />
                  </v-btn>
                </template>

                <v-card>
                  <v-card-text class="pt-4">
                    <v-row>
                      <!-- Filtro de período -->
                      <v-col cols="12">
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
                              <template #activator="{ on, attrs }">
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
                              <template #activator="{ on, attrs }">
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
                                no-title
                                locale="pt-br"
                                @input="handleDateSelect('end')"
                              />
                            </v-menu>
                          </v-col>
                        </v-row>
                      </v-col>

                      <!-- Filtros de status e método de pagamento -->
                      <v-col cols="12">
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

                    <!-- Botão de limpar filtros -->
                    <v-row class="mt-4">
                      <v-col class="text-right">
                        <v-btn
                          text
                          color="primary"
                          @click="clearFilters"
                        >
                          Limpar filtros
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-menu>
            </v-col>
          </v-row>
        </v-toolbar>

        <!-- Chips de filtros ativos -->
        <v-sheet v-if="activeFiltersCount" class="px-4 py-2">
          <v-chip
            v-if="filters.startDate || filters.endDate"
            class="mr-2"
            close
            @click:close="clearDates"
          >
            <v-icon left small>mdi-calendar-range</v-icon>
            Período: {{ formatDateRange }}
          </v-chip>

          <v-chip
            v-if="filters.status"
            class="mr-2"
            close
            @click:close="clearStatus"
          >
            <v-icon left small>mdi-flag</v-icon>
            Status: {{ getStatusText(filters.status) }}
          </v-chip>

          <v-chip
            v-if="filters.paymentMethod"
            class="mr-2"
            close
            @click:close="clearPaymentMethod"
          >
            <v-icon left small>mdi-credit-card</v-icon>
            Pagamento: {{ getPaymentMethod(filters.paymentMethod) }}
          </v-chip>
        </v-sheet>
      </template>

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
      showFilters: false,
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

    activeFiltersCount() {
      let count = 0;
      if (this.filters.startDate || this.filters.endDate) count++;
      if (this.filters.status) count++;
      if (this.filters.paymentMethod) count++;
      return count;
    },

    formatDateRange() {
      const start = this.filters.startDate ? formatDateTimeWithTimezone(this.filters.startDate) : '';
      const end = this.filters.endDate ? formatDateTimeWithTimezone(this.filters.endDate) : '';

      if (start && end) return `${start} até ${end}`;
      if (start) return `A partir de ${start}`;
      if (end) return `Até ${end}`;
      return '';
    },
  },

  mounted() {
    this.fetchOrders(1, 10, true);
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

    clearFilters() {
      this.filters = {
        search: this.filters.search, // Mantém a busca
        startDate: null,
        endDate: null,
        status: null,
        paymentMethod: null,
      };
      this.handleFiltersChange();
    },

    clearDates() {
      this.filters.startDate = null;
      this.filters.endDate = null;
      this.handleFiltersChange();
    },

    clearStatus() {
      this.filters.status = null;
      this.handleFiltersChange();
    },

    clearPaymentMethod() {
      this.filters.paymentMethod = null;
      this.handleFiltersChange();
    },

    getStatusText(value) {
      return this.statusOptions.find(opt => opt.value === value)?.text || value;
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

  header {
    height: auto !important;
    padding-top: 14px !important;
    padding-bottom: 14px !important;
  }

  /* Ajuste do padding das células */
  td,
  th {
    padding: 12px 16px !important;
  }
}
</style>
