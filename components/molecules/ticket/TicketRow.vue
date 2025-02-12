<template>
  <v-row v-if="!isMobile" class="ticket-row mr-0 ml-0">
    <v-col cols="12" md="6" sm="12">
      <div class="first-ticket-column">
        <div class="ticket-name">{{ name }}</div>

        <v-icon>mdi-circle-small</v-icon>

        <div class="ticket-price">{{ formatToMoney(price) }}</div>
      </div>
    </v-col>

    <v-col cols="12" md="6" sm="12">
      <div class="second-ticket-column gap-3">
        <StatusBadge :text="status" />

        <v-icon>mdi-circle-small</v-icon>

        <div class="ticket-sold">{{ sold }} / {{ total }}</div>

        <v-menu v-if="!disableMenu && canManageTicket" offset-y left>
          <template #activator="{ on, attrs }">
            <v-btn dark color="primary" icon v-bind="attrs" v-on="on">
              <v-icon class="row-icon-menu">mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>

          <v-list dense>
            <v-list-item
              v-for="(item, i) in menuTickets"
              :key="i"
              class="cursor-pointer"
              @click="handleMenuAction(item.action)">
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-col>

    <!-- Modal de confirmação -->
    <v-dialog v-model="showConfirmDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar Exclusão</h3>
          <v-btn icon @click="showConfirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir o ingresso "{{ name }}"? Esta ação não pode ser
          desfeita.
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="showConfirmDialog = false" />
          <DefaultButton text="Excluir" @click="confirmDelete" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
  <v-card v-else tile elevation="0" color="ticket-row-card">
    <v-card-text>
      <div class="first-ticket-column is-mobile">
        <div class="ticket-name">{{ name }}</div>

        <v-menu v-if="!disableMenu && canManageTicket" offset-y left>
          <template #activator="{ on, attrs }">
            <v-btn dark color="primary" icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>

          <v-list dense>
            <v-list-item
              v-for="(item, i) in menuTickets"
              :key="i"
              class="cursor-pointer"
              @click="handleMenuAction(item.action)">
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div class="second-ticket-column is-mobile">
        <StatusBadge :text="status" />

        <div class="ticket-price mb-2 mt-2">{{ formatToMoney(price) }}</div>

        <div class="ticket-sold mb-2">{{ sold }} / {{ total }}</div>
      </div>
    </v-card-text>

    <!-- Modal de confirmação -->
    <v-dialog v-model="showConfirmDialog" fullscreen persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar Exclusão</h3>
          <v-btn icon @click="showConfirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir o ingresso "{{ name }}"? Esta ação não pode ser
          desfeita.
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="showConfirmDialog = false" />
          <DefaultButton text="Excluir" @click="confirmDelete" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { formatRealValue } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';
import { eventTickets, toast } from '@/store';

export default {
  props: {
    id: { type: String, required: true },
    disableMenu: { type: Boolean, required: false, default: false },
    name: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, required: true },
    sold: { type: Number, required: true },
    total: { type: Number, required: true },
    eventPromoter: { type: String, required: true },
  },

  data() {
    return {
      showConfirmDialog: false,
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

    canManageTicket() {
      return this.isAdmin || this.isEventPromoter;
    },
  },

  methods: {
    formatToMoney(value) {
      return formatRealValue(value);
    },

    handleMenuAction(action) {
      console.log('action', action);
      switch (action) {
        case 'edit':
          this.$emit('edit', this.id);
          break;
        case 'delete':
          this.showConfirmDialog = true;
          break;
      }
    },

    async confirmDelete() {
      try {
        await eventTickets.fetchDeleteTicket(this.id);
        this.$emit('deleted', this.id);
        this.showConfirmDialog = false;

        // Notifica o usuário
        toast.setToast({
          text: `Ingresso "${this.name}" removido com sucesso!`,
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        toast.setToast({
          text: `Falha ao remover ingresso. Tente novamente.`,
          type: 'danger',
          time: 5000,
        });
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
  padding-right: 14px;
  padding-left: 14px;
  align-items: center;
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

.second-ticket-column.is-mobile {
  display: block;
}

.ticket-name {
  color: var(--primary);
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-family-poppins-bold);
}

.ticket-price {
  color: var(--black-text);
  font-size: 16px;
  font-weight: 400;
  font-family: var(--font-family);
}
</style>
