<template>
  <div :class="`d-flex justify-space-between`">
    <v-text-field
      v-model="localSearch"
      :value="localSearch"
      :label="label"
      :placeholder="placeHolder"
      type="text"
      dense
      rounded
      outlined
      hide-details
      class="search"
      @input="updateSearch">
      <template #prepend-inner>
        <div class="prepend-inner-slot">
          <v-icon class="mt-2" color="primary">mdi-magnify</v-icon>
        </div>
      </template>
      <template #append>
        <div class="append-slot">
          <v-divider vertical class="mr-4 ml-4 divider-primary"></v-divider>
          <DefaultButton text="Buscar" @click="doSearch" />
        </div>
      </template>
    </v-text-field>
  </div>
</template>

<script>
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
      attrs: null,
      on: null,
      localSearch: this.search,
    };
  },

  methods: {
    updateSearch(value) {
      this.localSearch = value;
      this.$emit('update-search', value);
    },
    doSearch() {
      this.$emit('do-search', this.localSearch);
    },
  },
};
</script>

<style scoped>
.divider-primary {
  border-color: var(--primary);
}

.search {
  padding: 5px;
}
.prepend-inner-slot {
  display: flex;
  align-items: center;
  justify-content: center;
}
.append-slot {
  display: flex;
  margin-bottom: 8px;
}
</style>
