<template>
  <v-chip :color="color" outlined class="status-badge">
    {{ text }}
  </v-chip>
</template>

<script>
export default {
  props: {
    text: { type: String, required: true },
  },

  computed: {
    color() {
      return this.text === 'Ativo' ? 'success' : 'error';
    },
  }
};
</script>

<style scoped>
.status-badge {
  border-radius: 48px;
  gap: 10px;
  width: 96px;
  height: 32px;
  font-size: 18px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
