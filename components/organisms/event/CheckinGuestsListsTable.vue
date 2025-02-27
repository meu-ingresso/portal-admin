<template>
  <div>
    <v-data-table
      :headers="isMobile ? mobileHeaders : headers"
      :items="lists"
      :loading="loading"
      :options="options"
      :server-items-length="totalItems"
      :footer-props="{
        itemsPerPageOptions: [10, 25, 50],
        itemsPerPageText: 'Listas por página',
        pageText: '{0}-{1} de {2}'
      }"
      :no-data-text="'Nenhuma lista encontrada'"
      :no-results-text="'Nenhuma lista encontrada'"
      :loading-text="'Carregando...'"
      class="elevation-1"
      :mobile-breakpoint="0"
      @update:options="$emit('update:options', $event)"
      @click:row="handleRowClick"
    >
      <!-- Slot para toolbar -->
      <template #top>
        <v-toolbar flat>
          <slot name="toolbar"></slot>
        </v-toolbar>
      </template>

      <template #[`item.quantity`]="{ item }">
        {{ formatQuantity(item.members.length) }}
      </template>

      <template #[`item.validated_quantity`]="{ item }">
        {{ formatValidatedQuantity(item) }}
      </template>

      <!-- Layout mobile com cards -->
      <template v-if="isMobile" #item="{ item }">
        <v-card class="mb-2 mt-2 list-card" elevation="0" @click="handleRowClick(item)">
          <v-card-text class="pa-3">
            <h3 class="text-h6 primary--text font-weight-medium mb-2">{{ item.name }}</h3>
            
            <div class="d-flex justify-space-between mt-2">
              <div>
                <div class="text-subtitle-2 grey--text text--darken-1">Convidados</div>
                <div class="text-body-1">{{ formatQuantity(item.members.length) }}</div>
              </div>
              
              <div>
                <div class="text-subtitle-2 grey--text text--darken-1">Validados</div>
                <div class="text-body-1">{{ formatValidatedQuantity(item) }}</div>
              </div>
            </div>

            <v-btn
              color="primary"
              text
              small
              block
              class="mt-3"
              :disabled="item.members.length === 0"
              @click.stop="handleRowClick(item)"
            >
              <v-icon left>mdi-account-group</v-icon>
              Ver convidados
            </v-btn>
          </v-card-text>
        </v-card>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    lists: {
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
      { text: 'Nome da Lista', value: 'name', sortable: true },
      { text: 'Quantidade de Convidados', value: 'quantity', sortable: false },
      { text: 'Validados', value: 'validated_quantity', sortable: false },
    ],
    mobileHeaders: [
      { text: 'Nome da Lista', value: 'name', sortable: true },
    ],
  }),

  methods: {
    formatQuantity(quantity) {
      if (quantity === 0) {
        return 'Nenhum convidado';
      }

      if (quantity === 1) {
        return '1 convidado';
      }

      return `${quantity} convidados`;
    },

    formatValidatedQuantity(item) {
      const membersValidated = item.members.reduce(
        (acc, member) =>
          acc +
          (member.guestListMemberValidated?.reduce(
            (acc, validated) => acc + validated.quantity,
            0
          ) || 0),
        0
      );

      const membersQuantity = item.members.reduce(
        (acc, member) => acc + member.quantity,
        0
      );

      return `${membersValidated} / ${membersQuantity}`;
    },

    handleRowClick(list) {
      if (list.members.length === 0) return;
      this.$emit('row-click', list);
    },
  },
};
</script>

<style scoped>
.list-card {
  cursor: pointer;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.list-card:hover {
  border-color: var(--v-primary-base);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1) !important;
}
</style> 