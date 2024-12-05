<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <lottie-animation
    :path="path"
    class="lottieAnimation"
    :style="{
      width: width + 'px',
      height: height + 'px',
    }" />
</template>

<script lang="ts">
import Vue from 'vue';
import LottieAnimation from 'lottie-vuejs/src/LottieAnimation.vue';

export default Vue.extend({
  components: {
    LottieAnimation,
  },
  props: {
    path: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '100',
    },
    height: {
      type: String,
      default: '100',
    },
  },
});
</script>
