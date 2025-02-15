<template>
  <div v-if="!isMobile" class="coupon-row">
    <div class="coupon-content">
      <!-- Coluna do código -->
      <div class="coupon-section code-section">
        <div class="coupon-code">{{ code }}</div>
      </div>

      <!-- Separador -->
      <div class="separator">
        <v-icon>mdi-circle-small</v-icon>
      </div>

      <!-- Coluna do desconto -->
      <div class="coupon-section discount-section">
        <div class="coupon-discount">
          {{ formatDiscountValue }}
        </div>
      </div>

      <!-- Separador -->
      <div class="separator">
        <v-icon>mdi-circle-small</v-icon>
      </div>

      <!-- Coluna de usos -->
      <div class="coupon-section uses-section">
        <div class="coupon-uses">{{ uses }} / {{ maxUses }}</div>
      </div>

      <!-- Separador -->
      <div class="separator">
        <v-icon>mdi-circle-small</v-icon>
      </div>

      <!-- Coluna de tickets -->
      <div class="coupon-section tickets-section">
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <div class="tickets-info" v-bind="attrs" v-on="on">
              {{ ticketsAppliedText }}
            </div>
          </template>
          <v-card class="tickets-menu pa-4" max-width="300">
            <div class="tickets-header mb-2">Ingressos aplicáveis:</div>
            <template v-if="tickets.length === 0">
              <div class="tickets-list">
                <div v-for="ticket in eventTickets" :key="ticket.id" class="ticket-item">
                  <v-icon small class="mr-1">mdi-ticket</v-icon>
                  {{ ticket.name }}
                </div>
              </div>
            </template>
            <template v-else>
              <div class="tickets-list">
                <div v-for="ticket in tickets" :key="ticket.id" class="ticket-item">
                  <v-icon small class="mr-1">mdi-ticket</v-icon>
                  {{ ticket.name }}
                </div>
              </div>
            </template>
          </v-card>
        </v-menu>
      </div>

      <!-- Coluna de ações -->
      <div v-if="!disableMenu && canManageCoupon" class="coupon-section actions-section">
        <ActionsMenu
          class="coupon-actions-menu"
          :show-edit="canManageCoupon"
          :show-delete="canManageCoupon"
          :show-duplicate="false"
          :show-stop-sales="false"
          icon="mdi-dots-horizontal"
          @edit="handleMenuAction('edit')"
          @delete="handleMenuAction('delete')" />
      </div>
    </div>
  </div>

  <v-card v-else tile elevation="0" color="coupon-row-card">
    <v-card-text>
      <div class="first-coupon-column is-mobile">
        <div class="coupon-code">{{ code }}</div>
        <ActionsMenu
          v-if="!disableMenu && canManageCoupon"
          :show-edit="canManageCoupon"
          :show-delete="canManageCoupon"
          :show-duplicate="false"
          icon="mdi-dots-horizontal"
          @edit="handleMenuAction('edit')"
          @delete="handleMenuAction('delete')" />
      </div>

      <div class="second-coupon-column is-mobile">
        <div class="coupon-discount mb-2 mt-2">
          {{ formatDiscountValue }}
        </div>

        <div class="coupon-uses mb-2">{{ uses }} / {{ maxUses }}</div>

        <div class="coupon-tickets mb-2">
          {{ ticketsAppliedText }}
        </div>
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
    code: { type: String, required: true },
    discountType: { type: String, required: true },
    discountValue: { type: String, required: true },
    maxUses: { type: Number, required: true },
    uses: { type: Number, required: true },
    tickets: { type: Array, required: true },
    eventTickets: { type: Array, required: true },
    eventPromoter: { type: String, required: true },
  },

  data() {
    return {
      showTooltip: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    formatDiscountValue() {
      if (this.discountType === 'PERCENTAGE') {
        return `${this.discountValue}%`;
      }
      return formatRealValue(this.discountValue);
    },

    ticketsAppliedText() {
      return this.tickets.length === 0 || this.tickets.length === this.eventTickets.length
        ? 'Todos os ingressos'
        : `${this.tickets.length} ingresso${this.tickets.length > 1 ? 's' : ''}`;
    },

    ticketsTooltipText() {
      if (this.tickets.length === 0) {
        return 'Cupom válido para todos os ingressos do evento';
      }
      return `Válido para os ingressos:\n${this.tickets.map((t) => t.name).join('\n')}`;
    },

    userRole() {
      return this.$cookies.get('user_role');
    },

    userId() {
      return this.$cookies.get('user_id');
    },

    isAdmin() {
      const role = this.userRole;
      return role && role.name === 'Admin';
    },

    isEventPromoter() {
      return this.userId === this.eventPromoter;
    },

    canManageCoupon() {
      return this.isAdmin || this.isEventPromoter;
    },
  },

  methods: {
    handleMenuAction(action) {
      switch (action) {
        case 'edit':
          this.$emit('edit', this.id);
          break;
        case 'delete':
          this.$emit('delete', {
            id: this.id,
            code: this.code,
          });
          break;
      }
    },
  },
};
</script>

<style scoped>
.coupon-row {
  background-color: var(--tertiary);
  border-radius: 8px;
  margin-bottom: 12px;
  width: 100%;
}

.coupon-content {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  min-height: 64px;
}

.coupon-section {
  display: flex;
  align-items: center;
}

.code-section {
  flex: 1 1 0% !important;
}

.discount-section {
  width: 7rem;
}

.uses-section {
  width: 7rem;
}

.tickets-section {
  flex: 1;
  width: 9rem;
}

.actions-section {
  width: 48px;
  min-width: 48px;
  justify-content: flex-end;
}

.separator {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 0% !important;
  color: var(--grey-text);
  margin: 0 8px;
}

.coupon-code {
  color: var(--primary);
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-family-poppins-bold);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.coupon-discount {
  color: var(--black-text);
  font-size: 16px;
  font-weight: 400;
  font-family: var(--font-family);
  display: flex;
  align-items: center;
}

.coupon-uses {
  color: var(--black-text);
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-family);
}

.tickets-info {
  color: var(--black-text);
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-family);
  display: flex;
  align-items: center;
  cursor: pointer;
}

.tickets-menu {
  background-color: var(--white);
}

.tickets-header {
  color: var(--black-text);
  font-weight: 600;
  font-size: 14px;
}

.tickets-list {
  max-height: 200px;
  overflow-y: auto;
}

.ticket-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  color: var(--black-text);
  font-size: 14px;
}

.coupon-row-card {
  background-color: var(--tertiary);
  border-radius: 8px !important;
  margin-bottom: 12px;
}

.first-coupon-column {
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.first-coupon-column.is-mobile {
  justify-content: space-between;
}

.gap-3 {
  gap: 0.75rem !important;
}

.second-coupon-column {
  align-items: center;
  justify-items: end;
  display: grid;
  grid-template-columns: 90px 45px 1fr 90px;
}

.second-coupon-column.without-menu {
  grid-template-columns: 90px 45px 1fr 20px;
}

.second-coupon-column.is-mobile {
  display: block;
}

.coupon-code {
  color: var(--primary);
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-family-poppins-bold);
  text-transform: uppercase;
}

.coupon-discount {
  color: var(--black-text);
  font-size: 16px;
  font-weight: 400;
  font-family: var(--font-family);
  display: flex;
  align-items: center;
}

.coupon-tickets {
  cursor: help;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
