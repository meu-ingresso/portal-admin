<template>
  <v-card flat tile outlined class="sale-card">
    <v-card-title class="sale-card-title mb-4">{{ title }}</v-card-title>

    <v-card-subtitle class="sale-card-subtitle">{{ value }}</v-card-subtitle>
  </v-card>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    value: { type: [String, Number], required: true },
  },
};
</script>

<style scoped>
.sale-card {
  padding: 24px !important;
  border-radius: 8px !important;
  background-color: var(--tertiary);
  border: 0px !important;
}
.sale-card-title {
  font-weight: 700;
  font-size: 26px;
  color: var(--black-text) !important;
  font-family: var(--font-family-inter-bold);
}

.sale-card-subtitle {
  font-weight: 700;
  font-size: 26px;
  color: var(--black-text) !important;
  font-family: var(--font-family-inter-bold);
}

@media (max-width: 360px) {
  .sale-card-title {
    font-size: 10px;
  }

  .sale-card-subtitle {
    font-size: 16px;
  }

  .sale-card {
    padding: 6px !important;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .sale-card-title {
    font-size: 16px;
  }

  .sale-card-subtitle {
    font-size: 24px;
  }

  .sale-card {
    padding: 8px !important;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .sale-card-title {
    font-size: 16px;
  }

  .sale-card-subtitle {
    font-size: 24px;
  }

  .sale-card {
    padding: 8px !important;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .sale-card-title {
    font-size: 16px;
  }

  .sale-card-subtitle {
    font-size: 24px;
  }

  .sale-card {
    padding: 8px !important;
  }
}

@media (min-width: 1025px) and (max-width: 1440px) {
  .sale-card-title {
    font-size: 22px;
  }

  .sale-card-subtitle {
    font-size: 32px;
  }
}
</style>
