<template>
  <v-container class="login-container">
    <LoginTemplate />
  </v-container>
</template>

<script>
export default {
  layout: 'blank',
}
</script>

<style scoped>
.login-container {
  height: calc(100vh - 130px);
  display: flex;
}
</style>