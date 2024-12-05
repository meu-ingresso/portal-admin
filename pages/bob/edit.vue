<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <BobEditTemplate
      v-if="!bobInvalid && !isLoading"
      :bob_invalid="bobInvalid"
      :bob-id="getBob" />

    <ValueNoExists v-if="bobInvalid" text="Acesso negado" />

    <Toast />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { bob } from '@/store';

export default Vue.extend({
  data() {
    return {
      isLoading: true,
      bobInvalid: false,
    };
  },

  computed: {
    getBob(): string {
      if (this.$route.params && this.$route.params.id) return this.$route.params.id;
      return '';
    },
  },

  async mounted() {
    await this.bobExists();
  },

  methods: {
    async bobExists(): Promise<void> {
      this.$set(this, 'isLoading', true);

      const response = await bob.get(this.getBob);

      if (response.body && response.body.code !== 'SEARCH_SUCCESS') {
        this.$set(this, 'bobInvalid', true);
      } else {
        this.$set(this, 'bobInvalid', false);
      }

      this.$set(this, 'isLoading', false);
    },
  },
});
</script>
