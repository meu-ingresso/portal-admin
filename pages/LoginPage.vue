<template>
  <v-container class="login-container px-2 py-2">
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