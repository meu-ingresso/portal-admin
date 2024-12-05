<template>
  <div>
    <div class="container">
      <Bob :is-editing="true" :bob-id="bobId" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { loading } from '~/store';

export default Vue.extend({
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },

    bobId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {};
  },

  computed: {
    $isLoading() {
      return loading.$isLoading;
    },
  },

  methods: {},
});
</script>
