<template>
  <div>
    <div class="tabs">
      <span
        v-for="(item, i) in tabItems"
        :key="i"
        class="tabItems tabInactive"
        :class="item.active ? 'tabActive' : ''"
        @click="onTabChange(item)">
        {{ item.name }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { loading } from '~/store';

export default Vue.extend({
  props: {
    tabItems: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      tabs: [],
      currentTab: 0,
    };
  },

  computed: {
    $isLoading() {
      return loading.$isLoading;
    },
  },

  watch: {},

  methods: {
    onTabChange(item: any): void {
      this.tabs = this.tabItems;

      const currentItem = this.tabItems.findIndex(
        (element: any) => element.name === item.name
      );

      this.tabs.forEach((element: any) => {
        element.active = false;
      });

      this.tabs[currentItem].active = true;

      this.currentTab = currentItem;

      this.$emit('current-tab', this.tabs[currentItem]);
    },
  },
});
</script>

<style scoped>
.tabs {
  height: 70px;
  padding: 25px;
  background-color: var(--gray3) !important;
}

.tabItems {
  padding-left: 40px;
  cursor: pointer;
}

.tabInactive {
  color: var(--gray1) !important;
}

.tabActive {
  color: var(--black) !important;
}
</style>
