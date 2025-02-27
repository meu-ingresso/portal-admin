<template>
    <v-dialog :value="show" persistent fullscreen @input="$emit('update:show', $event)">
      <v-card tile>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3 class="modalTitle">Lista - {{ title }}</h3>
          <v-btn icon @click="handleClose">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <!-- Campo de busca -->
          <v-text-field
            v-model="search"
            label="Buscar por nome"
            prepend-inner-icon="mdi-magnify"
            clearable
            dense
            outlined
            hide-details="auto"
            class="mb-4"
            @input="handleSearch"
          />

          <v-data-table
            :headers="isMobile ? mobileHeaders : headers"
            :items="members"
            :loading="loading"
            :options.sync="options"
            :server-items-length="totalItems"
            :footer-props="{
              itemsPerPageOptions: [10, 25, 50],
              itemsPerPageText: 'Membros por página',
              pageText: '{0}-{1} de {2}'
            }"
            :no-data-text="'Nenhum membro encontrado'"
            :no-results-text="'Nenhum membro encontrado'"
            :loading-text="'Carregando...'"
            :mobile-breakpoint="0"
            class="elevation-1"
            @update:options="handleTableUpdate"
          >
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
                  <div class="member-card-content">
                    <h3 class="text-subtitle-1 primary--text font-weight-medium mb-2">
                      {{ `${item.first_name} ${item.last_name}` }}
                    </h3>
                    
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
                            class="validation-button"
                            small
                            @click.stop="openCheckInModal(item)"
                          >
                            Fazer check-in
                          </v-btn>
                        </template>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-start py-4 px-4">
          <DefaultButton
            outlined
            text="Cancelar"
            @click="handleClose" />
        </v-card-actions>
      </v-card>

      <!-- Modal para check-in de quantidade -->
      <CheckinQuantityModal
        :show.sync="showQuantityModal"
        :member-id="selectedMember ? selectedMember.id : null"
        :member-name="selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name}` : ''"
        :total-quantity="selectedMember ? selectedMember.quantity : 0"
        :validated-quantity="selectedMember ? getTotalValidatedQuantity(selectedMember) : 0"
        @confirm="handleConfirmCheckIn"
      />
  </v-dialog>
</template>

<script>
export default {
  components: {
    CheckinQuantityModal: () => import('@/components/molecules/CheckinQuantityModal.vue')
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
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
    isMobile: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    headers: [
      { text: 'Nome Completo', value: 'full_name', align: 'start', sortable: true },
      { text: 'Quantidade Total', value: 'quantity_info', align: 'center', sortable: false },
      { text: 'Ações', value: 'actions', align: 'center', sortable: false },
    ],
    mobileHeaders: [
      { text: 'Convidados', value: 'full_name', sortable: true },
    ],
    checkInQuantities: {},
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: ['full_name'],
      sortDesc: [false],
    },
    search: '',
    debounceTimer: null,
    showQuantityModal: false,
    selectedMember: null,
  }),

  computed: {
    hasSelectedMembers() {
      return Object.values(this.checkInQuantities).some(quantity => quantity > 0);
    }
  },

  methods: {
    isFullyValidated(member) {
      const totalValidated = this.getTotalValidatedQuantity(member);
      return totalValidated >= member.quantity;
    },

    getTotalValidatedQuantity(member) {
      if (!member.guestListMemberValidated || member.guestListMemberValidated.length === 0) {
        return 0;
      }
      
      return member.guestListMemberValidated.reduce((total, validation) => {
        return total + (validation.quantity || 0);
      }, 0);
    },

    handleClose() {
      this.checkInQuantities = {};
      this.search = '';
      this.options = {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['full_name'],
        sortDesc: [false],
      };
      this.$emit('close');
    },

    openCheckInModal(member) {
      this.selectedMember = member;
      this.showQuantityModal = true;
    },

    handleConfirmCheckIn(validation) {
      this.$set(this.checkInQuantities, validation.id, validation.quantity);
      this.$emit('check-in', {
        ...validation,
        refreshModalData: true
      });
    },

    handleSearch() {
      // Debounce para evitar múltiplas requisições
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.$emit('search', {
          search: this.search,
          page: this.options.page,
          itemsPerPage: this.options.itemsPerPage,
          sortBy: this.options.sortBy,
          sortDesc: this.options.sortDesc,
        });
      }, 500);
    },

    handleTableUpdate() {
      this.$emit('update:options', {
        page: this.options.page,
        itemsPerPage: this.options.itemsPerPage,
        sortBy: this.options.sortBy,
        sortDesc: this.options.sortDesc,
        search: this.search
      });
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

.checkin-guests-table {
  width: 100%;
}

.quantity-input :deep(.v-input__control) {
  height: 32px;
}

.quantity-input :deep(.v-text-field__details) {
  display: none;
}

.member-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.member-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1) !important;
}

.member-card-content {
  width: 100%;
}

/* Ajustes para telas menores */
@media (max-width: 600px) {
  .modalTitle {
    font-size: 1.25rem;
  }
  
  .v-card-title {
    padding: 12px 16px;
  }
  
  .v-card-text {
    padding: 16px;
  }
  
  .v-card-actions {
    padding: 8px 16px;
  }
}
</style> 