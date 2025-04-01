<template>
  <div class="mt-4">
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
      @update:options="handleTableUpdate"
      @click:row="(item) => openPaymentDetails(item.payment.id)">
      <!-- Slot para filtros -->
      <template #top>
        <v-toolbar flat>
          <v-row class="align-center">
            <v-col cols="6">
              <!-- Campo de busca -->
              <v-text-field
                v-model="filters.search"
                label="Buscar por nome ou identificador"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details="auto"
                class="mr-4"
                @input="handleFiltersChange" />
            </v-col>
            <v-col cols="6" class="text-right">
              <TableFilter
                :active-filters-count="activeFiltersCount"
                @clear-filters="clearFilters">
                <template #filter-content>
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
                            min-width="290px">
                            <template #activator="{ on, attrs }">
                              <v-text-field
                                v-model="filters.startDate"
                                label="Data inicial do check-in"
                                readonly
                                outlined
                                dense
                                v-bind="attrs"
                                clearable
                                hide-details="auto"
                                v-on="on"
                                @click:clear="clearStartDate" />
                            </template>
                            <v-date-picker
                              v-model="filters.startDate"
                              no-title
                              locale="pt-br"
                              @input="handleDateSelect('start')" />
                          </v-menu>
                        </v-col>
                        <v-col cols="6">
                          <v-menu
                            v-model="endDateMenu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="290px">
                            <template #activator="{ on, attrs }">
                              <v-text-field
                                v-model="filters.endDate"
                                label="Data final do check-in"
                                readonly
                                outlined
                                dense
                                v-bind="attrs"
                                clearable
                                hide-details="auto"
                                v-on="on"
                                @click:clear="clearEndDate" />
                            </template>
                            <v-date-picker
                              v-model="filters.endDate"
                              no-title
                              locale="pt-br"
                              @input="handleDateSelect('end')" />
                          </v-menu>
                        </v-col>
                      </v-row>
                    </v-col>

                    <!-- Filtro de tipo de ingresso -->
                    <v-col cols="6">
                      <v-select
                        v-model="filters.ticketType"
                        :items="ticketTypeOptions"
                        label="Tipo de Ingresso"
                        outlined
                        dense
                        clearable
                        hide-details="auto"
                        @change="handleFiltersChange" />
                    </v-col>

                    <!-- Filtro de status de check-in -->
                    <v-col cols="6">
                      <v-select
                        v-model="filters.checkinStatus"
                        :items="checkinStatusOptions"
                        label="Status do Check-in"
                        outlined
                        dense
                        clearable
                        hide-details="auto"
                        @change="handleFiltersChange" />
                    </v-col>
                  </v-row>
                </template>
              </TableFilter>
            </v-col>
          </v-row>
        </v-toolbar>

        <!-- Chips de filtros ativos -->
        <v-sheet v-if="activeFiltersCount" class="px-4 py-2 chip-filters">
          <v-chip
            v-if="filters.startDate || filters.endDate"
            class="mr-2 chip-filter"
            close
            dark
            color="primary"
            @click:close="clearDates">
            <v-icon left small>mdi-calendar-range</v-icon>
            Período do check-in: {{ formatDateRange }}
          </v-chip>

          <v-chip
            v-if="filters.ticketType"
            class="mr-2 chip-filter"
            close
            dark
            color="primary"
            @click:close="clearTicketType">
            <v-icon left small>mdi-ticket</v-icon>
            Tipo: {{ filters.ticketType }}
          </v-chip>

          <v-chip
            v-if="filters.checkinStatus"
            class="mr-2 chip-filter" 
            close
            dark
            color="primary"
            @click:close="clearCheckinStatus">
            <v-icon left small>mdi-flag</v-icon>
            Status: {{ getCheckinStatusText(filters.checkinStatus) }}
          </v-chip>
        </v-sheet>
      </template>

      <!-- Nome do Comprador -->
      <template #[`item.owner`]="{ item }">
        {{ getTicketUserName(item) }}
      </template>

      <!-- Tipo do Ingresso -->
      <template #[`item.ticket_type`]="{ item }">
        {{ item.ticket?.name }}
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
          <span>
            Validado por: {{ item.validatedBy?.people?.first_name }}
            {{ item.validatedBy?.people?.last_name }}
          </span>
        </v-tooltip>
        <span v-else>-</span>
      </template>

      <!-- Ação -->
      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-column align-center">
          <v-btn
            small
            :loading="validatingId === item.id"
            class="validation-button"
            :class="{ 'validation-button-validated': item.validated }"
            @click.stop="toggleValidation(item)">
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
  </div>
</template>

<script>
import { eventCustomerTickets, toast } from '@/store';
import { formatDateTimeWithTimezone } from '@/utils/formatters';

export default {
  data() {
    return {
      headers: [
        { text: 'Nome', value: 'owner', sortable: true, width: '25%' },
        { text: 'Ingresso', value: 'ticket_type', sortable: true, width: '30%' },
        {
          text: 'Identificador',
          value: 'ticket_identifier',
          sortable: true,
          width: '15%',
        },
        {
          text: 'Data Check-in',
          value: 'validated_at',
          sortable: true,
          align: 'center',
          width: '20%',
        },
        {
          text: 'Ações',
          value: 'actions',
          sortable: false,
          align: 'center',
          width: '10%',
        },
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
      filters: {
        search: '',
        startDate: '',
        endDate: '',
        ticketType: '',
        checkinStatus: '',
      },
      startDateMenu: false,
      endDateMenu: false,
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
    activeFiltersCount() {
      return Object.keys(this.filters).filter((key) => this.filters[key]).length;
    },

    formatDateRange() {
      const { startDate, endDate } = this.filters;
      if (startDate && endDate) {
        return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
      }
      return '';
    },
    ticketTypeOptions() {
      return this.customerTickets
        .map((ticket) => ticket.ticket?.name)
        .filter((name, index, self) => name && self.indexOf(name) === index)
        .map((name) => ({ text: name, value: name }));
    },
    checkinStatusOptions() {
      return [
        { text: 'Check-in realizado', value: 'validated' },
        { text: 'Check-in não realizado', value: 'not_validated' },
      ];
    },
  },

  methods: {
    getTicketUserName(ticket) {
      if (ticket?.ticketFields?.length) {
        const nameField = ticket.ticketFields.find(
          (field) => field.checkoutField.name === 'NOME'
        );

        if (nameField) {
          return nameField.value;
        }
      }

      return ` ${ticket.currentOwner.first_name} ${ticket.currentOwner.last_name}`;
    },

    formatDateTimeWithTimezone,

    async handleTableUpdate(newOptions) {
      this.options = newOptions;
      await this.fetchCustomerTickets();
    },

    async fetchCustomerTickets() {
      const query = this.buildQueryParams();



      const searchQuery = this.filters.search
        ? `&search[currentOwner][first_name:last_name][o]=%LIKE%&search[currentOwner][first_name:last_name][v]=%${this.filters.search}%&search[ticket_identifier][o]=%LIKE%&search[ticket_identifier][v]=%${this.filters.search}%`
        : '';


      const ticketTypeQuery = this.filters.ticketType
        ? `&where[ticket][name][v]=${this.filters.ticketType}`
        : '';
      const dateQuery = this.buildDateQuery();
      const checkinStatusQuery = this.filters.checkinStatus
        ? `&where[validated][v]=${this.filters.checkinStatus === 'validated'}`
        : '';

      await eventCustomerTickets.fetchAndPopulateByQuery(
        `${query}${searchQuery}${ticketTypeQuery}${dateQuery}${checkinStatusQuery}&preloads[]=ticketFields:checkoutField&preloads[]=ticket:event&preloads[]=validatedBy:people&preloads[]=currentOwner&preloads[]=payment:status&whereHas[ticket][event_id][v]=${this.eventId}`
      );
    },

    buildDateQuery() {
      const { startDate, endDate } = this.filters;
      let dateQuery = '';

      if (startDate) {
        dateQuery += `&where[validated_at][gte]=${startDate}`;
      }
      if (endDate) {
        dateQuery += `&where[validated_at][lte]=${endDate}`;
      }

      return dateQuery;
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
          await eventCustomerTickets.invalidateCustomerTicket(ticket.id);

          toast.setToast({
            text: 'Check-in desfeito com sucesso!',
            type: 'success',
            time: 5000,
          });
        } else {
          // Fazer validação
          await eventCustomerTickets.validateCustomerTicket(ticket.id);

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

    handleFiltersChange() {
      this.fetchCustomerTickets();
    },

    clearFilters() {
      this.filters = {
        search: '',
        startDate: '',
        endDate: '',
        ticketType: '',
        checkinStatus: '',
      };
      this.fetchCustomerTickets();
    },

    clearStartDate() {
      this.filters.startDate = '';
      this.fetchCustomerTickets();
    },

    clearEndDate() {
      this.filters.endDate = '';
      this.fetchCustomerTickets();
    },

    handleDateSelect(_type) {
      this.fetchCustomerTickets();
    },

    clearTicketType() {
      this.filters.ticketType = '';
      this.fetchCustomerTickets();
    },

    clearCheckinStatus() {
      this.filters.checkinStatus = '';
      this.fetchCustomerTickets();
    },

    getCheckinStatusText(status) {
      switch (status) {
        case 'validated':
          return 'Check-in realizado';
        case 'not_validated':
          return 'Check-in não realizado';
        default:
          return 'Todos';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.chip-filters{
  background-color: transparent !important;
}


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

::v-deep(.checkin-table .v-data-table__wrapper) {
  tbody {
    td {
      cursor: pointer !important;
    }
  }
}
</style>

