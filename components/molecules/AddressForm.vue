<template>
  <v-form ref="form" v-model="isFormValid">
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
          v-model="localZipcode"
          label="CEP"
          outlined
          dense
          placeholder="Digite o CEP"
          required
          maxlength="9"
          hide-details="auto"
          :rules="rules?.zipcode"
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
            <div class="d-flex align-center mb-2">
              <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
              <span>{{ addressError }}</span>
            </div>

            <ButtonWithIcon
              text="Preencher endereço manualmente"
              icon="mdi-pencil"
              direction="left"
              outlined
              is-text
              @click="openAddressModal" />
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
              <div class="d-flex">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      icon
                      class="mr-2"
                      v-bind="attrs"
                      v-on="on"
                      @click="openAddressModal">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Editar endereço</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" @click="clearAddress">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                  <span>Excluir endereço</span>
                </v-tooltip>
              </div>
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

    <!-- Modal de Edição de Endereço -->
    <v-dialog v-model="showAddressModal" max-width="600px">
      <v-card>
        <v-card-title class="headline mb-2">
          {{ isAddressFilled ? 'Editar Endereço' : 'Preencher Endereço' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="editAddressForm" v-model="isAddressFormValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editAddress.street"
                  label="Rua"
                  outlined
                  dense
                  required
                  hide-details="auto"
                  :rules="rules?.street" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editAddress.neighborhood"
                  label="Bairro"
                  outlined
                  dense
                  required
                  hide-details="auto"
                  :rules="rules?.neighborhood" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editAddress.city"
                  label="Cidade"
                  outlined
                  dense
                  required
                  hide-details="auto"
                  :rules="rules?.city" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editAddress.state"
                  label="Estado"
                  outlined
                  dense
                  required
                  hide-details="auto"
                  :rules="rules?.state" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <DefaultButton outlined text="Cancelar" @click="closeAddressModal" />
          <DefaultButton text="Salvar" @click="saveAddress" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
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
      localZipcode: '',
      isFormValid: false,
      showAddressModal: false,
      isAddressFormValid: false,
      editAddress: {
        street: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      rules: {
        zipcode: [
          (v) => !!v || 'CEP é obrigatório',
          (v) => v.length === 9 || 'CEP inválido',
        ],
        location_name: [(v) => !!v || 'Local do evento é obrigatório'],
        number: [(v) => !!v || 'Número é obrigatório'],
        street: [(v) => !!v || 'Rua é obrigatória'],
        neighborhood: [(v) => !!v || 'Bairro é obrigatório'],
        city: [(v) => !!v || 'Cidade é obrigatória'],
        state: [(v) => !!v || 'Estado é obrigatório'],
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
      return {
        ...eventGeneralInfo.$info.address,
        zipcode: onFormatCEP(eventGeneralInfo.$info.address.zipcode),
      };
    },

    form() {
      return {
        zipcode: eventGeneralInfo.$info.address.zipcode,
        location_name: eventGeneralInfo.$info.address.location_name,
        number: eventGeneralInfo.$info.address.number,
      };
    },
  },

  watch: {
    'form.zipcode': {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.localZipcode = onFormatCEP(newValue);
        }
      },
    },
  },

  created() {
    this.debouncerCEP = new Debounce(this.fetchAddressByCEP, 300);
  },

  methods: {
    openAddressModal() {
      this.editAddress = {
        street: this.formData.street || '',
        neighborhood: this.formData.neighborhood || '',
        city: this.formData.city || '',
        state: this.formData.state || '',
      };
      this.showAddressModal = true;
    },

    closeAddressModal() {
      this.showAddressModal = false;
      this.editAddress = {
        street: '',
        neighborhood: '',
        city: '',
        state: '',
      };
    },

    saveAddress() {
      if (this.$refs.editAddressForm.validate()) {
        eventGeneralInfo.updateGeneralInfoAddress({
          ...eventGeneralInfo.$info.address,
          ...this.editAddress,
        });
        this.closeAddressModal();
      }
    },

    clearAddress() {
      this.localZipcode = '';
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

    validateForm() {
      return this.$refs.form.validate();
    },

    validate() {
      this.validateForm();
      return !this.isFormValid;
    },

    onChangeCEP() {
      this.localZipcode = onFormatCEP(this.localZipcode);
      this.debouncerCEP.execute();
    },
    async fetchAddressByCEP() {
      if (this.localZipcode.length === 9) {
        this.isFetchingAddress = true;
        this.addressError = '';
        try {
          const responseCEP = await cep.fetchCep(this.localZipcode);

          // Verifica se o retorno está vazio (todos os campos null)
          const isEmptyResponse =
            !responseCEP.street &&
            !responseCEP.neighborhood &&
            !responseCEP.city &&
            !responseCEP.state;

          if (isEmptyResponse) {
            this.addressError = 'Endereço não encontrado para o CEP informado.';
            return;
          }

          eventGeneralInfo.updateGeneralInfoAddress({
            street: responseCEP.street,
            neighborhood: responseCEP.neighborhood,
            city: responseCEP.city,
            state: responseCEP.state,
            state_name: responseCEP.state_name || responseCEP.state,
            latitude: responseCEP.latitude,
            longitude: responseCEP.longitude,
            zipcode: this.localZipcode,
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
