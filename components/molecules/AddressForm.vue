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
              <div class="autocomplete-container mb-4">
                <v-text-field
                  ref="googleAutocomplete"
                  v-model="googleSearchQuery"
                  label="Endereço completo*"
                  outlined
                  dense
                  hide-details="auto"
                  :loading="isFetchingAddress"
                  :disabled="isFetchingAddress"
                  append-icon="mdi-close-circle"
                  append-inner-icon="mdi-magnify"
                  placeholder="Comece a digitar o endereço..."
                  @focus="showAutocompleteResults = true"
                  @input="onGoogleSearchInput"
                  @click:append="clearAddress" />
                  
                <!-- Lista de sugestões do autocomplete -->
                <div v-if="showAutocompleteResults && autocompleteResults.length > 0" class="autocomplete-results">
                  <v-list dense>
                    <v-list-item
                      v-for="(result, index) in autocompleteResults"
                      :key="index"
                      @click="selectAutocompleteResult(result)">
                      <v-list-item-icon class="mr-2">
                        <v-icon small>mdi-map-marker</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>{{ result.description }}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </div>
              </div>

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
                </v-card-text>
              </v-card>

              <!-- Address info state - Compact layout -->
              <div v-else-if="isAddressFilled" class="map-wrapper flex-grow-1">
                <!-- Mapa do Google -->
                <div class="map-container-clean">
                  <div id="google-map" class="google-map"></div>
                  <div class="map-actions-clean">
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
              </div>
              
              <!-- Estado vazio (sem endereço) -->
              <div v-else class="empty-address-placeholder d-flex flex-column justify-center align-center flex-grow-1">
                <v-icon color="grey lighten-1" size="48">mdi-map-marker-outline</v-icon>
                <p class="caption text-center grey--text mt-2">
                  Comece a digitar o endereço para buscar
                </p>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { eventGeneralInfo } from '@/store';

export default {
  data() {
    return {
      isFetchingAddress: false,
      addressError: '',
      localLocationName: eventGeneralInfo.$info.address.location_name,
      localNumber: eventGeneralInfo.$info.address.number,
      localComplement: eventGeneralInfo.$info.address.complement,
      isFormValid: false,
      googleSearchQuery: '',
      showMap: false,
      googleMap: null,
      googleMapMarker: null,
      googleApiLoaded: false,
      googleAutocomplete: null,
      autocompleteResults: [],
      showAutocompleteResults: false,
      placesService: null,
      autocompleteDebounceTimeout: null,
      rules: {
        location_name: [(v) => !!v || 'Local do evento é obrigatório'],
        number: [(v) => !!v || 'Número é obrigatório'],
        street: [(v) => !!v || 'Rua é obrigatória'],
        neighborhood: [(v) => !!v || 'Bairro é obrigatório'],
        city: [(v) => !!v || 'Cidade é obrigatória'],
        state: [(v) => !!v || 'Estado é obrigatório'],
        googleSearch: [
          (_v) => {
            if (!this.isAddressFilled) {
              return 'É necessário buscar um endereço válido usando o campo de busca';
            }
            return true;
          }
        ],
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
        ...eventGeneralInfo.$info.address
      };
    },

    form() {
      return {
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

    // Verifica se o evento é presencial ou híbrido (precisa de endereço)
    needsAddress() {
      const eventType = eventGeneralInfo.$info.event_type;
      return ['Presencial', 'Híbrido'].includes(eventType);
    },
  },

  watch: {
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
    this.loadGoogleMapsApi();
  },

  mounted() {
    // Adicionamos um click handler ao documento para fechar as sugestões quando o usuário clicar fora
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    clearAddress() {
      this.localLocationName = '';
      this.localNumber = '';
      this.localComplement = '';
      this.googleSearchQuery = '';
      this.showMap = false;
      this.autocompleteResults = [];
      this.showAutocompleteResults = false;
      
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
      // Validar o formulário base do Vuetify
      const isVuetifyFormValid = this.$refs.form.validate();
      
      // Se o evento é online, não precisa de endereço completo
      if (!this.needsAddress) {
        this.isFormValid = isVuetifyFormValid;
        return isVuetifyFormValid;
      }
      
      // Para eventos presenciais/híbridos, verificar se o endereço está completo
      const isAddressComplete = this.isAddressFilled && 
        this.localLocationName && 
        this.localNumber;
      
      // Se o endereço não estiver completo, marcar como inválido
      if (!isAddressComplete) {
        this.isFormValid = false;
        return false;
      }
      
      // Retornar o resultado da validação do Vuetify
      this.isFormValid = isVuetifyFormValid;
      return isVuetifyFormValid;
    },

    validate() {
      const isValid = this.validateForm();
      
      // Se o evento não precisa de endereço (Online), sempre validar como válido
      if (!this.needsAddress) {
        return {
          hasErrors: false,
          message: null
        };
      }
      
      // Para eventos presenciais/híbridos, validar se endereço está completo
      if (!this.isAddressFilled) {
        return {
          hasErrors: true,
          message: 'É necessário buscar e selecionar um endereço válido para eventos presenciais ou híbridos.'
        };
      }
      
      // Se local do evento não estiver preenchido
      if (!this.localLocationName) {
        return {
          hasErrors: true,
          message: 'O local do evento é obrigatório.'
        };
      }
      
      // Se número não estiver preenchido
      if (!this.localNumber) {
        return {
          hasErrors: true,
          message: 'O número do endereço é obrigatório.'
        };
      }
      
      return {
        hasErrors: !isValid,
        message: !isValid ? 'Verifique os campos obrigatórios do endereço.' : null
      };
    },

    // Novo método para verificar se pode avançar para próximo step
    canProceed() {
      const validation = this.validate();
      return !validation.hasErrors;
    },

    // Método para obter mensagem de erro específica
    getValidationMessage() {
      const validation = this.validate();
      return validation.message;
    },

    handleClickOutside(event) {
      const autocompleteContainer = this.$el.querySelector('.autocomplete-container');
      if (autocompleteContainer && !autocompleteContainer.contains(event.target)) {
        this.showAutocompleteResults = false;
      }
    },

    onGoogleSearchInput() {
      // Debounce para não fazer muitas requisições enquanto o usuário digita
      if (this.autocompleteDebounceTimeout) {
        clearTimeout(this.autocompleteDebounceTimeout);
      }
      
      this.autocompleteDebounceTimeout = setTimeout(() => {
        this.fetchAutocompletePredictions();
      }, 300);
    },

    async fetchAutocompletePredictions() {
      if (!this.googleSearchQuery || !this.googleApiLoaded || this.googleSearchQuery.length < 3) {
        this.autocompleteResults = [];
        this.showAutocompleteResults = false;
        return;
      }

      const autocompleteService = new google.maps.places.AutocompleteService();
      const request = {
        input: this.googleSearchQuery,
        componentRestrictions: { country: 'br' },
        types: ['address']
      };

      try {
        const predictions = await new Promise((resolve, reject) => {
          autocompleteService.getPlacePredictions(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              reject(new Error('Não foi possível obter sugestões'));
            }
          });
        });

        this.autocompleteResults = predictions;
        this.showAutocompleteResults = predictions.length > 0;
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        this.autocompleteResults = [];
        this.showAutocompleteResults = false;
      }
    },

    async selectAutocompleteResult(result) {
      this.isFetchingAddress = true;
      this.addressError = '';
      this.googleSearchQuery = result.description;
      this.showAutocompleteResults = false;

      try {
        // Criar um serviço de Places se ainda não existir
        if (!this.placesService) {
          // Precisamos de um elemento DOM para o PlacesService
          const mapDiv = document.createElement('div');
          this.placesService = new google.maps.places.PlacesService(mapDiv);
        }

        // Obter detalhes do local selecionado
        const placeDetails = await new Promise((resolve, reject) => {
          this.placesService.getDetails(
            { placeId: result.place_id, fields: ['address_components', 'geometry', 'formatted_address'] },
            (place, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                resolve(place);
              } else {
                reject(new Error('Não foi possível obter detalhes do endereço'));
              }
            }
          );
        });

        const position = placeDetails.geometry.location;
        const addressComponents = this.parseGoogleAddressComponents(placeDetails.address_components);
        
        // Preservar o número apenas se vier do Google, caso contrário manter o que o usuário digitou
        const number = addressComponents.number || this.localNumber;
        
        // Atualizar dados do endereço (sem sobrescrever localLocationName, que deve ser definido pelo usuário)
        eventGeneralInfo.updateGeneralInfoAddress({
          street: addressComponents.street || '',
          neighborhood: addressComponents.neighborhood || '',
          city: addressComponents.city || '',
          state: addressComponents.state || '',
          state_name: addressComponents.state_name || addressComponents.state || '',
          latitude: position.lat(),
          longitude: position.lng(),
          zipcode: addressComponents.zipcode || '',
          location_name: this.localLocationName, // Manter o valor inserido pelo usuário
          number, // Usar o número do Google se disponível
          complement: this.localComplement, // Sempre manter o complemento inserido pelo usuário
        });
        
        // Atualizar o número local se vier do Google
        if (addressComponents.number) {
          this.localNumber = addressComponents.number;
        }
        
        // Forçar a atualização do mapa
        this.showMap = false;
        this.$nextTick(() => {
          this.showMap = true;
          this.initGoogleMap();
          
          // Atualizar estado de validação do formulário
          this.$nextTick(() => {
            this.validateForm();
          });
        });
      } catch (error) {
        console.error('Erro ao buscar detalhes do endereço:', error);
        this.addressError = 'Não foi possível obter detalhes do endereço selecionado.';
      } finally {
        this.isFetchingAddress = false;
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
      const apiKey = 'AIzaSyAtFS9cuqhd4j5sihXFlfRgLMAgll8TOfk'; 
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

.map-wrapper {
  display: flex;
  flex-direction: column;
}

.map-container-clean {
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.map-actions-clean {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  background-color: white;
}

.google-map {
  height: 250px;
  width: 100%;
}

.modalTitle {
  font-size: 1.25rem;
  font-weight: 500;
}

/* Estilos para o autocomplete */
.autocomplete-container {
  position: relative;
}

.autocomplete-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.autocomplete-results .v-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.autocomplete-results .v-list-item:hover {
  background-color: rgba(33, 150, 243, 0.05);
}

.autocomplete-results .v-list-item-title {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}
</style>
