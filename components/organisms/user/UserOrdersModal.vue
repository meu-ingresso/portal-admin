<template>
  <div>
    <v-dialog :value="show" fullscreen persistent content-class="secondary-dialog"
      @input="$emit('update:show', $event)">
      <v-card tile>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3 class="modalTitle">Pedidos do Usuário: {{ userName }}</h3>
          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <div>
            <v-data-table v-if="orders.length > 0 || activeFiltersCount > 0 || isClearingFilters" :headers="headers"
              :items="orders" :loading="isLoading" :server-items-length="meta.total" :options.sync="options"
              :footer-props="{
                itemsPerPageOptions: [10, 25, 50],
                itemsPerPageText: 'Pedidos por página',
                pageText: '{0}-{1} de {2}',
              }" :no-data-text="'Nenhum pedido encontrado'" :no-results-text="'Nenhum pedido encontrado'"
              :loading-text="'Carregando...'" class="orders-table" @update:options="handleTableUpdate"
              @click:row="(item) => showDetails(item)">
              <!-- Slot para filtros -->
              <template #top>
                <v-toolbar flat>
                  <v-row>
                    <v-col cols="6">
                      <!-- Campo de busca -->
                      <v-text-field v-model="filters.search" label="Buscar por evento" prepend-inner-icon="mdi-magnify"
                        clearable hide-details="auto" class="mr-4" @input="handleFiltersChange" />
                    </v-col>
                    <v-col cols="6" class="text-right">
                      <TableFilter :active-filters-count="activeFiltersCount" @clear-filters="clearFilters">
                        <template #filter-content>
                          <v-row>
                            <!-- Filtro de período -->
                            <v-col cols="12">
                              <v-row>
                                <v-col cols="6">
                                  <v-menu v-model="startDateMenu" :close-on-content-click="false"
                                    transition="scale-transition" offset-y max-width="290px" min-width="290px">
                                    <template #activator="{ on, attrs }">
                                      <v-text-field v-model="filters.startDate" label="Data inicial" readonly outlined
                                        dense v-bind="attrs" clearable hide-details="auto" v-on="on"
                                        @click:clear="clearStartDate" />
                                    </template>
                                    <v-date-picker v-model="filters.startDate" no-title locale="pt-br"
                                      @input="handleDateSelect('start')" />
                                  </v-menu>
                                </v-col>
                                <v-col cols="6">
                                  <v-menu v-model="endDateMenu" :close-on-content-click="false"
                                    transition="scale-transition" offset-y max-width="290px" min-width="290px">
                                    <template #activator="{ on, attrs }">
                                      <v-text-field v-model="filters.endDate" label="Data final" readonly outlined dense
                                        v-bind="attrs" clearable hide-details="auto" v-on="on"
                                        @click:clear="clearEndDate" />
                                    </template>
                                    <v-date-picker v-model="filters.endDate" no-title locale="pt-br"
                                      @input="handleDateSelect('end')" />
                                  </v-menu>
                                </v-col>
                              </v-row>
                            </v-col>

                            <!-- Filtros de status e método de pagamento -->
                            <v-col cols="12">
                              <v-row>
                                <v-col cols="6">
                                  <v-select v-model="filters.status" :items="statusOptions" label="Status" outlined
                                    dense clearable hide-details="auto" @change="handleFiltersChange" />
                                </v-col>
                                <v-col cols="6">
                                  <v-select v-model="filters.paymentMethod" :items="paymentMethodOptions"
                                    label="Forma de pagamento" outlined dense clearable hide-details="auto"
                                    @change="handleFiltersChange" />
                                </v-col>
                              </v-row>
                            </v-col>
                          </v-row>
                        </template>
                      </TableFilter>
                    </v-col>
                  </v-row>
                </v-toolbar>

                <!-- Chips de filtros ativos -->
                <v-sheet v-if="activeFiltersCount" class="px-4 py-2 chip-filters">
                  <v-chip v-if="filters.startDate || filters.endDate" class="mr-2" close @click:close="clearDates">
                    <v-icon left small>mdi-calendar-range</v-icon>
                    Período: {{ formatDateRange }}
                  </v-chip>

                  <v-chip v-if="filters.status" class="mr-2" close @click:close="clearStatus">
                    <v-icon left small>mdi-flag</v-icon>
                    Status: {{ getStatusText(filters.status) }}
                  </v-chip>

                  <v-chip v-if="filters.paymentMethod" class="mr-2" close @click:close="clearPaymentMethod">
                    <v-icon left small>mdi-credit-card</v-icon>
                    Pagamento: {{ getPaymentMethod(filters.paymentMethod) }}
                  </v-chip>
                </v-sheet>
              </template>

              <!-- Data -->
              <template #[`item.created_at`]="{ item }">
                {{ formatDateTimeWithTimezone(item.created_at) }}
              </template>

              <!-- Evento -->
              <template #[`item.event`]="{ item }">
                {{ item.ticket?.event?.name }}
              </template>

              <!-- Valor -->
              <template #[`item.net_value`]="{ item }">
                {{ formatRealValue(item.payment?.net_value) }}

                <v-tooltip v-if="item.payment?.coupon_id" bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon v-bind="attrs" small size="22" class="tagIcon" v-on="on">mdi-tag</v-icon>
                  </template>
                  Cupom aplicado: {{ item.payment?.coupon?.code }}
                </v-tooltip>
              </template>

              <!-- Forma de pagamento -->
              <template #[`item.payment_method`]="{ item }">
                {{ getPaymentMethod(item.payment?.payment_method) }}
              </template>

              <!-- Taxa -->
              <template #[`item.fee`]="{ item }">
                {{ item.ticket?.event?.fees?.platform_fee || 0 }}%
              </template>

              <!-- Valor Líquido -->
              <template #[`item.receipt_value`]="{ item }">
                {{
                  formatRealValue(
                    calculateNetValue(
                      item.payment?.net_value,
                      item.ticket?.event?.fees?.platform_fee || 0
                    )
                  )
                }}
              </template>

              <!-- Status -->
              <template #[`item.status`]="{ item }">
                <v-chip small :color="getStatusColor(item.payment?.status?.name)" text-color="white">
                  {{ item.payment?.status?.name }}
                </v-chip>
              </template>

            </v-data-table>

            <!-- Estado vazio -->
            <template v-else>
              <EmptyState title="Ainda não há pedidos para este usuário"
                subtitle="Uma vez criados, os pedidos aparecerão aqui" icon="mdi-cart-outline">
              </EmptyState>
            </template>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <PaymentDetailsModal :show.sync="showPaymentDetails" :payment-id="selectedPaymentId" />
  </div>
</template>

<script>
import { formatDateTimeWithTimezone, formatRealValue } from '@/utils/formatters';
import { getPaymentMethod } from '@/utils/utils';

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      default: '',
    },
    userName: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      headers: [
        { text: 'Data', value: 'created_at', sortable: true, width: '15%' },
        { text: 'Evento', value: 'event', sortable: true, width: '20%' },
        {
          text: 'Forma de pagamento',
          value: 'payment_method',
          sortable: true,
          width: '5%',
        },
        { text: 'Valor Total', value: 'net_value', sortable: true, width: '5%' },
        { text: 'Taxa', value: 'fee', sortable: true, width: '5%' },
        { text: 'Valor líquido', value: 'receipt_value', sortable: true, width: '5%' },
        { text: 'Status', value: 'status', sortable: true, width: '5%' },
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
      isLoading: false,
      isClearingFilters: false,
    };
  },

  computed: {
    orders() {
      return this.$store.getters['payment/$userOrders'];
    },

    meta() {
      return this.$store.getters['payment/$userOrdersMeta'];
    },

    activeFiltersCount() {
      let count = 0;
      if (this.filters.startDate || this.filters.endDate) count++;
      if (this.filters.status) count++;
      if (this.filters.paymentMethod) count++;
      return count;
    },

    formatDateRange() {
      const start = this.filters.startDate
        ? formatDateTimeWithTimezone(this.filters.startDate)
        : '';
      const end = this.filters.endDate
        ? formatDateTimeWithTimezone(this.filters.endDate)
        : '';

      if (start && end) return `${start} até ${end}`;
      if (start) return `A partir de ${start}`;
      if (end) return `Até ${end}`;
      return '';
    },
  },

  watch: {
    show(newValue) {
      if (newValue && this.userId) {
        this.fetchOrders(1, 10, true);
      }
    },
    userId() {
      if (this.show && this.userId) {
        this.fetchOrders(1, 10, true);
      }
    },
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
      this.isClearingFilters = true;
      this.debounceTimer = setTimeout(() => {
        this.isClearingFilters = false;
        // Reset para a primeira página quando os filtros são alterados
        this.options.page = 1;
        this.fetchOrders(1, this.options.itemsPerPage);
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
      return this.statusOptions.find((opt) => opt.value === value)?.text || value;
    },

    buildQueryParams(page = 1, limit = 10) {
      const { sortBy, sortDesc } = this.options;

      // Construir ordenação no formato esperado pela API
      let sort = '';
      if (sortBy.length > 0 && sortDesc.length > 0) {
        const sortDirection = sortDesc[0] ? '-' : '';
        sort = `${sortDirection}${sortBy[0]}`;
      } else {
        sort = '-created_at'; // Ordenação padrão
      }

      return {
        userId: this.userId,
        page,
        limit,
        sort,
        search: this.filters.search || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate
          ? `${this.filters.endDate}T23:59:59.999Z`
          : undefined,
        status: this.filters.status || undefined,
        paymentMethod: this.filters.paymentMethod || undefined,
      };
    },

    async handleTableUpdate(options) {
      // Atualiza as opções da tabela
      this.options = options;

      // Busca os pedidos com as novas opções
      const { page, itemsPerPage } = options;
      await this.fetchOrders(page, itemsPerPage);
    },

    async fetchOrders(page = 1, limit = 10, force = false) {
      try {
        const query = this.buildQueryParams(page, limit);

        if (this.isQueryDifferent(query, force)) {
          this.isLoading = true;

          await this.$store.dispatch('payment/fetchUserOrders', query);
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos do usuário:', error);
      } finally {
        this.isLoading = false;
      }
    },

    showDetails(order) {
      // Certifica-se de que a ordem tem um ID de pagamento válido
      if (order && order.payment_id) {
        this.selectedPaymentId = order.payment_id;
        this.showPaymentDetails = true;
      } else {
        console.error('ID de pagamento não encontrado para esta ordem');
      }
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

    calculateNetValue(netValue, fee) {
      return netValue - (netValue * fee) / 100;
    },

    close() {
      this.$emit('update:show', false);
    },
  },
};
</script>

<style lang="scss" scoped>
.chip-filters {
  background-color: transparent !important;
}

::v-deep(.orders-table .v-data-table__wrapper) {
  tbody {
    td {
      cursor: pointer !important;
    }
  }
}
</style>