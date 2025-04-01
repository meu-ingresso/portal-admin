<template>
  <div class="share-sidebar-wrapper">
    <div 
      v-if="show" 
      class="sidebar-overlay"
      @click="close"
    ></div>

    <v-navigation-drawer
      :value="show"
      fixed
      right
      width="600"
      class="share-sidebar"
      :class="{'mobile-sidebar': isMobile}"
      @input="$emit('update:show', $event)">
      
      <v-card flat class="full-height" :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center mb-2">
          <h3 class="modalTitle">Compartilhar minha página</h3>
          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4 sidebar-content">
          <!-- Info Message -->
          <v-row no-gutters class="mb-8">
            <v-col cols="12" class="d-flex align-center">
              <v-icon class="mr-2">mdi-information</v-icon>
              <span class="text-body-2">
                Tenha mais seguidores ao compartilhar a sua página de produtor com todo mundo.
              </span>
            </v-col>
          </v-row>

          <!-- Copy Link Button -->
          <v-row no-gutters class="mb-4">
            <v-col cols="12">
              <ButtonWithIcon
                text="Copiar link"
                outlined
                direction="left"
                block
                icon="mdi-content-copy"
                @click="copyLink"
              />
            </v-col>
          </v-row>

          <!-- QR Code Section -->
          <v-row no-gutters>
            <v-col cols="12">
              <ButtonWithIcon
                text="Fazer download do QR Code da minha página"
                icon="mdi-qrcode"
                direction="left"
                block
                outlined
                @click="downloadQRCode"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
  </div>
</template>

<script>
import QRCode from 'qrcode';
import { isMobileDevice } from '@/utils/utils';
import { toast } from '@/store';

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    profileUrl: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      isGeneratingQR: false
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    }
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.profileUrl);
        toast.setToast({
          text: 'Link copiado para a área de transferência',
          type: 'success',
          time: 3000
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.setToast({
          text: 'Erro ao copiar link',
          type: 'error',
          time: 3000
        });
      }
    },

    async downloadQRCode() {
      try {
        this.isGeneratingQR = true;
        
        const qrDataUrl = await QRCode.toDataURL(this.profileUrl, {
          width: 512,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        const link = document.createElement('a');
        link.download = 'minha-pagina-qrcode.png';
        link.href = qrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.setToast({
          text: 'QR Code baixado com sucesso',
          type: 'success',
          time: 3000
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast.setToast({
          text: 'Erro ao gerar QR Code',
          type: 'error',
          time: 3000
        });
      } finally {
        this.isGeneratingQR = false;
      }
    }
  }
};
</script>

<style scoped>
.share-sidebar-wrapper {
  position: relative;
}

.share-sidebar-wrapper .v-card {
  background-color: #fff !important;
}

.share-sidebar {
  z-index: 1001;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
}

.mobile-sidebar {
  width: 100% !important;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  pointer-events: auto;
}

.share-btn {
  text-transform: none;
  font-weight: normal;
  font-size: 1rem;
  justify-content: flex-start;
  padding: 0 16px;
}

.share-btn .v-icon {
  margin-right: 12px;
}
</style> 