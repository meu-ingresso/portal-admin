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
        itemsPerPageText: 'Itens por página',
      }"
      @update:options="handleTableUpdate">
      <!-- Nome do Comprador -->
      <template #[`item.owner`]="{ item }">
        {{ item.current_owner_name }}
      </template>

      <!-- Tipo do Ingresso -->
      <template #[`item.ticket_type`]="{ item }">
        {{ item.ticket?.name }}
      </template>

      <!-- Status e Ação -->
      <template #[`item.actions`]="{ item }">
        <template v-if="item.validated">
          <v-chip small color="success">
            <v-icon left small>mdi-check</v-icon>
            Validado
          </v-chip>
        </template>
        <template v-else>
          <v-btn
            small
            color="primary"
            :loading="validatingId === item.id"
            @click="validateTicket(item)">
            Fazer Check-in
          </v-btn>
        </template>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { eventCustomerTickets } from '@/store';

export default {
  data() {
    return {
      headers: [
        { text: 'Comprador', value: 'owner', sortable: true },
        { text: 'Tipo', value: 'ticket_type', sortable: true },
        { text: 'Identificador', value: 'ticket_identifier', sortable: false },
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
    };
  },

  computed: {
    customerTickets() {
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
  },

  methods: {
    async handleTableUpdate(newOptions) {
      this.options = newOptions;
      await this.fetchCustomerTickets();
    },

    async fetchCustomerTickets() {
      const query = this.buildQueryParams();
      await eventCustomerTickets.fetchAndPopulateByQuery(
        `${query}&preloads[]=ticket:event`
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

    async validateTicket(ticket) {
      try {
        this.validatingId = ticket.id;

        await eventCustomerTickets.validateCustomerTicket({
          customerTicketId: ticket.id,
          validatedBy: this.userId,
        });

        toast.setToast({
          text: 'Check-in realizado com sucesso!',
          type: 'success',
        });
      } catch (error) {
        toast.setToast({
          text: 'Erro ao realizar check-in',
          type: 'error',
        });
      } finally {
        this.validatingId = null;
      }
    },
  },
};
</script> 