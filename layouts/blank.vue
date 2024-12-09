<template>
  <v-app id="app">
    <v-app-bar color="primary" clipped-left dense fixed app>
      <div class="header-content">
        <MenuLogo class="header-img" :click-to-home="false" />

        <v-spacer />
      </div>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'BlankLayout',
};
</script>

<style scoped>
.header-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 12px;
  align-items: center;
}
.header-img {
  width: 230px;
  display: flex;
  justify-content: center;
}
</style>
