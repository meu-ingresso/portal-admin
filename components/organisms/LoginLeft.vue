<template>
  <v-row class="container">
    <v-col cols="1" />

    <v-col class="loginImage" cols="10">
      <v-row class="text-center">
        <img
          class="image"
          :class="$vuetify.breakpoint.xl ? 'imageLogin' : ''"
          src="~/assets/images/login2.jpg"
          :width="$vuetify.breakpoint.xl ? '85%' : '100%'"
          :height="$vuetify.breakpoint.xl ? '85%' : '100%'" />
      </v-row>
    </v-col>

    <v-col cols="1" />
  </v-row>
</template>

<style scoped>
.loginImage {
  padding-top: 5rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.image {
  border-radius: 10px !important;
}
</style>
