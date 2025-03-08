<template>
  <div class="text-center reports-loading">
    <Lottie
      path="./animations/loading_default.json"
      height="200"
      width="200"
    />
    <h3 class="loading-message">{{ message }}</h3>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: 'Carregando dados do relatório...'
    }
  }
};
</script>

<style scoped>
.reports-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-message {
  margin-top: 1rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}
</style> 