<template>
    <v-dialog :value="show" max-width="900px" @input="$emit('update:show', $event)">
      <v-card>
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
            :headers="headers"
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
              <div class="d-flex align-center justify-end">
                <template v-if="isFullyValidated(item)">
                  <span class="primary--text">Check-in completo</span>
                </template>
                <template v-else>
                  <v-btn
                    icon
                    small
                    class="mr-2"
                    :disabled="!canDecrement(item)"
                    @click="decrementQuantity(item)"
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>

                  <span class="quantity-display">{{ checkInQuantities[item.id] || 0 }}</span>

                  <v-btn
                    icon
                    small
                    class="ml-2"
                    :disabled="!canIncrement(item)"
                    @click="incrementQuantity(item)"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </template>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton
            outlined
            text="Cancelar"
            @click="handleClose" />
          <DefaultButton
            text="Validar convidados"
            :disabled="!hasSelectedMembers"
            @click="handleCheckInAll" />
        </v-card-actions>
      </v-card>
  </v-dialog>
</template>

<script>
export default {

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
  },

  data: () => ({
    headers: [
      { text: 'Nome Completo', value: 'full_name', align: 'start', sortable: true },
      { text: 'Quantidade Total', value: 'quantity_info', align: 'center', sortable: false },
      { text: 'Ações', value: 'actions', align: 'end', sortable: false },
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

    canDecrement(item) {
      return (this.checkInQuantities[item.id] || 0) > 0;
    },

    canIncrement(member) {
      const currentQuantity = this.checkInQuantities[member.id] || 0;
      const totalValidated = this.getTotalValidatedQuantity(member);
      const remainingQuantity = member.quantity - totalValidated;
      return currentQuantity < remainingQuantity;
    },

    incrementQuantity(member) {
      if (!this.checkInQuantities[member.id]) {
        this.$set(this.checkInQuantities, member.id, 0);
      }
      if (this.canIncrement(member)) {
        this.checkInQuantities[member.id]++;
      }
    },

    decrementQuantity(member) {
      if (this.canDecrement(member)) {
        this.checkInQuantities[member.id]--;
      }
    },

    handleCheckInAll() {
      try {
        // Filtra apenas os membros que foram selecionados para check-in
        const selectedMembers = this.members.filter(member => 
          (this.checkInQuantities[member.id] || 0) > 0
        );

        // Prepara o payload com as quantidades selecionadas
        const validations = selectedMembers.map(member => ({
          id: member.id,
          quantity: this.checkInQuantities[member.id]
        }));

        // Emite o evento com todas as validações
        this.$emit('check-in-all', validations);

        // Limpa todas as quantidades após o check-in
        this.checkInQuantities = {};
      } catch (error) {
        console.error('Erro ao realizar check-in em massa:', error);
      }
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
</style> 