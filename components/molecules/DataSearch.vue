<template>
  <div class="d-flex justify-space-between">
    <v-text-field
      v-model="localSearch"
      :label="label"
      :placeholder="placeHolder"
      type="text"
      dense
      rounded
      outlined
      hide-details
      class="search"
      @input="onInput">
      <template #prepend-inner>
        <div class="prepend-inner-slot">
          <v-icon color="primary">mdi-magnify</v-icon>
        </div>
      </template>
    </v-text-field>
  </div>
</template>

<script>
import Debounce from '@/utils/Debounce';

export default {
  props: {
    search: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: '',
    },
    placeHolder: {
      type: String,
      required: false,
      default: 'Buscar',
    },
  },
  data() {
    return {
      localSearch: this.search,
      debouncer: null,
    };
  },
  watch: {
    search(newVal) {
      this.localSearch = newVal;
    },
  },
  created() {
    this.debouncer = new Debounce(this.updateSearch, 300);
  },
  methods: {
    onInput(value) {
      this.localSearch = value;
      this.debouncer.execute(value);
    },
    updateSearch(value) {
      this.$emit('do-search', value);
    },
  },
};
</script>

<style scoped>
.prepend-inner-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}
</style>
