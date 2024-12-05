<template>
  <div v-if="isLoading">
    <Loading />
  </div>

  <div v-else-if="!isLoading">
    <FollowUpForm v-if="!isLoading" @update-follow-up="loadFollowUpData" />

    <v-divider v-if="visibleFollowUps && visibleFollowUps.length" />
    <br v-if="visibleFollowUps && visibleFollowUps.length" />

    <div v-for="element in visibleFollowUps" :key="element.id">
      <div v-if="!isMobile">
        <FollowUpHeaderDesktop />
        <FollowUpRowDesktop :element="element" />
        <FollowUpHeaderDesktop :is-content="true" />
        <FollowUpRowDesktop :element="element" :is-content="true" />
      </div>

      <div v-else>
        <FollowUpMobile :element="element" />
      </div>

      <br />
      <v-divider />
      <br />
    </div>

    <v-row class="text-center">
      <button v-if="showMoreAvailable" @click="showMore">Ver mais</button>
      <button v-if="visibleFollowUps.length > 3" @click="showLess">Ver menos</button>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { headSoft } from '@/store';
import { isMobileDevice } from '~/utils/utils';

export default Vue.extend({
  props: {
    customer: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      isLoading: false,
      visibleCount: 3,
      customerFollowUps: [],
    };
  },

  computed: {
    $isLoadingFollowUps() {
      return headSoft.$isLoadingFollowUps;
    },

    showMoreAvailable() {
      return this.visibleCount < this.customerFollowUps.length;
    },

    visibleFollowUps() {
      return this.customerFollowUps.slice(0, this.visibleCount);
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  watch: {
    $isLoadingFollowUps(val) {
      this.$set(this, 'customerFollowUps', headSoft.$customerFollowUps);

      this.$set(this, 'isLoading', val);
    },
  },

  created() {
    this.$set(this, 'isLoading', true);
  },

  async mounted() {
    const startTime = new Date().getTime();

    await this.loadFollowUpData();

    this.$set(this, 'customerFollowUps', headSoft.$customerFollowUps);

    const elapsedTime = new Date().getTime() - startTime;
    const timeoutDuration = Math.max(1000 - elapsedTime, 0);

    setTimeout(() => {
      this.$set(this, 'isLoading', false);
    }, timeoutDuration);
  },

  methods: {
    showMore() {
      this.visibleCount += 3;
      if (this.visibleCount > this.customerFollowUps.length) {
        this.visibleCount = this.customerFollowUps.length;
      }
    },

    showLess() {
      this.visibleCount -= 3;
      if (this.visibleCount < 3) {
        this.visibleCount = 3;
      }
    },

    async loadFollowUpData() {
      this.$set(this, 'isLoading', true);

      await headSoft.getCustomerFollowups(this.customer.IdPessoa);

      this.$set(this, 'customerFollowUps', headSoft.$customerFollowUps);

      this.$set(this, 'isLoading', false);
    },
  },
});
</script>
