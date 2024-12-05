<template>
  <div>
    <div
      v-if="!isMobile && $_miniVariant"
      height="50%"
      class="cursor-pointer"
      @click="$_miniVariant = !$_miniVariant">
      <v-icon class="chevron chevronRight"> mdi-chevron-double-right </v-icon>
    </div>

    <div
      v-if="!isMobile && !$_miniVariant"
      height="50%"
      class="cursor-pointer"
      @click="$_miniVariant = !$_miniVariant">
      <v-icon class="chevron chevronLeft"> mdi-chevron-double-left </v-icon>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { isMobileDevice } from '~/utils/utils';
export default Vue.extend({
  props: {
    miniVariant: {
      type: Boolean,
      default: false,
    },
    drawer: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    $_miniVariant: {
      get(this: any): boolean {
        return this.miniVariant;
      },
      set(val): void {
        this.$emit('change-mini-variant', val);
      },
    },
    $_drawer: {
      get(this: any): boolean {
        return this.drawer;
      },
      set(val): void {
        this.$emit('change-drawer', val);
      },
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },
});
</script>

<style scoped>
.chevron {
  font-size: 30px;
  margin-top: 30px;
  cursor: pointer;
  border-radius: 4px;
  background: var(--Neutrals-White, #fff);
  box-shadow: 2.54px 3.386px 3.386px 0px rgba(0, 0, 0, 0.08);
}

.chevronLeft {
  margin-left: 55px;
}

.chevronRight {
  margin-left: 15px;
}

.theme--light.v-icon {
  color: var(--secondary);
}
</style>
