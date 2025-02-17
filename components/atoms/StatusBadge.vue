<template>
  <v-chip :color="color" text-color="white" class="status-badge">
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
      switch (this.text) {
        case 'Publicado':
        case 'À Venda':
          return '#0DBB73';
        case 'Rascunho':
        case 'Interrompido':
          return '#E0700D';
        case 'Aguardando Aprovação':
          return 'warning';
        case 'Excluído':
        case 'Cancelado':
        case 'Reprovado':
          return 'error';
        case 'Esgotado':
          return '#B71C1C';
        default:
          return 'warning';
      }
    },
  },
};
</script>

<style scoped>
.status-badge {
  border-radius: 48px;
  gap: 10px;
  min-width: 96px;
  height: 32px;
  font-size: 18px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
