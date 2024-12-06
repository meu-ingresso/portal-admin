<template>
  <v-btn class="button" color="primary" depressed :elevation="0" :to="to">
    {{ text }}
  </v-btn>
</template>

<script>
export default {
  props: {
    text: { type: String, required: true },
    to: { type: String, default: null },
  },
};
</script>

<style scoped>
.button {
  width: 240px;
  height: 44px;
  text-transform: uppercase;
  font-weight: bold;
  color: white;
  border-radius: 34px;
  padding-top: 16px;
  padding-bottom: 16px;
}
</style>
