<template>
  <div>
    <template v-if="isLoading">
      <Lottie path="./animations/loading_default.json" height="300" width="300" />
    </template>

    <v-data-table v-else-if="
      !isLoading && (orders.length > 0 || activeFiltersCount > 0 || isClearingFilters)
    " :headers="headers" :items="orders" :loading="isLoading" :server-items-length="meta.total" :options.sync="options"
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
              <v-text-field v-model="filters.search" label="Buscar por nome ou email" prepend-inner-icon="mdi-magnify"
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
                          <v-menu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition"
                            offset-y max-width="290px" min-width="290px">
                            <template #activator="{ on, attrs }">
                              <v-text-field v-model="filters.startDate" label="Data inicial" readonly outlined dense
                                v-bind="attrs" clearable hide-details="auto" v-on="on" @click:clear="clearStartDate" />
                            </template>
                            <v-date-picker v-model="filters.startDate" no-title locale="pt-br"
                              @input="handleDateSelect('start')" />
                          </v-menu>
                        </v-col>
                        <v-col cols="6">
                          <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition"
                            offset-y max-width="290px" min-width="290px">
                            <template #activator="{ on, attrs }">
                              <v-text-field v-model="filters.endDate" label="Data final" readonly outlined dense
                                v-bind="attrs" clearable hide-details="auto" v-on="on" @click:clear="clearEndDate" />
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
                          <v-select v-model="filters.status" :items="statusOptions" label="Status" outlined dense
                            clearable hide-details="auto" @change="handleFiltersChange" />
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

      <!-- Comprador -->
      <template #[`item.buyer`]="{ item }">
        {{ item.people?.first_name }} {{ item.people?.last_name }}
      </template>

      <!-- Valor -->
      <template #[`item.gross_value`]="{ item }">
        {{ formatRealValue(item.gross_value) }}

        <v-tooltip v-if="item.coupon_id" bottom>
          <template #activator="{ on, attrs }">
            <v-icon v-bind="attrs" small size="22" class="tagIcon" v-on="on">mdi-tag</v-icon>
          </template>
          Cupom aplicado: {{ item.coupon?.code }}
        </v-tooltip>
      </template>

      <!-- Forma de pagamento -->
      <template #[`item.payment_method`]="{ item }">
        {{ getPaymentMethod(item.payment_method) }}
      </template>

      <!-- Taxa -->
      <template #[`item.fee`]="{ item }">
        {{ getAppliedFeeOnTicket(item) }}
      </template>

      <!-- Valor Líquido -->
      <template #[`item.receipt_value`]="{ item }">
        {{ getNetValue(item) }}
      </template>

      <!-- Status -->
      <template #[`item.status`]="{ item }">
        <v-chip small :color="getStatusColor(item.status?.name)" text-color="white">
          {{ item.status?.name }}
        </v-chip>
      </template>
    </v-data-table>

    <!-- Estado vazio -->
    <template v-else>
      <EmptyState title="Ainda não há pedidos" subtitle="Uma vez criados, seus pedidos aparecerão aqui"
        icon="mdi-cart-outline">
      </EmptyState>
    </template>

    <PaymentDetailsModal :show.sync="showPaymentDetails" :payment-id="selectedPaymentId" />
  </div>
</template>

<script>
import { formatDateTimeWithTimezone, formatRealValue } from "@/utils/formatters";
import { getPaymentMethod } from "@/utils/utils";

export default {
  props: {
    filterPeopleId: {
      type: String,
      required: false,
      default: null,
    },
  },

  data() {
    return {
      headers: [
        { text: "Data", value: "created_at", sortable: true, width: "15%" },
        { text: "Titular da compra", value: "buyer", sortable: true, width: "20%" },
        {
          text: "Forma de pagamento",
          value: "payment_method",
          sortable: true,
          width: "5%",
        },
        { text: "Valor Total", value: "gross_value", sortable: true, width: "5%" },
        { text: "Taxa", value: "fee", sortable: true, width: "10%" },
        { text: "Valor líquido", value: "receipt_value", sortable: true, width: "5%" },
        { text: "Status", value: "status", sortable: true, width: "5%" },
      ],
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ["created_at"],
        sortDesc: [true],
      },
      showPaymentDetails: false,
      showPdvOrderDetails: false,
      selectedPaymentId: null,
      filters: {
        search: "",
        startDate: null,
        endDate: null,
        status: null,
        paymentMethod: null,
      },
      startDateMenu: false,
      endDateMenu: false,
      statusOptions: [
        { text: "Aprovado", value: "Aprovado" },
        { text: "Pendente", value: "Pendente" },
        { text: "Cancelado", value: "Cancelado" },
        { text: "Estornado", value: "Estornado" },
      ],
      paymentMethodOptions: [
        { text: "Cartão de Crédito", value: "card" },
        { text: "PIX", value: "pix" },
        { text: "PDV", value: "pdv" },
      ],
      debounceTimer: null,
      showFilters: false,
      isLoading: false,
      isClearingFilters: false,
    };
  },

  computed: {
    orders() {
      return this.$store.getters["payment/$orders"];
    },

    meta() {
      return this.$store.getters["payment/$ordersMeta"];
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
        : "";
      const end = this.filters.endDate
        ? formatDateTimeWithTimezone(this.filters.endDate)
        : "";

      if (start && end) return `${start} até ${end}`;
      if (start) return `A partir de ${start}`;
      if (end) return `Até ${end}`;
      return "";
    },
  },

  mounted() {
    this.fetchOrders(1, 10, true);
  },

  methods: {
    formatDateTimeWithTimezone,
    formatRealValue,
    getPaymentMethod,

    getAppliedFeeOnTicket(order) {
      if (!order) return 0;
      if (order.payment_method === 'pdv') {
        return formatRealValue(0);
      }

      const absorveFee = order?.paymentTickets?.some(ticket => ticket.event_absorb_service_fee);

      // Se absorve a taxa do evento, eu calculo a taxa do evento sobre o valor total da compra
      if (absorveFee) {
        const eventFee = order?.paymentTickets[0]?.event_platform_fee;

        const feesOnTickets = order.paymentTickets.reduce((acc, ticket) => {
          return acc + (parseFloat(ticket.total_final_value) * (eventFee / 100));
        }, 0);

        return formatRealValue(feesOnTickets);
      }

      // Se nao absorve, calculo a taxa aplicada por cada ingresso * quantidade do ingresso
      const feesOnTickets = order.paymentTickets.reduce((acc, ticket) => {
        return acc + (parseFloat(ticket.service_fee_applied) * ticket.quantity);
      }, 0);

      return formatRealValue(feesOnTickets);

    },

    getNetValue(order) {

      // Se o evento absrovia taxa no momento da compra, essa taxa eu decremento a taxa do valor pago pelo cliente
      const absorveFee = order?.paymentTickets?.some(ticket => ticket.event_absorb_service_fee);
      if (absorveFee) {
        const eventFee = order?.paymentTickets[0]?.event_platform_fee;
        return formatRealValue(order.gross_value - (order.gross_value * (eventFee / 100)));
      }

      return formatRealValue(order.net_value);

    },

    getStatusColor(status) {
      const colors = {
        Aprovado: "green",
        Pendente: "warning",
        Cancelado: "error",
      };
      return colors[status] || "grey";
    },

    handleFiltersChange() {
      // Debounce para evitar múltiplas requisições
      clearTimeout(this.debounceTimer);
      this.isClearingFilters = true;
      this.debounceTimer = setTimeout(() => {
        this.isClearingFilters = false;
        this.fetchOrders(this.options.page, this.options.itemsPerPage);
      }, 500);
    },

    handleDateSelect(type) {
      if (type === "start") {
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
      return {
        eventId: this.$route.params.id,
        page,
        limit,
        sort: "-created_at",
        search: this.filters.search || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate
          ? `${this.filters.endDate}T23:59:59.999Z`
          : undefined,
        status: this.filters.status || undefined,
        paymentMethod: this.filters.paymentMethod || undefined,
        peopleId: this.filterPeopleId || undefined,
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
          this.isLoading = true;
          await this.$store.dispatch("payment/fetchEventOrders", query);
          this.isLoading = false;
        }
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        this.isLoading = false;
      }
    },

    showDetails(order) {
      this.selectedPaymentId = order.id;
      this.$router.push(`/payment/details/${order.id}`);
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
      // O netValue já inclui a taxa, então precisamos calcular o valor original
      // Fórmula: valorOriginal = valorComTaxa / (1 + taxa/100)
      return netValue / (1 + fee / 100);
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
