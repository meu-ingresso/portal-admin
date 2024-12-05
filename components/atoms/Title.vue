<template>
  <h1 color="title">{{ text }}</h1>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TitleComponent',

  props: {
    text: {
      type: String,
      default: '',
    },
  },
});
</script>

<style scoped>
h1 {
  color: var(--primary);
}
</style>
