<template>
  <div class="event-details-orders">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between">
          <div class="template-title">Pedidos</div>
          <DefaultButton v-if="isCollaborator || isAdmin" text="Adicionar (PDV)" @click="handleAddPdv" />
        </div>
      </v-col>
      <v-col cols="12">
        <OrdersTable ref="ordersTable" />
      </v-col>
    </v-row>

    <!-- Modal de PDV -->
    <PdvCheckoutModal 
      :show.sync="showPdvModal" 
      :event-id="$route.params.id"
      @order-created="refreshOrders" />
  </div>
</template>

<script>
import {
  eventCollaborators, 
} from '@/store';
export default {
  data() {
    return {
      showPdvModal: false
    };
  },

  computed: {
    getCollaborators() {
      return eventCollaborators.$collaborators;
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

    isCollaborator() {
      return this.getCollaborators.some(collaborator => collaborator.user_id === this.userId);
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