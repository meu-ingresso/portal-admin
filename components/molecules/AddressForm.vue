<template>
  <v-row>
    <v-col cols="12" md="8" sm="12">
      <v-text-field
        v-model="localLocationName"
        label="Local do Evento"
        outlined
        dense
        hide-details="auto"
        placeholder="Digite o local do evento" />
    </v-col>

    <v-col cols="12" md="4" sm="12">
      <v-text-field
        v-model="localCep"
        label="CEP"
        outlined
        dense
        placeholder="Digite o CEP"
        required
        maxlength="9"
        hide-details="auto"
        @input="onChangeCEP" />
    </v-col>

    <v-col cols="12">
      <v-card v-if="isFetchingAddress" outlined class="mt-3 mb-3">
        <v-card-text>
          <v-progress-circular indeterminate color="primary" />
          <p>Buscando endereço...</p>
        </v-card-text>
      </v-card>

      <v-card v-else-if="addressError" outlined class="mt-3 mb-3">
        <v-card-text>
          <v-icon color="red">mdi-alert-circle</v-icon>
          <p>{{ addressError }}</p>
        </v-card-text>
      </v-card>

      <v-card v-else-if="isAddressFilled" outlined class="mt-3 mb-3">
        <v-card-text>
          <p><strong>Rua:</strong> {{ localAddress.street }}</p>
          <p><strong>Bairro:</strong> {{ localAddress.neighborhood }}</p>
          <p><strong>Cidade:</strong> {{ localAddress.city }}</p>
          <p><strong>Estado:</strong> {{ localAddress.state }}</p>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col v-if="isAddressFilled" cols="12" md="6" sm="12">
      <v-text-field
        v-model="localAddress.number"
        label="Número"
        type="number"
        outlined
        dense
        hide-details="auto"
        min="0"
        placeholder="Digite o número" />
    </v-col>

    <v-col v-if="isAddressFilled" cols="12" md="6" sm="12">
      <v-text-field
        v-model="localAddress.complement"
        label="Complemento"
        outlined
        dense
        hide-details="auto"
        placeholder="Digite o complemento" />
    </v-col>
  </v-row>
</template>

<script>
import Debounce from '@/utils/Debounce';
import { onFormatCEP } from '@/utils/formatters';
import { cep } from '@/store';
export default {
  props: {
    cep: {
      type: String,
      required: true,
    },
    locationName: {
      type: String,
      required: true,
    },
    address: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      localCep: this.cep,
      localLocationName: this.locationName,
      localAddress: { ...this.address },
      isFetchingAddress: false,
      addressError: '',
      debouncerCEP: null,
    };
  },

  computed: {
    isAddressFilled() {
      return (
        this.localAddress.street &&
        this.localAddress.neighborhood &&
        this.localAddress.city &&
        this.localAddress.state
      );
    },
  },

  watch: {
    cep(newVal) {
      this.localCep = newVal;
    },
    locationName(newVal) {
      this.localLocationName = newVal;
    },
    address: {
      handler(newVal) {
        this.localAddress = { ...newVal };
      },
      deep: true,
    },
    localLocationName(newVal) {
      this.$emit('update:locationName', newVal);
    },
    localAddress: {
      handler(newVal) {
        if (
          this.localAddress.street !== this.address.street ||
          this.localAddress.neighborhood !== this.address.neighborhood ||
          this.localAddress.city !== this.address.city ||
          this.localAddress.state !== this.address.state
        ) {
          this.$emit('update:address', newVal);
          this.$emit('update:cep', this.localCep);
        }
      },
      deep: true,
    },
  },
  created() {
    this.debouncerCEP = new Debounce(this.fetchAddressByCEP, 300);
  },
  methods: {
    onChangeCEP() {
      this.localCep = onFormatCEP(this.localCep);
      this.debouncerCEP.execute();
    },
    async fetchAddressByCEP() {
      if (this.localCep.length === 9) {
        this.isFetchingAddress = true;
        this.addressError = '';
        try {
          const responseCEP = await cep.fetchCep(this.localCep);

          this.localAddress = {
            street: responseCEP.street,
            neighborhood: responseCEP.neighborhood,
            city: responseCEP.city,
            state: responseCEP.state,
          };
        } catch (error) {
          console.error('Erro ao buscar endereço:', error);
          this.addressError = 'Endereço não encontrado. Verifique o CEP digitado.';
          this.localAddress = {
            street: '',
            neighborhood: '',
            city: '',
            state: '',
          };
        } finally {
          this.isFetchingAddress = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.mt-3 {
  margin-top: 16px;
}
</style>
