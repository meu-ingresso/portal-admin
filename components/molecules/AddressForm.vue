<template>
  <v-row>
    <v-col cols="12" md="8" sm="12">
      <v-text-field
        ref="location_name"
        v-model="formData.location_name"
        label="Local do Evento"
        outlined
        dense
        hide-details="auto"
        required
        placeholder="Digite o local do evento"
        :rules="rules?.location_name" />
    </v-col>

    <v-col cols="12" md="4" sm="12">
      <v-text-field
        ref="zipcode"
        v-model="formData.zipcode"
        label="CEP"
        outlined
        dense
        placeholder="Digite o CEP"
        required
        maxlength="9"
        hide-details="auto"
        :rules="rules?.cep"
        @input="onChangeCEP" />
    </v-col>

    <v-col cols="12">
      <v-card v-if="isFetchingAddress" outlined class="mt-3 mb-3">
        <v-card-text class="d-flex align-center justify-center">
          <v-progress-circular indeterminate color="primary" class="mr-2" />
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
          <div class="d-flex justify-space-between">
            <div>
              <p><strong>Rua:</strong> {{ formData.street }}</p>
              <p><strong>Bairro:</strong> {{ formData.neighborhood }}</p>
              <p><strong>Cidade:</strong> {{ formData.city }}</p>
              <p><strong>Estado:</strong> {{ formData.state }}</p>
            </div>
            <v-btn icon class="ml-2" @click="clearAddress">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col v-if="isAddressFilled" cols="12" md="6" sm="12">
      <v-text-field
        ref="number"
        v-model="formData.number"
        label="Número"
        type="number"
        outlined
        dense
        hide-details="auto"
        min="0"
        required
        placeholder="Digite o número"
        :rules="rules?.number" />
    </v-col>

    <v-col v-if="isAddressFilled" cols="12" md="6" sm="12">
      <v-text-field
        v-model="formData.complement"
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
import { cep, eventGeneralInfo } from '@/store';

export default {
  data() {
    return {
      isFetchingAddress: false,
      addressError: '',
      debouncerCEP: null,
      formHasErrors: false,
      rules: {
        type: Object,
        default: () => ({
          cep: [
            (v) => !!v || 'CEP é obrigatório',
            (v) => v.length === 9 || 'CEP inválido',
          ],
          location_name: [(v) => !!v || 'Local do evento é obrigatório'],
          number: [(v) => !!v || 'Número é obrigatório'],
        }),
      },
    };
  },

  computed: {
    isAddressFilled() {
      return (
        this.formData.street &&
        this.formData.neighborhood &&
        this.formData.city &&
        this.formData.state
      );
    },

    formData() {
      return eventGeneralInfo.$info.address;
    },

    form() {
      return {
        zipcode: this.formData.zipcode,
        location_name: this.formData.location_name,
        number: this.formData.number,
      };
    },
  },

  created() {
    this.debouncerCEP = new Debounce(this.fetchAddressByCEP, 300);
  },

  methods: {
    clearAddress() {
      eventGeneralInfo.updateGeneralInfoAddress({
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
        number: '',
        complement: '',
      });
    },

    validate() {
      this.formHasErrors = false;

      Object.keys(this.form).forEach((f) => {
        if (!this.form[f]) {
          this.formHasErrors = true;
        }

        if (this.$refs[f] && !this.$refs[f].validate(true)) {
          this.formHasErrors = true;
        }
      });

      return this.formHasErrors;
    },

    onChangeCEP() {
      this.formData.zipcode = onFormatCEP(this.formData.zipcode);
      this.debouncerCEP.execute();
    },
    async fetchAddressByCEP() {
      if (this.formData.zipcode.length === 9) {
        this.isFetchingAddress = true;
        this.addressError = '';
        try {
          const responseCEP = await cep.fetchCep(this.formData.zipcode);

          eventGeneralInfo.updateGeneralInfoAddress({
            street: responseCEP.street,
            neighborhood: responseCEP.neighborhood,
            city: responseCEP.city,
            state: responseCEP.state,
            state_name: responseCEP.state_name || responseCEP.state,
            latitude: responseCEP.latitude,
            longitude: responseCEP.longitude,
          });
        } catch (error) {
          console.error('Erro ao buscar endereço:', error);
          this.addressError = 'Endereço não encontrado. Verifique o CEP digitado.';
          this.clearAddress();
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
