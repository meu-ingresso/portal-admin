<template>
  <v-dialog v-model="$_dialog" fullscreen min-width="300" max-width="1000" class="modal">
    <v-card v-if="!isLoading">
      <v-card-title :class="isMobile ? 'text-title-mobile' : 'text-title'">
        <v-row>
          <v-col cols="2" md="1">
            <v-icon
              v-if="$customerData.IdCliente_Classificacao === 1"
              size="32"
              class="is-favorite"
              @click="emitOnChangeFav(customer)">
              mdi-star
            </v-icon>
            <v-icon v-else size="32" @click="emitOnChangeFav(customer)">
              mdi-star-outline
            </v-icon>
          </v-col>

          <v-col cols="8" md="10">
            {{
              $customerData.Nome_Fantasia
                ? $customerData.Nome_Fantasia
                : $customerData.Nome
            }}
          </v-col>

          <v-col cols="1" md="1" align="end" class="text-center">
            <v-icon class="close-button" @click="close"> mdi-close </v-icon>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

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
            class="pb-5 mt-3"
            outlined
            solo
            @change="onTabChange" />

          <v-col v-if="isDataTab" cols="12">
            <CustomerDataMobile v-if="isMobile" :customer="customer" />

            <CustomerDataDesktop v-else :customer="customer" />
          </v-col>

          <v-col v-else-if="isFollowUpTab" cols="12">
            <CustomerFollowUp :customer="customer" />
          </v-col>

          <v-col v-else-if="isContactsTab" cols="12">
            <CustomerContacts :customer="customer" />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- <v-card-actions :class="isMobile ? 'text-center' : ''">
        <v-spacer v-if="!isMobile" />
        <v-btn text class="btnDialog btnSuccess" :class="isMobile ? 'btnMobile' : ''">
          Salvar
        </v-btn>
      </v-card-actions> -->
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
import { headSoft, toast } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },

    customer: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      valid: false,
      isLoading: false,
      currentTab: 0,
      tab: 0,
      tabs: ['Dados Básicos', 'Contatos', 'Acompanhamentos'],
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

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    $customerData() {
      return headSoft.$customerData;
    },

    isDataTab() {
      return this.isMobile
        ? this.tab === 'Dados Básicos'
        : this.tabs[this.tab] === 'Dados Básicos';
    },

    isContactsTab() {
      return this.isMobile ? this.tab === 'Contatos' : this.tabs[this.tab] === 'Contatos';
    },

    isFollowUpTab() {
      return this.isMobile
        ? this.tab === 'Acompanhamentos'
        : this.tabs[this.tab] === 'Acompanhamentos';
    },
  },

  mounted() {
    this.$set(this, 'isLoading', true);

    if (this.isMobile) {
      this.tab = this.tabs[0];
    } else {
      this.tab = 0;
    }

    this.$set(this, 'isLoading', false);
  },

  methods: {
    emitOnChangeFav(item) {
      this.$emit('update-favorite', item);

      this.$customerData.IdCliente_Classificacao =
        this.$customerData.IdCliente_Classificacao === 1 ? 0 : 1;
    },

    onTabChange(this: any): void {
      if (typeof this.tab === 'string') {
        const indexof = this.tabs.findIndex((item) => item === this.tab);
        this.currentTab = indexof;
      } else {
        this.currentTab = this.tab;
      }
    },

    async close(): Promise<void> {
      this.$emit('update-dialog', false);

      await headSoft.resetCustomer();
    },
  },
});
</script>

<style scoped scss>
.is-favorite {
  color: #ffc107 !important;
}

.text-title {
  font-size: 18px !important;
}

.text-title-mobile {
  font-size: 15px !important;
}

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
  height: 50vh !important;
}

.btnMobile {
  width: 200px;
}
</style>
