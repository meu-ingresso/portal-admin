<template>
  <v-row v-if="!isContent">
    <v-col cols="6" md="2">
      <span class="titleFollowInfos">Data</span>
    </v-col>
    <v-col cols="6" md="3">
      <span class="titleFollowInfos">Responsável</span>
    </v-col>
    <v-col cols="6" md="3">
      <span class="titleFollowInfos">Grupo/Tarefa</span>
    </v-col>
    <v-col cols="6" md="4">
      <span class="titleFollowInfos">Título</span>
    </v-col>
  </v-row>

  <v-row v-else>
    <v-col cols="12">
      <span class="titleFollowInfos">Descrição</span>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    isContent: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped>
.titleFollowInfos {
  font-size: 12px;
}
</style>
