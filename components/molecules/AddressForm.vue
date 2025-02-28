<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="d-flex justify-space-between align-center">
            <p class="subtitle-1 mb-0">Endereço do Evento</p>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="isFormValid">
              <v-row>
                <v-col cols="12" md="8" sm="12">
                  <v-text-field
                    ref="location_name"
                    v-model="localLocationName"
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
                  <!-- Loading state -->
                  <v-card v-if="isFetchingAddress" outlined class="status-card">
                    <v-card-text class="d-flex align-center justify-center py-3">
                      <v-progress-circular indeterminate color="primary" class="mr-2" size="20" width="2" />
                      <p class="mb-0">Buscando endereço...</p>
                    </v-card-text>
                  </v-card>

                  <!-- Error state -->
                  <v-card v-else-if="addressError" outlined class="status-card error-card">
                    <v-card-text class="py-3">
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

                  <!-- Address info state -->
                  <div v-else-if="isAddressFilled" class="mt-3 mb-3">
                    <div class="d-flex justify-space-between address-info">
                      <div class="address-details pa-3">
                        <div class="d-flex flex-wrap">
                          <div class="address-item pr-6">
                            <p class="caption grey--text">Rua</p>
                            <p class="body-1">{{ formData.street }}</p>
                          </div>
                          <div class="address-item pr-6">
                            <p class="caption grey--text">Bairro</p>
                            <p class="body-1">{{ formData.neighborhood }}</p>
                          </div>
                          <div class="address-item pr-6">
                            <p class="caption grey--text">Cidade</p>
                            <p class="body-1">{{ formData.city }}</p>
                          </div>
                          <div class="address-item">
                            <p class="caption grey--text">Estado</p>
                            <p class="body-1">{{ formData.state }}</p>
                          </div>
                        </div>
                      </div>
                      <div class="address-actions pa-3">
                        <v-btn icon small class="mr-1" color="primary" @click="openAddressModal">
                          <v-icon small>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon small color="grey" @click="clearAddress">
                          <v-icon small>mdi-close</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </v-col>

                <v-col v-if="isAddressFilled" cols="12" md="6" sm="12">
                  <v-text-field
                    ref="number"
                    v-model="localNumber"
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
                    v-model="localComplement"
                    label="Complemento"
                    outlined
                    dense
                    hide-details="auto"
                    placeholder="Digite o complemento" />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de Edição de Endereço -->
    <v-dialog v-model="showAddressModal" max-width="600px">
      <v-card>
        <v-card-title class="mb-2 d-flex justify-space-between align-center">
          <h3 class="modalTitle">{{ isAddressFilled ? 'Editar Endereço' : 'Preencher Endereço' }}</h3>
          <v-btn icon @click="closeAddressModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
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

        <v-card-actions class="d-flex justify-space-between">
          <DefaultButton outlined text="Cancelar" @click="closeAddressModal" />
          <DefaultButton text="Salvar" @click="saveAddress" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
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
      localZipcode: eventGeneralInfo.$info.address.zipcode,
      localLocationName: eventGeneralInfo.$info.address.location_name,
      localNumber: eventGeneralInfo.$info.address.number,
      localComplement: eventGeneralInfo.$info.address.complement,
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
    localLocationName: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          eventGeneralInfo.$info.address.location_name = newValue;
        }
      },
    },
    localNumber: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          eventGeneralInfo.$info.address.number = newValue;
        }
      },
    },
    localComplement: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          eventGeneralInfo.$info.address.complement = newValue;
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
      this.localLocationName = '';
      this.localNumber = '';
      this.localComplement = '';
      eventGeneralInfo.updateGeneralInfoAddress({
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
        number: '',
        complement: '',
        location_name: '',
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
            location_name: this.localLocationName,
            number: this.localNumber,
            complement: this.localComplement,
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
.status-card {
  border-radius: 4px;
  box-shadow: none !important;
  border: 1px solid #e0e0e0;
}

.error-card {
  border-left: 4px solid #FFC107;
}

.address-info {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
}

.address-details {
  flex-grow: 1;
}

.address-item {
  margin-bottom: 8px;
  min-width: 140px;
}

.address-item p {
  margin-bottom: 0;
}

.address-actions {
  display: flex;
  align-items: flex-start;
}

.modalTitle {
  font-size: 1.25rem;
  font-weight: 500;
}
</style>
