<template>
  <div>
    <!-- Endereço do Evento -->
    <v-card flat class="mb-8">
      <v-card-title class="d-flex justify-space-between align-center">
        <p class="subtitle-1 mb-0">4. Endereço do Evento</p>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
          <v-row>
            <!-- Lado esquerdo: Campos de entrada -->
            <v-col cols="12" md="6" sm="12" order="1" order-md="1">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="subtitle-1">Buscar endereço por:</div>
                <v-btn-toggle
                  v-model="searchMethod"
                  mandatory
                  dense
                  color="primary"
                  class="elevation-0">
                  <v-btn :value="'cep'" small>
                    <v-icon left small>mdi-numeric</v-icon>
                    CEP
                  </v-btn>
                  <v-btn :value="'google'" small>
                    <v-icon left small>mdi-map-search</v-icon>
                    Google Maps
                  </v-btn>
                </v-btn-toggle>
              </div>

              <!-- Busca por CEP -->
              <template v-if="searchMethod === 'cep'">
                <v-text-field
                  ref="zipcode"
                  v-model="localZipcode"
                  label="CEP*"
                  outlined
                  dense
                  placeholder="Digite o CEP"
                  required
                  maxlength="9"
                  hide-details="auto"
                  :rules="rules?.zipcode"
                  :loading="isFetchingAddress"
                  :disabled="isFetchingAddress"
                  :append-icon="isFetchingAddress ? '' : ''"
                  class="mb-4"
                  @input="onChangeCEP" />
              </template>

              <!-- Busca pelo Google Maps -->
              <template v-else>
                <v-text-field
                  v-model="googleSearchQuery"
                  label="Endereço completo*"
                  outlined
                  dense
                  hide-details="auto"
                  :loading="isFetchingAddress"
                  :disabled="isFetchingAddress"
                  append-icon="mdi-magnify"
                  placeholder="Ex: Rua Exemplo, 123, Cidade - UF"
                  class="mb-4"
                  @keyup.enter="searchGoogleAddress"
                  @click:append="searchGoogleAddress" />
              </template>

              <v-text-field
                ref="location_name"
                v-model="localLocationName"
                label="Local do Evento*"
                outlined
                dense
                hide-details="auto"
                required
                placeholder="Digite o local do evento"
                :rules="rules?.location_name"
                class="mb-4" />

              <template v-if="isAddressFilled">
 
                <v-text-field
                  ref="number"
                  v-model="localNumber"
                  label="Número*"
                  type="number"
                  outlined
                  dense
                  hide-details="auto"
                  min="0"
                  required
                  placeholder="Digite o número"
                  :rules="rules?.number"
                  class="mb-4"
                  />

                <v-text-field
                  v-model="localComplement"
                  label="Complemento"
                  outlined
                  dense
                  hide-details="auto"
                  placeholder="Digite o complemento" 
                  class="mb-4"
                  />
               
              </template>
            </v-col>

            <!-- Lado direito: Exibição do endereço encontrado -->
            <v-col cols="12" md="6" sm="12" order="2" order-md="2" class="d-flex">
              <!-- Loading state -->
              <div v-if="isFetchingAddress" class="d-flex align-center justify-center py-3 flex-grow-1">
                <v-progress-circular indeterminate color="primary" class="mr-2" size="20" width="2" />
                <p class="mb-0">Buscando endereço...</p>
              </div>
            
              <!-- Error state -->
              <v-card v-else-if="addressError" outlined class="status-card error-card flex-grow-1">
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

              <!-- Address info state - Compact layout -->
              <v-card v-else-if="isAddressFilled" outlined class="address-display-card flex-grow-1">
                <v-card-text class="px-4 py-3">
                  <div class="d-flex justify-space-between align-center">
                    <h3 class="subtitle-1 mb-0 primary--text">Localização</h3>
                    <div class="address-actions">
                      <v-btn icon small class="mr-1" color="primary" @click="openAddressModal">
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon small color="grey" @click="clearAddress">
                        <v-icon small>mdi-close</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <v-divider class="my-3"></v-divider>
                  
                  <!-- Endereço completo em uma única linha -->
                  <div class="address-single-line d-flex align-start">
                    <v-icon color="primary" class="mr-2 mt-1">mdi-map-marker</v-icon>
                    <div class="address-content">
                      <p class="body-2 font-weight-medium mb-0" :title="fullAddressText">
                        {{ formData.street }}{{ formData.number ? `, ${formData.number}` : '' }}{{ formData.complement ? `, ${formData.complement}` : '' }}
                      </p>
                      <p class="body-2 mb-0" :title="fullAddressText">
                        {{ formData.neighborhood }}, {{ formData.city }} - {{ formData.state }}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Mapa do Google -->
                  <div v-if="showMap" class="map-container mt-3">
                    <div id="google-map" class="google-map"></div>
                    <div class="map-actions">
                      <v-btn 
                        x-small 
                        outlined 
                        color="primary" 
                        class="mt-2"
                        :href="googleMapsUrl" 
                        target="_blank">
                        <v-icon left small>mdi-open-in-new</v-icon>
                        Ver no Google Maps
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              
              <!-- Estado vazio (sem endereço) -->
              <div v-else class="empty-address-placeholder d-flex flex-column justify-center align-center flex-grow-1">
                <v-icon color="grey lighten-1" size="48">mdi-map-marker-outline</v-icon>
                <p class="caption text-center grey--text mt-2">
                  {{ searchMethod === 'cep' ? 'Digite o CEP para buscar o endereço' : 'Digite o endereço completo para buscar' }}
                </p>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

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
      googleSearchQuery: '',
      showMap: false,
      googleMap: null,
      googleMapMarker: null,
      googleApiLoaded: false,
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
      searchMethod: 'cep',
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

    fullAddressText() {
      if (!this.isAddressFilled) return '';
      
      const { street, neighborhood, city, state, number, complement } = this.formData;
      let fullAddress = `${street}, ${neighborhood}, ${city} - ${state}`;
      
      if (number) {
        fullAddress = `${street}, ${number}${complement ? `, ${complement}` : ''}, ${neighborhood}, ${city} - ${state}`;
      }
      
      return fullAddress;
    },

    googleMapsUrl() {
      if (!this.isAddressFilled) return '';
      
      const { latitude, longitude } = this.formData;
      if (!latitude || !longitude) return '';
      
      return `https://www.google.com/maps?q=${latitude},${longitude}`;
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
    isAddressFilled: {
      immediate: true,
      handler(filled) {
        if (filled && this.googleApiLoaded) {
          this.$nextTick(() => {
            this.initGoogleMap();
          });
        }
      }
    },
    formData: {
      deep: true,
      handler(newData) {
        if (this.isAddressFilled && this.googleApiLoaded && newData.latitude && newData.longitude) {
          this.$nextTick(() => {
            this.updateGoogleMap();
          });
        }
      }
    }
  },

  created() {
    this.debouncerCEP = new Debounce(this.fetchAddressByCEP, 300);
    this.loadGoogleMapsApi();
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
      this.googleSearchQuery = '';
      this.showMap = false;
      
      if (this.googleMap) {
        this.googleMap = null;
      }
      
      if (this.googleMapMarker) {
        this.googleMapMarker = null;
      }
      
      eventGeneralInfo.updateGeneralInfoAddress({
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
        number: '',
        complement: '',
        location_name: '',
        latitude: null,
        longitude: null,
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
    loadGoogleMapsApi() {
      // Na implementação real, você precisará obter uma API key do Google
      if (window.google && window.google.maps) {
        this.googleApiLoaded = true;
        if (this.isAddressFilled) {
          this.$nextTick(() => {
            this.initGoogleMap();
          });
        }
        return;
      }

      // Carrega a API do Google Maps dinamicamente
      // Na implementação real, substitua YOUR_API_KEY pela sua chave de API do Google
      const apiKey = 'YOUR_API_KEY'; 
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.googleApiLoaded = true;
        if (this.isAddressFilled) {
          this.$nextTick(() => {
            this.initGoogleMap();
          });
        }
      };
      
      document.head.appendChild(script);
    },
    
    initGoogleMap() {
      if (!this.googleApiLoaded || !this.isAddressFilled) return;
      
      this.showMap = true;
      
      // Aguardar o DOM ser atualizado para ter o elemento do mapa disponível
      this.$nextTick(() => {
        const mapElement = document.getElementById('google-map');
        if (!mapElement) return;
        
        const { latitude, longitude } = this.formData;
        const position = { lat: latitude || -23.5505, lng: longitude || -46.6333 }; // Default: São Paulo
        
        // Criar o mapa
        this.googleMap = new google.maps.Map(mapElement, {
          center: position,
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        
        // Adicionar marcador
        this.googleMapMarker = new google.maps.Marker({
          position,
          map: this.googleMap,
          title: this.fullAddressText,
          animation: google.maps.Animation.DROP,
        });
      });
    },
    
    updateGoogleMap() {
      if (!this.googleApiLoaded || !this.isAddressFilled) return;
      
      const { latitude, longitude } = this.formData;
      if (!latitude || !longitude) return;
      
      const position = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
      
      if (this.googleMap && this.googleMapMarker) {
        // Atualizar posição existente
        this.googleMap.setCenter(position);
        this.googleMapMarker.setPosition(position);
      } else {
        // Inicializar mapa se ainda não existir
        this.initGoogleMap();
      }
    },

    async searchGoogleAddress() {
      if (!this.googleSearchQuery || !this.googleApiLoaded) return;
      
      this.isFetchingAddress = true;
      this.addressError = '';
      
      try {
        // Usar Geocoding API para converter endereço em coordenadas
        const geocoder = new google.maps.Geocoder();
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: this.googleSearchQuery }, (results, status) => {
            if (status === "OK" && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Endereço não encontrado'));
            }
          });
        });
        
        const position = result.geometry.location;
        const addressComponents = this.parseGoogleAddressComponents(result.address_components);
        
        // Atualizar dados do endereço
        eventGeneralInfo.updateGeneralInfoAddress({
          street: addressComponents.street || '',
          neighborhood: addressComponents.neighborhood || '',
          city: addressComponents.city || '',
          state: addressComponents.state || '',
          state_name: addressComponents.state_name || addressComponents.state || '',
          latitude: position.lat(),
          longitude: position.lng(),
          zipcode: addressComponents.zipcode || this.localZipcode,
          location_name: this.localLocationName || addressComponents.name,
          number: addressComponents.number || this.localNumber,
          complement: this.localComplement,
        });
        
        // Se o local não foi preenchido, usar o nome formatado do resultado
        if (!this.localLocationName) {
          this.localLocationName = result.formatted_address.split(',')[0];
        }
        
        this.googleSearchQuery = '';
        this.showMap = true;
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        this.addressError = 'Endereço não encontrado. Tente ser mais específico.';
      } finally {
        this.isFetchingAddress = false;
      }
    },
    
    parseGoogleAddressComponents(addressComponents) {
      const result = {
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        state_name: '',
        zipcode: '',
        number: '',
      };
      
      if (!addressComponents || !addressComponents.length) return result;
      
      addressComponents.forEach(component => {
        const types = component.types;
        
        if (types.includes('route')) {
          result.street = component.long_name;
        } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
          result.neighborhood = component.long_name;
        } else if (types.includes('administrative_area_level_2')) {
          result.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          result.state = component.short_name;
          result.state_name = component.long_name;
        } else if (types.includes('postal_code')) {
          result.zipcode = component.long_name.replace(/\D/g, '');
          result.zipcode = result.zipcode.length === 8 ? 
            `${result.zipcode.substring(0, 5)}-${result.zipcode.substring(5)}` : 
            result.zipcode;
        } else if (types.includes('street_number')) {
          result.number = component.long_name;
        }
      });
      
      return result;
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

.address-display-card, .google-search-card {
  height: 100%;
  border-radius: 4px;
  box-shadow: none !important;
  border: 1px solid #e0e0e0;
  background-color: #fafafa;
  transition: box-shadow 0.2s ease;
}

.address-display-card:hover, .google-search-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.address-single-line {
  padding: 8px 0;
}

.address-content {
  overflow: hidden;
  max-width: 100%;
}

.address-content p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.address-actions {
  display: flex;
  align-items: center;
}

.empty-address-placeholder {
  height: 100%;
  min-height: 140px;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
  transition: all 0.2s ease;
  padding: 16px;
}

.empty-address-placeholder:hover {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.05);
}

.map-container {
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.map-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 8px 8px;
  background-color: #fafafa;
}

.google-map {
  height: 200px;
  width: 100%;
}

.modalTitle {
  font-size: 1.25rem;
  font-weight: 500;
}
</style>
