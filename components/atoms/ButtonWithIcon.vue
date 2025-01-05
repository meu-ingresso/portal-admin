<template>
  <v-btn
    class="button"
    :color="color"
    :outlined="outlined"
    depressed
    :elevation="0"
    :to="to"
    :disabled="disabled"
    :loading="isLoading"
    :block="block"
    :text="isText"
    @click="emitClick">
    <template v-if="direction === 'right'">
      {{ text }}
      <v-icon right>{{ icon }}</v-icon>
    </template>
    <template v-if="direction === 'left'">
      <v-icon left>{{ icon }}</v-icon>
      {{ text }}
    </template>
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
    isLoading: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    isText: { type: Boolean, default: false },
    direction: { type: String, default: 'right' },
    icon: { type: String, default: 'mdi-plus' },
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
  font-family: var(--font-family-inter-bold);
}
</style>
