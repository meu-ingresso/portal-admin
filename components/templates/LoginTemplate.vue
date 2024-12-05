<template>
  <v-row v-if="!isLoading" class="body" :class="isMobile ? 'container' : ''">
    <v-col v-if="!isMobile" cols="6" lg="5" md="6" class="leftSide text-center">
      <LoginLeft />
    </v-col>

    <v-col
      :cols="isMobile ? '12' : '6'"
      :lg="isMobile ? '12' : '7'"
      :md="isMobile ? '12' : '6'"
      class="rightSide">
      <Login />
    </v-col>

    <Toast />
  </v-row>

  <v-row v-else class="container-main">
    <v-progress-circular indeterminate color="primary" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { sleep, isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  data() {
    return {
      isLoading: true,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  async mounted() {
    await sleep(50);
    this.$set(this, 'isLoading', false);
  },

  methods: {},
});
</script>

<style scoped>
.container-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  left: 0;
  right: 0;
}

.leftSide {
  background-color: var(--primary);
}

.rightSide {
  background: var(--beige);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
