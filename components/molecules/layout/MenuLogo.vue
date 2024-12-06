<template>
  <div v-if="!$vuetify.breakpoint.mobile" height="50%">
    <MiniLogo
      v-if="!miniVariant"
      :class="{ 'cursor-pointer': clickToHome }"
      @click="handleClick" />

    <SmallLogo v-else :class="{ 'cursor-pointer': clickToHome }" @click="handleClick" />
  </div>

  <div v-else height="50%" @click="changeMenu()">
    <v-icon color="black"> mdi-menu </v-icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
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
    clickToHome: {
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
  },

  methods: {
    handleClick() {
      if (this.clickToHome) {
        this.$router.push('/');
      }
    },
    changeMenu() {
      this.$emit('change-drawer', !this.$_drawer);
      this.$emit('change-miniVariant', false);
    },
  },
});
</script>
