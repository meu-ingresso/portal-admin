<template>
  <v-dialog v-model="localVisible" persistent max-width="600px">
    <v-card>
      <v-card-title class="text-h6">
        O campo "{{ field.name }}" está em uso
      </v-card-title>
      <v-card-text>
        <p>O campo personalizado está sendo utilizado nos seguintes ingressos:</p>
        <ul>
          <li v-for="ticket in ticketsUsingField" :key="ticket">{{ ticket }}</li>
        </ul>
        <p>
          Para remover este campo, ele deve ser removido de todos os ingressos onde está
          em uso.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" text @click="closeModal">Entendido</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    field: {
      type: Object,
      required: true,
    },
    ticketsUsingField: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      localVisible: this.visible,
    };
  },
  watch: {
    visible(newVal) {
      this.localVisible = newVal;
    },
    localVisible(newVal) {
      this.$emit('update:visible', newVal);
    },
  },
  methods: {
    closeModal() {
      this.$emit('update:visible', false);
    },
  },
};
</script>

<style scoped>
.text-h6 {
  font-weight: bold;
}
</style>
