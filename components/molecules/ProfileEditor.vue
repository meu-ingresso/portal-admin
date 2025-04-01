<template>
  <v-card class="pa-4" flat tile>
    <div class="d-flex flex-column align-center">
      <ProfileImage
        :image-url="profileImageUrl"
        @upload="handleImageUpload"
      />
      
      <v-form ref="form" class="mt-6 w-100">
        <v-text-field
          v-model="displayName"
          label="Nome de exibição"
          outlined
          dense
          :rules="[v => !!v || 'Nome de exibição é obrigatório']"
          @change="$emit('update:alias', displayName)"
        />
        
        <v-textarea
          v-model="biography"
          label="Biografia"
          outlined
          auto-grow
          rows="4"
          counter="500"
          :rules="[v => !v || v.length <= 500 || 'Máximo de 500 caracteres']"
          @change="$emit('update:biography', biography)"
        />
      </v-form>
      
      <div class="d-flex justify-end w-100 mt-4">
        <DefaultButton
          text="Salvar alterações"
          color="primary"
          :loading="loading"
          @click="$emit('save')"
        />
      </div>
    </div>
  </v-card>
</template>

<script>

export default {
  props: {
    alias: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    profileImageUrl: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      displayName: this.alias,
      biography: this.bio
    };
  },

  watch: {
    alias(newAlias) {
      if (newAlias && newAlias !== this.displayName) {
        this.displayName = newAlias;
      }
    },
    bio(newBio) {
      if (newBio && newBio !== this.biography) {
        this.biography = newBio;
      }
    }
  },
  methods: {
    handleImageUpload(file) {
      this.$emit('upload-image', file);
    }
  }
}
</script> 
