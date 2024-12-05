<template>
  <v-img :src="getImage" :alt="alt" @error="onImgError" />
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    // eslint-disable-next-line vue/prop-name-casing
    photo_url: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      failed_image: false,
    };
  },

  computed: {
    getImage(this: any) {
      if (this.photo_url)
        return !this.failed_image
          ? this.photo_url
          : require(`~/assets/images/default_avatar.svg`);
      else return require(`~/assets/images/default_avatar.svg`);
    },
  },

  methods: {
    onImgError() {
      this.failed_image = true;
    },
  },
});
</script>
