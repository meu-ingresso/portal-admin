<template>
  <v-btn
    class="button"
    :color="color"
    :outlined="outlined"
    depressed
    :elevation="0"
    :to="to"
    :disabled="disabled"
    @click="emitClick">
    {{ text }}
  </v-btn>
</template>

<script>
export default {
  props: {
    text: { type: String, required: true },
    to: { type: String, default: null },
    color: { type: String, default: 'primary' },
    outlined: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
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
  font-weight: 800;
  color: white;
  border-radius: 34px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 16px;
  font-family: var(--font-family-inter-bold);
}
</style>
