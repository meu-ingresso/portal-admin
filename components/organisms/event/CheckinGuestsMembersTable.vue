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

            <span class="quantity-display">{{ checkInQuantities[item.id] || 1 }}</span>

            <v-btn
              icon
              small
              class="ml-2"
              :disabled="!canIncrement(item)"
              @click="incrementQuantity(item)"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>

            <v-btn
              class="ml-4 validation-button"
              :disabled="!canCheckIn(item)"
              @click="handleCheckIn(item)"
            >
              <span class="black--text">Fazer Check-in</span>
            </v-btn>
          </template>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
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
      { text: 'Ações', value: 'actions', align: 'end', sortable: false },
    ],
    checkInQuantities: {},
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

    canDecrement(item) {
      return (this.checkInQuantities[item.id] || 0) > 0;
    },

    canIncrement(member) {
      const currentQuantity = this.checkInQuantities[member.id] || 1;
      const totalValidated = this.getTotalValidatedQuantity(member);
      const remainingQuantity = member.quantity - totalValidated;
      return currentQuantity < remainingQuantity;
    },

    canCheckIn(member) {
      const quantity = this.checkInQuantities[member.id] || 1;
      const totalValidated = this.getTotalValidatedQuantity(member);
      return quantity > 0 && (totalValidated + quantity) <= member.quantity;
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

    handleCheckIn(member) {
      try {
        const quantity = this.checkInQuantities[member.id] || 0;
        
        this.$emit('check-in', {
          id: member.id,
          quantity
        });

        // Limpa a quantidade após o check-in
        this.$set(this.checkInQuantities, member.id, 0);
      } catch (error) {
        console.error('Erro ao realizar check-in:', error);
      }
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