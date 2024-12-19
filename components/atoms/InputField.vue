<template>
  <v-text-field
    :value="value"
    :label="label"
    :type="type"
    hide-details
    :rules="rules"
    outlined
    :maxlength="maxlength"
    class="input-field"
    @input="$emit('input', $event)"
  />
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'text',
    },
    maxlength: {
      type: Number,
      default: 255,
    },
    rules: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.input-field {
  margin-bottom: 16px;
}
</style>
