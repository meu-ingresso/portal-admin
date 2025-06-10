<template>
  <v-row v-if="!isMobile" class="ticket-row mr-0 ml-0" @click="$emit('click')">
    <v-col cols="12" md="6" sm="12">
      <div class="first-ticket-column" :class="{ 'without-hover': disableHover }">
        <div v-if="!disableHover" class="ticket-hover-icon">
          <v-icon v-if="!isSwapping">mdi-drag-vertical</v-icon>

          <v-progress-circular v-else indeterminate color="primary" />
        </div>

        <div class="ticket-name">{{ name }}</div>

        <v-icon>mdi-circle-small</v-icon>

        <div class="ticket-price">{{ formatToMoney(price) }}</div>
      </div>
    </v-col>

    <v-col cols="12" md="6" sm="12">
      <div class="second-ticket-column gap-3" :class="{ 'without-menu': disableMenu }">
        <StatusBadge :text="status" />

        <v-icon>mdi-circle-small</v-icon>

        <div class="ticket-sold">{{ sold }} / {{ total }}</div>

        <ActionsMenu v-if="!disableMenu && canManageTicket" class="ticket-actions-menu" :show-delete="canManageTicket"
          :show-duplicate="canManageTicket" :show-stop-sales="canManageTicket && isTicketAvailable"
          icon="mdi-dots-horizontal" @delete="handleMenuAction('delete')" @duplicate="handleMenuAction('duplicate')"
          @stop-sales="handleMenuAction('stop-sales')" />
      </div>
    </v-col>
  </v-row>
  <v-card v-else tile elevation="0" color="ticket-row-card" @click="$emit('click')">
    <v-card-text>
      <div class="first-ticket-column is-mobile">
        <div class="ticket-name">{{ name }}</div>
        <ActionsMenu v-if="!disableMenu && canManageTicket" :show-delete="canManageTicket"
          :show-duplicate="canManageTicket" :show-stop-sales="canManageTicket && isTicketAvailable"
          icon="mdi-dots-horizontal" @delete="handleMenuAction('delete')" @duplicate="handleMenuAction('duplicate')"
          @stop-sales="handleMenuAction('stop-sales')" />
      </div>

      <div class="second-ticket-column is-mobile">
        <StatusBadge :text="status" />

        <div class="ticket-price mb-2 mt-2">{{ formatToMoney(price) }}</div>

        <div class="ticket-sold mb-2">{{ sold }} / {{ total }}</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { formatRealValue } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';

export default {
  props: {
    id: { type: String, required: true },
    disableMenu: { type: Boolean, required: false, default: false },
    isSwapping: { type: Boolean, required: false, default: false },
    name: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, required: true },
    sold: { type: Number, required: true },
    total: { type: Number, required: true },
    eventPromoter: { type: String, required: true },
    disableHover: { type: Boolean, required: false, default: false },
  },

  data() {
    return {
      menuTickets: [
        { title: 'Editar', icon: 'mdi-pencil', action: 'edit' },
        { title: 'Excluir', icon: 'mdi-delete', action: 'delete' },
      ],
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    userRole() {
      return this.$store.state.auth.user?.role;
    },

    userId() {
      return this.$store.state.auth.user?.id;
    },

    isAdmin() {
      const role = this.userRole;
      return role && role.name === 'Admin';
    },

    isEventPromoter() {
      return this.userId === this.eventPromoter;
    },

    canManageTicket() {
      return this.isAdmin || this.isEventPromoter;
    },

    isTicketAvailable() {
      return this.status !== 'Indisponível' && this.status !== 'Interrompido' && this.status !== 'Esgotado';
    },
  },

  methods: {
    formatToMoney(value) {
      return formatRealValue(value);
    },

    handleMenuAction(action) {
      switch (action) {
        case 'edit':
          this.$emit('edit', this.id);
          break;
        case 'delete':
          this.$emit('delete', {
            id: this.id,
            name: this.name,
          });
          break;
        case 'duplicate':
          this.$emit('duplicate', this.id);
          break;
        case 'stop-sales':
          this.$emit('stop-sales', this.id);
          break;
      }
    },
  },
};
</script>

<style scoped>
.ticket-row {
  margin-bottom: 12px;
  background-color: var(--tertiary);
  border-radius: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: center;
  cursor: pointer;
}

.ticket-row-card {
  background-color: var(--tertiary);
  border-radius: 8px !important;
  margin-bottom: 12px;
}

.first-ticket-column {
  display: flex;
  align-items: center;
}

.first-ticket-column.without-hover {
  padding-left: 20px;
}

.first-ticket-column.is-mobile {
  justify-content: space-between;
}

.gap-3 {
  gap: 0.75rem !important;
}

.second-ticket-column {
  align-items: center;
  justify-items: end;
  display: grid;
  grid-template-columns: 1fr 45px 90px 90px;
}

.second-ticket-column.without-menu {
  grid-template-columns: 1fr 45px 90px 20px;
}

.second-ticket-column.is-mobile {
  display: block;
}

.ticket-name {
  color: var(--primary);
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-family-inter-bold);
}

.ticket-hover-icon {
  padding-right: 8px;
  padding-left: 8px;
  cursor: pointer;
}

.ticket-price {
  color: var(--black-text);
  font-size: 16px;
  font-weight: 400;
  font-family: var(--font-family);
}

.ticket-row {
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--tertiary);
  border-radius: 8px;
}

.ticket-row:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
