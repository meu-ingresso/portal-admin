<template>
  <div class="social-media-links">
    <v-row>
      <!-- Website -->
      <v-col cols="12">
        <div class="text-subtitle-2 font-weight-medium mb-1">Website</div>
        <v-text-field
          v-model="website"
          outlined
          dense
          hide-details
          placeholder="https://"
          prepend-inner-icon="mdi-web"
          @input="handleInput('website')"
        ></v-text-field>
      </v-col>

      <!-- Social Media Section -->
      <v-col cols="12" class="mt-2">
        <div class="d-flex align-center mb-4">
          <div class="text-subtitle-2 font-weight-medium">Mídias sociais</div>
        </div>

        <v-row>
          <!-- Instagram -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="socialLinks.instagram"
              outlined
              dense
              hide-details
              class="mb-1"
              placeholder="Seu usuário"
              :prefix="socialPrefixes.instagram"
              prepend-inner-icon="mdi-instagram"
              @input="handleInput('instagram')"
            ></v-text-field>
          </v-col>

          <!-- TikTok -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="socialLinks.tiktok"
              outlined
              dense
              hide-details
              class="mb-1"
              placeholder="@seu.usuario"
              :prefix="socialPrefixes.tiktok"
              prepend-inner-icon="mdi-music-note"
              @input="handleInput('tiktok')"
            ></v-text-field>
          </v-col>

          <!-- YouTube -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="socialLinks.youtube"
              outlined
              dense
              hide-details
              class="mb-1"
              placeholder="Seu canal"
              :prefix="socialPrefixes.youtube"
              prepend-inner-icon="mdi-youtube"
              @input="handleInput('youtube')"
            ></v-text-field>
          </v-col>

          <!-- Facebook -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="socialLinks.facebook"
              outlined
              dense
              hide-details
              class="mb-1"
              placeholder="Sua página"
              :prefix="socialPrefixes.facebook"
              prepend-inner-icon="mdi-facebook"
              @input="handleInput('facebook')"
            ></v-text-field>
          </v-col>

          <!-- X (Twitter) -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="socialLinks.x"
              outlined
              dense
              hide-details
              class="mb-1"
              placeholder="@seu.usuario"
              :prefix="socialPrefixes.x"
              prepend-inner-icon="mdi-twitter"
              @input="handleInput('x')"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>

      <!-- Community Section -->
      <v-col cols="12" class="mt-2">
        <div class="d-flex align-center mb-4">
          <div class="text-subtitle-2 font-weight-medium">Comunidade</div>
        </div>
        <v-row>
          <!-- WhatsApp -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="socialLinks.whatsapp"
              outlined
              dense
              hide-details
              class="mb-1"
              placeholder="Seu grupo/contato"
              :prefix="socialPrefixes.whatsapp"
              prepend-inner-icon="mdi-whatsapp"
              @input="handleInput('whatsapp')"
            ></v-text-field>
          </v-col>

          <!-- Messenger -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="socialLinks.messenger"
              outlined
              dense
              hide-details
              class="mb-1"
              placeholder="Seu usuário"
              :prefix="socialPrefixes.messenger"
              prepend-inner-icon="mdi-facebook-messenger"
              @input="handleInput('messenger')"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      website: '',
      socialLinks: {
        instagram: '',
        tiktok: '',
        youtube: '',
        facebook: '',
        x: '',
        telegram: '',
        whatsapp: '',
        messenger: '',
        discord: '',
        soundcloud: '',
        spotify: ''
      },
      socialPrefixes: {
        instagram: 'instagram.com/',
        tiktok: 'tiktok.com/',
        youtube: 'youtube.com/',
        facebook: 'facebook.com/',
        x: 'x.com/',
        telegram: 't.me/',
        whatsapp: 'WhatsApp',
        messenger: 'm.me/',
        discord: 'discord.gg/',
        soundcloud: 'soundcloud.com/',
        spotify: 'open.spotify.com/user/'
      }
    }
  },

  watch: {
    value: {
      handler(newValue) {
        if (newValue) {
          this.website = newValue.website || ''
          Object.keys(this.socialLinks).forEach(key => {
            this.socialLinks[key] = newValue[key] || ''
          })
        }
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    handleInput(type) {
      const result = {
        ...this.socialLinks,
        website: this.website
      }
      this.$emit('input', result)
      this.$emit('change', { type, value: type === 'website' ? this.website : this.socialLinks[type] })
    }
  }
}
</script>

<style scoped>
.social-media-links {
  max-width: 100%;
}

.v-text-field ::v-deep .v-input__prepend-inner {
  padding-right: 8px;
}

.v-text-field ::v-deep .v-text-field__prefix {
  color: rgba(0, 0, 0, 0.6);
}
</style> 