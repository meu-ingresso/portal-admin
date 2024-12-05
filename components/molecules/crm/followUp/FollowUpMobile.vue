<template>
  <div>
    <v-row>
      <v-col cols="6">
        <span class="titleFollowInfos">Data</span>
      </v-col>
      <v-col cols="6">
        <span class="titleFollowInfos">Responsável</span>
      </v-col>
    </v-row>
    <v-row class="labelInfos">
      <v-col cols="6">
        <span class="followInfos">{{ element.Data_Formatada }}</span>
      </v-col>
      <v-col cols="6">
        <span class="followInfos">{{ element.Responsavel_Acm }}</span>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <span class="titleFollowInfos">Grupo/Tarefa</span>
      </v-col>
      <v-col cols="6">
        <span class="titleFollowInfos">Título</span>
      </v-col>
    </v-row>
    <v-row class="labelInfos">
      <v-col cols="6">
        <span class="followInfos">{{ element.Grupo_Tarefa }}</span>
      </v-col>
      <v-col cols="6">
        <span class="followInfos">{{ element.Titulo ? element.Titulo : '-' }}</span>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <span class="titleFollowInfos">Descrição</span>
      </v-col>
    </v-row>
    <v-row class="labelInfos">
      <v-col cols="12">
        <span class="followInfos" @click="toggleDescription">
          {{ isExpanded ? element.Descricao : truncatedDescription }}
        </span>

        <v-icon
          v-if="isDescriptionLong"
          size="25"
          color="primary"
          @click="toggleDescription">
          {{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>

        <v-icon size="25" class="ml-3" color="primary" @click="updateDialog(true)">
          mdi-auto-fix
        </v-icon>
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
import { headSoft } from '~/store';

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
    truncatedDescription() {
      return this.element.Descricao.length > 150
        ? this.element.Descricao.substr(0, 150) + '...'
        : this.element.Descricao;
    },
    isDescriptionLong() {
      return this.element.Descricao.length > 150;
    },

    $customerData() {
      return headSoft.$customerData;
    },
  },

  methods: {
    updateDialog(status) {
      this.$set(this, 'improveDialog', status);
    },

    toggleDescription() {
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>

<style scoped>
.labelInfos {
  margin-top: -25px;
}
.followInfos {
  font-size: 12px;
  color: var(--black);
  display: inline;
  z-index: 9999;
}

.titleFollowInfos {
  font-size: 11px;
}
</style>
