<template>
  <div v-if="getPermission">
    <div class="container">
      <User :is-editing="true" :user-id="userId" />
    </div>
  </div>

  <div v-else>
    <ValueNoExists text="Acesso negado" />
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

    userId: {
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

    getAdmin() {
      return this.$cookies.get('user_role') === 'Administrador';
    },

    getUserId() {
      return this.$cookies.get('user_id');
    },

    getPermission() {
      return this.getAdmin || this.getUserId === this.userId;
    },
  },

  watch: {
    tab(newVal) {
      const newTab = this.headers.find((item: any) => item.id === newVal);
      if (newTab) {
        this.currentTabName = newTab.name;
      }
    },
  },

  methods: {},
});
</script>
