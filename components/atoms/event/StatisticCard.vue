<template>
  <v-card flat tile outlined class="statistic-card">
    <v-card-title class="statistic-card-title">{{ title }}</v-card-title>
    <v-card-subtitle class="statistic-card-subtitle">{{ value }}</v-card-subtitle>
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
.statistic-card {
  padding: 24px !important;
  border-radius: 8px !important;
  background-color: var(--tertiary);
  border: 0px !important;
}

.statistic-card-title{
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

.statistic-card-subtitle {
  font-weight: 400;
  color: var(--black-text);
  font-family: var(--font-family);
}

@media (max-width: 360px) {
  .statistic-card-title {
    font-size: 16px;
  }

  .statistic-card-subtitle {
    font-size: 10px;
  }

  .statistic-card {
    padding: 16px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .statistic-card-title {
    font-size: 16px;
  }

  .statistic-card-subtitle {
    font-size: 10px;
  }

  .statistic-card {
    padding: 20px;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .statistic-card-title {
    font-size: 16px;
  }

  .statistic-card-subtitle {
    font-size: 10px;
  }

  .statistic-card {
    padding: 24px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .statistic-card-title {
    font-size: 18px;
  }

  .statistic-card-subtitle {
    font-size: 12px;
  }

  .statistic-card {
    padding: 28px;
  }
}

@media (min-width: 1025px) and (max-width: 1440px) {
  .statistic-card-title {
    font-size: 18px;
  }

  .statistic-card-subtitle {
    font-size: 14px;
  }

  .statistic-card {
    padding: 32px;
  }
}

@media (min-width: 1441px) {
  .statistic-card-title {
    font-size: 24px;
  }

  .statistic-card-subtitle {
    font-size: 16px;
  }

  .statistic-card {
    padding: 36px;
  }
}



</style>
