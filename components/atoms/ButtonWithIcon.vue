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
    {{ text }}
    <v-icon v-if="direction === 'right'" right>{{ icon }}</v-icon>
    <v-icon v-if="direction === 'left'" left>{{ icon }}</v-icon>
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
  border-radius: 34px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 16px;
  font-family: var(--font-family-inter-bold);
}
</style>
