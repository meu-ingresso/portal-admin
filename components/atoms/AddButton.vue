<template>
  <NuxtLink :to="url">
    <v-btn v-if="!$vuetify.breakpoint.mobile" class="add-button" large color="primary">
      <span class="text-add-button">{{ text }}</span> &nbsp;
      <v-icon color="white">mdi-plus-circle</v-icon>
    </v-btn>
    <v-btn v-else class="add-button" large color="primary">
      <span class="text-add-button">{{ text }}</span> &nbsp;
      <v-icon color="white">mdi-plus-circle</v-icon>
    </v-btn>
  </NuxtLink>
</template>

<script lang="ts">
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
.text-add-button {
  /* font-family: Lato; */
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 100%;
}

.add-button {
  border-radius: 34px;
}
</style>
