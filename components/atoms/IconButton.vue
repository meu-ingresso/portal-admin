<template>
  <v-btn
    elevation="0"
    :color="color"
    :disabled="disabled"
    :loading="isLoading"
    :to="to"
    icon
    @click="emitClick">
    <v-icon>{{ icon }}</v-icon>
  </v-btn>
</template>

<script>
export default {
  props: {
    icon: { type: String, required: true },
    to: { type: String, default: null },
    color: { type: String, default: 'primary' },
    outlined: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
  },

  methods: {
    emitClick() {
      this.$emit('click');
    },
  },
};
</script>
