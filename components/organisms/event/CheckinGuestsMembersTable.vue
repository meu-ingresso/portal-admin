<template>
  <div>
    <v-data-table
      :headers="isMobile ? mobileHeaders : headers"
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
      :mobile-breakpoint="0"
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

      <!-- Layout mobile com cards -->
      <template v-if="isMobile" #item="{ item }">
        <v-card class="mb-2 mt-2 member-card" elevation="0">
          <v-card-text class="pa-3">
            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-subtitle-1 font-weight-medium mb-0">
                {{ `${item.first_name} ${item.last_name}` }}
              </h3>
              <v-chip x-small color="primary" text-color="white" class="ml-2">
                {{ item.guestList ? item.guestList.name : "Lista não encontrada" }}
              </v-chip>
            </div>
            
            <div class="d-flex justify-space-between align-center mt-3">
              <div>
                <div class="text-caption grey--text">Quantidade</div>
                <div class="text-body-2 font-weight-medium">{{ getTotalValidatedQuantity(item) }}/{{ item.quantity }}</div>
              </div>
              
              <div>
                <template v-if="isFullyValidated(item)">
                  <v-chip color="success" small>Check-in completo</v-chip>
                </template>
                <template v-else>
                  <v-btn
                    small
                    @click.stop="openCheckInModal(item)"
                  >
                    Fazer check-in
                  </v-btn>
                </template>
              </div>
            </div>
          </v-card-text>
        </v-card>
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
    isMobile: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    headers: [
      { text: 'Nome da Lista', value: 'guestList.name', align: 'start', sortable: true },
      { text: 'Nome Completo', value: 'full_name', align: 'start', sortable: true },
      { text: 'Quantidade Total', value: 'quantity_info', align: 'center', sortable: false },
      { text: 'Ações', value: 'actions', align: 'center', sortable: false },
    ],
    mobileHeaders: [
      { text: 'Convidados', value: 'full_name', sortable: true },
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
.member-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.member-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1) !important;
}

.quantity-display {
  min-width: 24px;
  text-align: center;
  font-weight: 500;
}
</style> 