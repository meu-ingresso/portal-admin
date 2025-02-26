<template>
  <div>
    <v-data-table
      :headers="headers"
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
  },

  data: () => ({
    headers: [
      { text: 'Nome da Lista', value: 'name', sortable: true },
      { text: 'Quantidade de Convidados', value: 'quantity', sortable: false },
      { text: 'Validados', value: 'validated_quantity', sortable: false },
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