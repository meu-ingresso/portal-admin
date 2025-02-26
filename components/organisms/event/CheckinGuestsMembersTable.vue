<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="members"
      :loading="loading"
      :options="options"
      :server-items-length="totalItems"
      :footer-props="{
        itemsPerPageOptions: [10, 25, 50],
        itemsPerPageText: 'Convidados por página',
        pageText: '{0}-{1} de {2}'
      }"
      :no-data-text="'Nenhum convidado encontrado'"
      :no-results-text="'Nenhum convidado encontrado'"
      :loading-text="'Carregando...'"
      class="elevation-1"
      @update:options="$emit('update:options', $event)"
    >
      <!-- Slot para toolbar -->
      <template #top>
        <v-toolbar flat>
          <slot name="toolbar"></slot>
        </v-toolbar>
      </template>

      <template #[`item.full_name`]="{ item }">
        {{ `${item.first_name} ${item.last_name}` }}
      </template>

      <template #[`item.quantity_info`]="{ item }">
        {{ getTotalValidatedQuantity(item) }}/{{ item.quantity }}
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-column align-center">
          <template v-if="isFullyValidated(item)">
            <span class="primary--text">Check-in completo</span>
          </template>
          <template v-else>
            <v-btn
              class="validation-button"
              @click="openCheckInModal(item)"
            >
              Fazer check-in
            </v-btn>
          </template>
        </div>
      </template>
    </v-data-table>

    <!-- Modal para check-in de quantidade -->
    <CheckinQuantityModal
      :show.sync="showQuantityModal"
      :member-id="selectedMember ? selectedMember.id : null"
      :member-name="selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name}` : ''"
      :total-quantity="selectedMember ? selectedMember.quantity : 0"
      :validated-quantity="selectedMember ? getTotalValidatedQuantity(selectedMember) : 0"
      @confirm="handleConfirmCheckIn"
    />
  </div>
</template>

<script>
export default {
  components: {
    CheckinQuantityModal: () => import('@/components/molecules/CheckinQuantityModal.vue')
  },

  props: {
    members: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    options: {
      type: Object,
      required: true,
    },
    search: {
      type: String,
      default: '',
    },
  },

  data: () => ({
    headers: [
      { text: 'Nome da Lista', value: 'guestList.name', align: 'start', sortable: true },
      { text: 'Nome Completo', value: 'full_name', align: 'start', sortable: true },
      { text: 'Quantidade Total', value: 'quantity_info', align: 'center', sortable: false },
      { text: 'Ações', value: 'actions', align: 'center', sortable: false },
    ],
    showQuantityModal: false,
    selectedMember: null,
  }),

  methods: {
    isFullyValidated(member) {
      const totalValidated = this.getTotalValidatedQuantity(member);
      return totalValidated >= member.quantity;
    },

    getTotalValidatedQuantity(member) {
      if (!member.guestList) {
        return 0;
      }

      const deepMember = member.guestList.members.find(m => m.id === member.id);

      if (!deepMember.guestListMemberValidated || deepMember.guestListMemberValidated.length === 0) {
        return 0;
      }
      
      return deepMember.guestListMemberValidated.reduce((total, validation) => {
        return total + (validation.quantity || 0);
      }, 0);
    },

    openCheckInModal(member) {
      this.selectedMember = member;
      this.showQuantityModal = true;
    },

    handleConfirmCheckIn(validation) {
      this.$emit('check-in', validation);
      this.selectedMember = null;
    },
  },
};
</script>

<style scoped>
.quantity-display {
  min-width: 24px;
  text-align: center;
  font-weight: 500;
}
</style> 