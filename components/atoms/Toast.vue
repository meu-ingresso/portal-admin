<template>
  <div class="text-center">
    <v-snackbar
      v-model="getToast.show"
      :color="getToast.toastType"
      :timeout="-1"
      :bottom="!isMobile"
      :right="!isMobile"
      :centered="isMobile || $route.fullPath === '/'">
      <v-row :class="`toast-${getToast.toastType} toast`">
        <v-col cols="12" :class="`toast-${getToast.toastType} toast-title`">
          <strong>Notificação</strong>

          <v-spacer />

          <v-icon class="close-toast" @click="closeToast()"> mdi-close </v-icon>
        </v-col>

        <v-divider />
        <div class="toast-body">
          {{ getToast.toastText }}
        </div>

        <div v-if="getToast.toastText2" class="toast-body">
          {{ getToast.toastText2 }}
        </div>
      </v-row>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { toast } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  computed: {
    getToast: () => toast.$single,

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    closeToast() {
      toast.closeToast();
    },
  },
});
</script>
