<template>
  <v-autocomplete
    ref="select"
    v-model="selectedRating"
    :items="ratings"
    label="Classificação Indicativa"
    item-value="value"
    item-text="text"
    dense
    outlined
    hide-details="auto"
    :rules="validationRules.rating"
    :return-object="true"
    :menu-props="{ contentClass: 'rating-select-dropdown' }"
    class="rating-select">
    <template #selection="{ item }">
      <div v-if="item && item.img" class="d-flex align-center">
        <v-img :src="item.img" alt="Rating Image" class="rating-image" />
        <span>{{ item.text }}</span>
      </div>
    </template>

    <template #item="{ item, on, attrs }">
      <v-list-item v-bind="attrs" v-on="on">
        <v-list-item-avatar class="rating-avatar">
          <v-img :src="item.img" :lazy-src="item.img" alt="Rating Image" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: null,
    },
    ratings: {
      type: Array,
      required: true,
    },
    error: {
      type: Boolean,
      default: false,
    },
    errorMessages: {
      type: [String, Array],
      default: () => [],
    },
  },
  data() {
    return {
      selectedRating: this.value || null,
      hasError: false,
      validationRules: {
        rating: [(value) => !!value || 'Selecione uma classificação indicativa.'],
      },
    };
  },
  watch: {
    selectedRating(val) {
      this.$emit('input', val);
    },
  },

  methods: {
    validate() {
      this.hasError = false;
      if (!this.selectedRating?.value) {
        this.hasError = true;
      }

      this.$refs.select.validate(true);

      return this.hasError;
    },
  },
};
</script>

<style scoped>
.rating-select .rating-image {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 50%;
}

.rating-avatar {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
}

.rating-select-dropdown img {
  object-fit: cover;
  border-radius: 50%;
}
</style>
