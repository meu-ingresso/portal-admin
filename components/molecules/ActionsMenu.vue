<template>
  <v-menu offset-y>
    <template #activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <!-- Opção de Ver Pedidos -->
      <v-list-item @click="$emit('view-orders')">
        <v-list-item-icon class="mr-2">
          <v-icon>mdi-cart</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Ver pedidos</v-list-item-title>
      </v-list-item>

      <!-- Opção de Editar -->
      <template v-if="showEdit">
        <v-list-item @click="$emit('edit')">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-pencil</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Editar</v-list-item-title>
        </v-list-item>
      </template>

      <!-- Opção de Duplicar -->
      <template v-if="showDuplicate">
        <v-list-item @click="$emit('duplicate')">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-content-copy</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Duplicar</v-list-item-title>
        </v-list-item>
      </template>

      <!-- Opção de Interromper Vendas -->
      <template v-if="showStopSales">
        <v-list-item @click="$emit('stop-sales')">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-pause-circle</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Interromper as vendas</v-list-item-title>
        </v-list-item>
      </template>

      <!-- Opção de Excluir -->
      <template v-if="showDelete">
        <v-list-item @click="$emit('delete')">
          <v-list-item-icon class="mr-2">
            <v-icon color="red">mdi-delete</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="red--text">Excluir</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  props: {
    index: {
      type: Number,
      required: false,
      default: null,
    },
    showEdit: {
      type: Boolean,
      default: false,
    },
    showDuplicate: {
      type: Boolean,
      default: false,
    },
    showDelete: {
      type: Boolean,
      default: false,
    },
    showStopSales: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: 'mdi-dots-vertical',
    },
  },
};
</script>

<style scoped>
.v-list-item-title {
  font-size: 14px;
}
</style>
