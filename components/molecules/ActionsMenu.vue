<template>
  <v-menu offset-y>
    <template #activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <!-- Opção de Editar -->
      <template v-if="showEdit">
        <v-list-item @click="onEdit">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-pencil</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Editar</v-list-item-title>
        </v-list-item>
      </template>

      <!-- Opção de Duplicar -->
      <template v-if="showDuplicate">
        <v-list-item @click="onDuplicate">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-content-copy</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Duplicar</v-list-item-title>
        </v-list-item>
      </template>

      <!-- Opção de Excluir -->
      <template v-if="showDelete">
        <v-list-item @click="onDelete">
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
      default: true,
    },
    showDuplicate: {
      type: Boolean,
      default: true,
    },
    showDelete: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: 'mdi-dots-vertical',
    },
  },
  methods: {
    onEdit() {
      this.$emit('edit', this.index);
    },
    onDuplicate() {
      this.$emit('duplicate', this.index);
    },
    onDelete() {
      this.$emit('delete', this.index);
    },
  },
};
</script>

<style scoped>
.v-list-item-title {
  font-size: 14px;
}
</style>
