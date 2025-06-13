<template>
  <v-avatar :color="src ? 'transparent' : color" :size="size" :class="avatarClass">
    <v-img v-if="src && !imageError" :src="src" :alt="name" cover @error="handleImageError" />
    <div v-else class="white--text">
      {{ initials }}
    </div>
  </v-avatar>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'UserAvatar',

  props: {
    color: {
      type: String,
      default: 'primary'
    },
    size: {
      type: [String, Number],
      default: '32'
    },
    name: {
      type: String,
      required: true
    },
    src: {
      type: String,
      default: null
    },
    avatarClass: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      imageError: false
    };
  },

  computed: {
    initials() {
      if (!this.name) return '';

      const names = this.name.split(' ').filter(n => n.length > 0);
      if (names.length === 0) return '';

      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }

      const firstInitial = names[0].charAt(0);
      const lastInitial = names[names.length - 1].charAt(0);

      return (firstInitial + lastInitial).toUpperCase();
    }
  },

  methods: {
    handleImageError() {
      this.imageError = true;
      this.$emit('image-error');
    }
  }
});
</script>

<style scoped>
.v-avatar {
  border: 2px solid rgba(255, 255, 255, 0.1);
}
</style>
