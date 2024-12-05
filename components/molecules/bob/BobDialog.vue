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
          <v-col cols="8" md="10">
            BOB <span v-if="$bob && !$bob.is_active" class="red"> Excluído </span></v-col
          >

          <v-col cols="2" md="1" align="end">
            <!-- EDIT DO COMERCIAL -->
            <v-icon
              v-if="
                $bob &&
                !$bob.user_id &&
                isCommercialTab &&
                ($bob.seller_id === getUserId || getAdmin) &&
                $bob.is_active
              "
              v-icon
              class="close-button"
              mdi-pencil
              @click="changeEdit(isCommercialEditing ? false : true)">
              mdi-pencil
            </v-icon>

            <!-- EDIT DO PRICING -->
            <v-icon
              v-if="
                ((getPricer && isPricingTab) ||
                  (isPricingTab && $bob && $bob.user_id === getUserId)) &&
                $bob.is_active &&
                $bob.user_id
              "
              class="close-button"
              mdi-pencil
              @click="changeEdit(isPricerEditing ? false : true)">
              mdi-pencil
            </v-icon>
          </v-col>
          <v-col cols="1" md="1" align="end" class="text-center">
            <v-icon class="close-button" @click="close"> mdi-close </v-icon>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <div v-if="isLoading" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <v-row v-else class="pa-5">
          <v-tabs
            v-if="!isMobile"
            v-model="tab"
            touchless
            grow
            hide-slider
            class="pa-0 ma-0"
            @change="onTabChange">
            <v-tab v-for="item in tabs" :key="item" class="bg-tabs v-tab--no-gripple">
              {{ item }}
            </v-tab>
          </v-tabs>

          <v-select
            v-else
            v-model="tab"
            :items="tabs"
            persistent-hint
            hide-details="auto"
            class="pb-5"
            outlined
            solo
            @change="onTabChange" />

          <div v-if="isCommercialTab">
            <v-form
              v-if="isCommercialEditing"
              ref="form"
              v-model="valid"
              @submit.prevent="validate">
              <BobCommercialForm
                :is-editing="true"
                :is-modal="true"
                :class="isMobile ? '' : 'mt-3'" />
            </v-form>
            <BobCommercialInfo v-else />
          </div>

          <div v-if="isPricingTab">
            <v-form
              v-if="($bob && !$bob.user_id) || isPricerEditing"
              ref="form"
              v-model="valid"
              @submit.prevent="validate">
              <BobPricingForm
                :is-editing="true"
                :is-modal="true"
                :class="isMobile ? '' : 'mt-3'" />
            </v-form>
            <BobPricingInfo v-else />
          </div>
        </v-row>
      </v-card-text>

      <v-card-actions
        v-if="($bob && !$bob.user_id) || isPricerEditing || isCommercialEditing"
        :class="isMobile ? 'text-center' : ''">
        <v-spacer v-if="!isMobile" />
        <v-btn
          v-if="isPricingTab || isCommercialEditing"
          text
          class="btnDialog btnSuccess"
          :class="isMobile ? 'btnMobile' : ''"
          @click="validate">
          Salvar
        </v-btn>
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
import { bob, toast, shipowner } from '@/store';
import { updateBob, isMobileDevice, pricingUserList } from '@/utils/utils';

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
      valid: false,
      isLoading: false,
      isPricerEditing: false,
      isCommercialEditing: false,
      currentTab: 0,
      tab: 0,
      tabs: ['Comercial', 'Pricing'],
    };
  },

  computed: {
    $_dialog: {
      get(this: any): boolean {
        return this.dialog;
      },
      set(val): void {
        this.$emit('update-dialog', val);
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

    isPricingTab() {
      return this.isMobile ? this.tab === 'Pricing' : this.tabs[this.tab] === 'Pricing';
    },

    isCommercialTab() {
      return this.isMobile
        ? this.tab === 'Comercial'
        : this.tabs[this.tab] === 'Comercial';
    },

    getAdmin() {
      return this.$cookies.get('user_role') === 'Administrador';
    },

    getPricer() {
      const userPricer = pricingUserList().find((item) => item === this.getUserId);

      const userAdmin = this.getAdmin;

      return !!userPricer || !!userAdmin;
    },
  },

  async mounted() {
    this.$set(this, 'isLoading', true);
    await Promise.all([bob.get(this.bobId), shipowner.getAll()]);

    if (this.isMobile) {
      this.tab = this.tabs[0];
    } else {
      this.tab = 0;
    }

    this.$set(this, 'isLoading', false);
  },

  methods: {
    onTabChange(this: any): void {
      if (typeof this.tab === 'string') {
        const indexof = this.tabs.findIndex((item) => item === this.tab);
        this.currentTab = indexof;
      } else {
        this.currentTab = this.tab;
      }
    },

    validate(): void {
      this.$set(this, 'isLoading', true);
      this.$refs.form.validate();

      if (this.valid) {
        this.onUpdate();
      } else {
        toast.setToast({
          text: 'Existem campos obrigatórios',
          type: 'danger',
          time: 3000,
        });

        this.$set(this, 'isLoading', false);
      }
    },

    async onUpdate(): Promise<void> {
      const whoEdit = this.isCommercialEditing
        ? 'Comercial'
        : this.isPricerEditing
        ? 'Pricing'
        : '';

      await updateBob(this.getUserId, whoEdit);

      await bob.get(this.bobId);

      this.changeEdit(false);
      this.$set(this, 'isLoading', false);
    },

    close(): void {
      this.$emit('update-dialog', false);
    },

    changeEdit(status: boolean): void {
      if (this.isPricingTab && (this.getPricer || this.$bob.user_id === this.getUserId)) {
        this.$set(this, 'isPricerEditing', status);
      } else if (
        (this.isCommercialTab &&
          this.$bob &&
          this.$bob.seller_id &&
          this.$bob.seller_id === this.getUserId &&
          this.$bob.is_active) ||
        this.getAdmin
      ) {
        this.$set(this, 'isCommercialEditing', status);
      }
    },

    validationRequired(value: any): Boolean | String {
      if ((value && value.length === 0) || value === 0) {
        return 'Campo Obrigatório.';
      }
      return !!value || 'Campo Obrigatório.';
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

.bg-tabs {
  height: 48px !important;
  background-color: var(--light);
}

.v-tab--active,
.bg-tabs:hover {
  background-color: rgba(2, 63, 136, 0.2);
  border-bottom: 0px;
}

.theme--light.v-tabs > .v-tabs-bar {
  background-color: rgba(2, 63, 136, 0.2);
}

.v-tabs-slider-wrapper {
  height: 0px !important;
  width: 0px !important;
}

.v-tab:before {
  background-color: black;
}

.modal {
  height: 30vh !important;
}

.btnMobile {
  width: 200px;
}
</style>
