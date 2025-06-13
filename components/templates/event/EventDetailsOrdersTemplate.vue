<template>
  <div class="event-details-orders">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between">
          <div class="template-title">Pedidos</div>
          <DefaultButton v-if="canCreatePaymentPDV" text="Adicionar (PDV)" @click="handleAddPdv" />
        </div>
      </v-col>
      <v-col cols="12">
        <OrdersTable ref="ordersTable" :filter-user-id="isAdminOrManager ? null : userId" />
      </v-col>
    </v-row>

    <!-- Modal de PDV -->
    <PdvCheckoutModal v-if="showPdvModal" :show.sync="showPdvModal" :event-id="$route.params.id"
      @order-created="refreshOrders" />
  </div>
</template>

<script>
import { PDV_ROLE } from '@/utils/permissions-config';
export default {
  data() {
    return {
      showPdvModal: false
    };
  },

  computed: {
    getCollaborators() {
      return this.$store.getters['eventCollaborators/$collaborators'];
    },

    userRole() {
      return this.$auth.user?.role;
    },

    userId() {
      return this.$auth.user?.id;
    },

    isAdminOrManager() {
      const role = this.$auth.user?.role;
      return role && (role.name === 'Admin' || role.name === 'Manager');
    },

    canCreatePaymentPDV() {
      return this.isAdminOrManager || this.isCollaborator;
    },

    isCollaborator() {
      return this.getCollaborators.some(collaborator => collaborator.user_id === this.userId && collaborator.role.name === PDV_ROLE);
    },
  },

  methods: {
    handleAddPdv() {
      this.showPdvModal = true;
    },

    refreshOrders() {
      // Atualizar a tabela de pedidos após criar um novo
      if (this.$refs.ordersTable) {
        this.$refs.ordersTable.fetchOrders(1, 10, true);
      }
    }
  },
};
</script>