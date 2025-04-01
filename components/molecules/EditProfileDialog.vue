<template>
  <v-dialog
    v-model="show"
    max-width="500"
    :fullscreen="isMobile"
    persistent
  >
    <v-card :tile="isMobile" class="full-height">
      <v-card-title class="d-flex justify-space-between align-center mb-2">
        <span class="modalTitle">Editar Perfil</span>
        <v-btn icon @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4 custom-card-content">
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <div class="text-center my-4">
                <v-avatar size="120" class="profile-image">
                  <v-img :src="profileImage || '/default_avatar.svg'"></v-img>
                </v-avatar>
                <div class="mt-2">
                  <v-btn color="primary" text @click="$emit('change-photo')">
                    <v-icon left>mdi-camera</v-icon>
                    Alterar foto
                  </v-btn>
                </div>
              </div>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-text-field
                v-model="form.alias"
                label="Nome de exibição"
                outlined
                hide-details
                dense
              ></v-text-field>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-textarea
                v-model="form.bio"
                label="Biografia"
                outlined
                auto-grow
                rows="3"
                counter
                maxlength="200"
              ></v-textarea>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="py-4 px-4 d-flex align-center justify-space-between">
        <DefaultButton 
          text="Cancelar" 
          outlined 
          @click="handleClose" 
        />
        <DefaultButton 
          text="Salvar" 
          :loading="loading"
          @click="handleSave" 
        />
      </v-card-actions>

      <v-overlay v-if="loading" absolute>
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-card>
  </v-dialog>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    profileImage: {
      type: String,
      default: ''
    },
    initialAlias: {
      type: String,
      default: ''
    },
    initialBio: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      form: {
        alias: '',
        bio: ''
      }
    }
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },

  watch: {
    value(newVal) {
      if (newVal) {
        this.initForm()
      }
    }
  },

  methods: {
    initForm() {
      this.form = {
        alias: this.initialAlias,
        bio: this.initialBio
      }
    },

    handleSave() {
      this.$emit('save', this.form)
    },

    handleClose() {
      this.$emit('input', false)
    }
  }
}
</script>

<style scoped>
.profile-image {
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.modalTitle {
  color: var(--black-text);
  font-size: 20px;
  font-weight: 600;
  font-family: var(--font-family);
}

.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.custom-card-content {
  flex-grow: 1;
  overflow-y: auto;
}

.custom-card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.full-width-mobile {
  width: 100%;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
}
</style> 