<template>
  <div class="profile-image-container">
    <v-avatar size="150" class="mb-3">
      <v-img v-if="imageUrl" :src="imageUrl" />
      <v-icon v-else size="80" color="grey lighten-1">mdi-account</v-icon>
    </v-avatar>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="d-none"
      @change="handleFileChange"
    />
    <ButtonWithIcon
      icon="mdi-camera"
      text="Alterar foto"
      color="primary"
      @click="$refs.fileInput.click()"
    />
  </div>
</template>

<script>

export default {
  props: {
    imageUrl: {
      type: String,
      default: ''
    }
  },

  methods: {
    handleFileChange(event) {
      const file = event.target.files?.[0];
      if (file) {
        this.$emit('upload', file);
      }
    }
  }
}
</script>

<style scoped>
.profile-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style> 