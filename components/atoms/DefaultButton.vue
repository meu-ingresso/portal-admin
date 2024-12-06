<template>
  <v-btn class="button" color="primary" depressed :elevation="0" :to="to" @click="emitClick">
    {{ text }}
  </v-btn>
</template>

<script>
export default {
  props: {
    text: { type: String, required: true },
    to: { type: String, default: null },
  },

  methods: {
    emitClick() {
      this.$emit('click');
    },
  },
};
</script>

<style scoped>
.button {
  height: 44px;
  text-transform: uppercase;
  font-weight: bold;
  color: white;
  border-radius: 34px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 16px;
}
</style>
