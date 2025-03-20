<template>
  <div class="text-center">
    <v-snackbar
      v-model="getToast.show"
      :timeout="-1"
      :bottom="!isMobile"
      :right="!isMobile"
      :centered="isMobile"
      content-class="pa-0">
      <div class="toast-card" :class="`toast-${getToast.toastType}`">
        <div class="toast-icon-container">
          <v-icon class="toast-icon">{{ getIconByType }}</v-icon>
        </div>
        
        <div class="toast-message-container">
          <p class="toast-message-text">{{ getToastTitle }}</p>
          <p class="toast-sub-text">{{ getToast.toastText }}</p>
          <p v-if="getToast.toastText2" class="toast-sub-text">{{ getToast.toastText2 }}</p>
        </div>
        
        <v-icon class="toast-close-icon" @click="closeToast()">mdi-close</v-icon>
      </div>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { toast } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  name: 'AppToast',
  
  computed: {
    getToast: () => toast.$single,

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getIconByType(): string {
      const iconMap: Record<string, string> = {
        success: 'mdi-check-circle-outline',
        error: 'mdi-close-circle-outline',
        warning: 'mdi-alert-outline',
        info: 'mdi-information-outline',
        default: 'mdi-bell-outline'
      };
      
      return iconMap[this.getToast.toastType] || iconMap.default;
    },

    getToastTitle(): string {
      const titleMap: Record<string, string> = {
        success: 'Sucesso',
        error: 'Erro',
        warning: 'Atenção',
        info: 'Informação',
        default: 'Notificação'
      };
      
      return titleMap[this.getToast.toastType] || titleMap.default;
    }
  },

  methods: {
    closeToast() {
      toast.closeToast();
    },
  },
});
</script>

<style lang="scss" scoped>
.toast-card {
  min-height: 80px;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 10px 15px 10px 15px;
  background-color: #ffffff;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
}

.toast-wave {
  position: absolute;
  transform: rotate(90deg);
  left: -31px;
  top: 32px;
  width: 80px;
  z-index: 0;
}

.toast-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  z-index: 1;
}

.toast-icon {
  font-size: 17px;
}

.toast-message-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex-grow: 1;
  z-index: 1;
}

.toast-message-text,
.toast-sub-text {
  margin: 0;
  line-height: 1.2;
}

.toast-message-text {
  font-size: 17px;
  font-weight: 700;
}

.toast-sub-text {
  font-size: 14px;
  color: #555;
  margin-top: 5px;
}

.toast-close-icon {
  width: 18px;
  height: 18px;
  color: #555;
  cursor: pointer;
  z-index: 1;
  position: absolute;
  right: 12px;
  top: 12px;
}

// Estilos específicos para cada tipo de toast
.toast-success {
  .toast-wave {
    fill: #04e4003a;
  }
  
  .toast-icon-container {
    background-color: #04e40048;
  }
  
  .toast-icon, 
  .toast-message-text {
    color: #269b24;
  }
}

.toast-error {
  .toast-wave {
    fill: #fc0c0c3a;
  }
  
  .toast-icon-container {
    background-color: #fc0c0c48;
  }
  
  .toast-icon, 
  .toast-message-text {
    color: #d10d0d;
  }
}

.toast-warning {
  .toast-wave {
    fill: #ffa5003a;
  }
  
  .toast-icon-container {
    background-color: #ffa50048;
  }
  
  .toast-icon, 
  .toast-message-text {
    color: #f57c00;
  }
}

.toast-info {
  .toast-wave {
    fill: #2196f33a;
  }
  
  .toast-icon-container {
    background-color: #2196f348;
  }
  
  .toast-icon, 
  .toast-message-text {
    color: #0288d1;
  }
}

// Estilo padrão para outros tipos
.toast-default {
  .toast-wave {
    fill: #9e9e9e3a;
  }
  
  .toast-icon-container {
    background-color: #9e9e9e48;
  }
  
  .toast-icon, 
  .toast-message-text {
    color: #757575;
  }
}
</style>
