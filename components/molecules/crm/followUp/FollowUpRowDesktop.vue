<template>
  <div>
    <v-row v-if="isContent" class="labelInfos">
      <v-col cols="12">
        <span class="followInfos">
          <span
            v-if="isExpanded"
            class="preformatted-description"
            v-html="formattedDescription">
          </span>

          <span v-else>{{ truncatedDescription }}</span>

          <!-- Ícones imediatamente após o texto -->
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon
                v-if="isDescriptionLong"
                size="25"
                color="primary"
                v-bind="attrs"
                class="cursor-pointer ml-1 align-middle"
                v-on="on"
                @click="toggleDescription">
                {{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </template>
            <span>{{ isExpanded ? 'Retrair' : 'Expandir' }}</span>
          </v-tooltip>

          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon
                color="primary"
                size="25"
                v-bind="attrs"
                class="cursor-pointer ml-1 align-middle"
                v-on="on"
                @click="updateDialog(true)">
                mdi-auto-fix
              </v-icon>
            </template>
            <span>Melhorar com IAccess</span>
          </v-tooltip>
        </span>
      </v-col>
    </v-row>

    <v-row v-else class="labelInfos">
      <v-col cols="6" md="2">
        <span class="followInfos">{{ element.Data_Formatada }}</span>
      </v-col>
      <v-col cols="6" md="3">
        <span class="followInfos">{{ element.Responsavel_Acm }}</span>
      </v-col>
      <v-col cols="6" md="3">
        <span class="followInfos">{{ element.Grupo_Tarefa }}</span>
      </v-col>
      <v-col cols="6" md="4">
        <span class="followInfos">{{ element.Titulo ? element.Titulo : '-' }}</span>
      </v-col>
    </v-row>

    <ImproveDescription
      v-if="improveDialog"
      :dialog="improveDialog"
      :follow-up="element"
      @update-ia-dialog="updateDialog" />
  </div>
</template>

<script>
import { headSoft } from '@/store';

export default {
  props: {
    element: {
      type: Object,
      default: () => ({}),
      required: true,
    },

    isContent: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isExpanded: false,
      improveDialog: false,
    };
  },

  computed: {
    formattedDescription() {
      return this.element.Descricao.trim()
        .replace(/\n\s*\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
    },

    truncatedDescription() {
      return this.element.Descricao.length > 250
        ? this.element.Descricao.substr(0, this.$isXLarge ? 400 : 250) + '...'
        : this.element.Descricao;
    },

    isDescriptionLong() {
      return this.element.Descricao.length > 250;
    },

    $isXLarge() {
      return this.$vuetify.breakpoint.xl;
    },

    $customerData() {
      return headSoft.$customerData;
    },
  },

  methods: {
    toggleDescription() {
      this.isExpanded = !this.isExpanded;
    },

    updateDialog(status) {
      this.$set(this, 'improveDialog', status);
    },
  },
};
</script>

<style scoped>
.labelInfos {
  margin-top: -25px;
}
.followInfos {
  font-size: 13px;
  color: var(--black);
  display: inline;
}
.preformatted-description {
  white-space: normal;
  display: inline;
  font-family: 'Roboto', sans-serif;
}
.align-middle {
  vertical-align: middle;
}
</style>
