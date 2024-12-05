<template>
  <div>
    <div class="text-center">
      <Title text="Access Global Logistics" class="mt-4"> </Title>
    </div>
    <br />
    <br />

    <v-row>
      <span class="ml-5">
        Olá! <span class="cl-blue bold"> Seja bem-vindo(a), {{ getUsername }}! </span>
      </span>
    </v-row>
    <v-row class="mt-7">
      <span class="ml-5">
        Qualquer dificuldade que encontre ou tiver uma dúvida/sugestão, basta entrar em
        contato com o time de desenvolvimento através do e-mail:
        <a href="mailto:desenvolvimento@accesslogistics.com.br" class="cl-blue bold">
          desenvolvimento@accesslogistics.com.br</a
        >.
      </span>
    </v-row>
    <v-row>
      <span class="ml-5">
        Contamos com sua <span class="cl-blue bold"> cooperação </span> para
        aprimorararmos as funcionalidades e
        <span class="cl-blue bold"> entregar mais para você</span>. Vamos juntos alcançar
        o melhor resultado, de forma <span class="cl-blue bold"> ágil </span> e
        <span class="cl-blue bold">assertiva</span>.
      </span>
    </v-row>

    <v-row class="mt-7">
      <Lottie path="./animations/infos.json" height="300" width="300" />
    </v-row>

    <v-row> </v-row>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {};
  },

  computed: {
    getUsername() {
      return this.$cookies.get('username');
    },
  },

  async mounted() {},
});
</script>
