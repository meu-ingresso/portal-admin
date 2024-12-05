<template>
  <v-dialog
    v-model="$_dialog"
    min-width="200"
    max-width="800"
    class="modal"
    :fullscreen="isMobile">
    <v-card v-if="!isLoading">
      <v-card-title class="text-h5">
        <v-row>
          <v-col cols="9" md="11">
            Você tem certeza de que deseja excluir este item?</v-col
          >
          <v-col cols="3" md="1" class="text-center">
            <v-icon class="close-button" @click="close"> mdi-close </v-icon>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-actions class="mt-5">
        <v-spacer></v-spacer>
        <v-btn
          text
          class="btnDialog btnBack"
          :class="isMobile ? 'btnMobile' : ''"
          @click="close">
          Cancelar
        </v-btn>

        <v-btn
          text
          class="btnDialog btnSuccess"
          :class="isMobile ? 'btnMobile' : ''"
          @click="deleteItemConfirm">
          Sim
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>

    <v-card v-else height="100">
      <v-row class="text-center">
        <v-col cols="12">
          <Loading class="mt-5" />
        </v-col>
      </v-row>
    </v-card>

    <Toast />
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { bob } from '@/store';
import { updateBob, isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },

    bobId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      isLoading: false,
    };
  },

  computed: {
    $_dialog: {
      get(this: any): boolean {
        return this.dialog;
      },
      set(val): void {
        this.$emit('update-dialog-delete', val);
      },
    },

    $bob(): any {
      return bob.$bob;
    },

    getUserId() {
      return this.$cookies.get('user_id');
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  async mounted() {
    this.$set(this, 'isLoading', true);
    await bob.get(this.bobId);

    this.$set(this, 'isLoading', false);
  },

  methods: {
    deleteItemConfirm(this: any): void {
      this.$set(this, 'isLoading', true);

      this.onUpdate();
    },

    async onUpdate(): Promise<void> {
      bob.$bob.is_active = false;

      await updateBob(this.getUserId, '');

      this.$set(this, 'isLoading', false);

      this.close();
    },

    close(): void {
      this.$emit('update-dialog-delete', false);
    },
  },
});
</script>

<style scoped scss>
::v-deep .v-sheet.v-card {
  border-radius: 0 !important;
}

::v-deep.v-card__title {
  background-color: var(--primary) !important;
  color: white !important;
}

.close-button {
  color: white !important;
}

.modal {
  height: 30vh !important;
}
</style>
