<template>
  <div class="container">
    <v-alert dense outlined type="error">
      {{ text }}
    </v-alert>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    text: {
      type: String,
      default: '',
    },
  },

  methods: {
    back(): void {
      this.$router.replace(this.to);
    },
  },
});
</script>
