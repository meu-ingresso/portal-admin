<template>
  <div :class="`d-flex justify-space-between`">
    <v-text-field
      :value="$_search"
      append-icon="mdi-magnify"
      :label="label"
      type="text"
      dense
      outlined
      class="search"
      background-color="#f4f4f4"
      @input="
        ($event) => {
          updateSearch($event);
        }
      " />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    search: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      attrs: null,
      on: null,
    };
  },

  computed: {
    $_search(): string {
      return this.search;
    },
  },

  methods: {
    updateSearch(value: string): void {
      this.$emit('update-search', value);
    },
  },
});
</script>

<style scoped>
.search {
  border-radius: 6px;
  padding: 5px;
}
</style>
