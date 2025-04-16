<template>
  <div class="user-address-form">
    <v-form ref="form">
      <!-- Campo de busca de endereço (linha inteira) -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="googleSearchQuery"
            label="Buscar endereço"
            outlined
            dense
            hide-details="auto"
            placeholder="Digite seu endereço para buscar"
            :loading="isFetchingAddress"
            @input="onAddressInputChange"
            @focus="showAutocompleteResults = true"
          ></v-text-field>

          <!-- Resultados da busca do Google -->
          <v-list
            v-if="showAutocompleteResults && autocompleteResults.length > 0"
            dense
            class="autocomplete-results elevation-4 mb-4"
          >
            <v-list-item
              v-for="(result, index) in autocompleteResults"
              :key="index"
              @click="selectAutocompleteResult(result)"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ result.description }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>

        <template v-if="isAddressFilled">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="localZipcode"
              label="CEP*"
              outlined
              dense
              hide-details="auto"
              required
              placeholder="00000-000"
              maxlength="9"
              :disabled="isApiZipcode"
              :rules="rules.zipcode"
              @input="formatZipcode"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" sm="6">
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
              :rules="rules.number"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" sm="12">
            <v-text-field
              v-model="localComplement"
              label="Complemento"
              outlined
              dense
              hide-details="auto"
              placeholder="Digite o complemento"
            ></v-text-field>
          </v-col>
        </template>
      </v-row>

      <!-- Loading state -->
      <v-row v-if="isFetchingAddress">
        <v-col cols="12">
          <div class="d-flex align-center justify-center py-3">
            <v-progress-circular indeterminate color="primary" class="mr-2" size="20" width="2" />
            <p class="mb-0">Buscando endereço...</p>
          </div>
        </v-col>
      </v-row>

      <!-- Error state -->
      <v-row v-else-if="addressError">
        <v-col cols="12">
          <v-card outlined class="status-card error-card">
            <v-card-text class="py-3">
              <div class="d-flex align-center mb-2">
                <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
                <span>{{ addressError }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import { userAddress, user } from '@/store';
import { onFormatCEP } from '@/utils/formatters';

export default {
  data() {
    return {
      isFetchingAddress: false,
      addressError: '',
      localNumber: '',
      localComplement: '',
      localZipcode: '',
      isApiZipcode: false,
      isFormValid: false,
      googleSearchQuery: '',
      googleApiLoaded: false,
      googleAutocomplete: null,
      autocompleteResults: [],
      showAutocompleteResults: false,
      placesService: null,
      autocompleteDebounceTimeout: null,
      rules: {
        number: [(v) => !!v || 'Número é obrigatório'],
        zipcode: [
          (v) => !!v || 'CEP é obrigatório',
          (v) => /^\d{5}-\d{3}$/.test(v) || 'CEP inválido (ex: 00000-000)'
        ],
      },
    };
  },
  computed: {
    isLoading() {
      return userAddress.$isLoading;
    },

    currentAddress() {
      return userAddress.$address || {};
    },

    isAddressFilled() {
      const address = this.currentAddress;
      return (
        address.street &&
        address.neighborhood &&
        address.city &&
        address.state
      );
    },

    fullAddressText() {
      if (!this.isAddressFilled) return '';
      
      const address = this.currentAddress;
      const { street, neighborhood, city, state, zipcode } = address;
      const number = this.localNumber || address.number;
      const complement = this.localComplement || address.complement;
      
      let fullAddress = `${street}, ${neighborhood}, ${city} - ${state}`;
      
      if (number) {
        fullAddress = `${street}, ${number}${complement ? `, ${complement}` : ''}, ${neighborhood}, ${city} - ${state}, ${zipcode}`;
      }
      
      return fullAddress;
    },

    peopleId() {
      return user.$people?.id;
    }
  },
  watch: {
    peopleId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          userAddress.fetchUserAddress(newId);
        }
      }
    },
    currentAddress: {
      immediate: true,
      deep: true,
      handler(newAddress) {
        if (!newAddress) return;
        
        // Atualizar campos locais
        this.localNumber = newAddress.number || '';
        this.localComplement = newAddress.complement || '';
        this.localZipcode = newAddress.zipcode || '';
        this.isApiZipcode = newAddress.isApiZipcode || false;
        
        // Atualizar a query de busca do Google
        if (newAddress.street && newAddress.neighborhood && newAddress.city) {
          this.googleSearchQuery = `${newAddress.street}, ${newAddress.neighborhood}, ${newAddress.city}`;
        }
      }
    },
    localNumber: {
      handler(newValue) {
        if (newValue !== undefined && newValue !== this.currentAddress.number && newValue !== '') {
          userAddress.updateAddress({ number: newValue });
        }
      },
    },
    localComplement: {
      handler(newValue) {
        if (newValue !== undefined && newValue !== this.currentAddress.complement && newValue !== '') {
          userAddress.updateAddress({ complement: newValue });
        }
      },
    },
    localZipcode: {
      handler(newValue) {
        if (!newValue && this.isApiZipcode) {
          this.isApiZipcode = false;
          userAddress.updateAddress({ zipcode: '', isApiZipcode: false });
        } else if (newValue !== undefined && newValue !== this.currentAddress.zipcode && newValue !== '') {
          userAddress.updateAddress({ zipcode: newValue });
        }
      },
    },
  },
  created() {
    this.loadGoogleMapsApi();
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    validate() {
      return this.$refs.form ? this.$refs.form.validate() : true;
    },
    
    resetValidation() {
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    formatZipcode(value) {
      this.localZipcode = onFormatCEP(value);
      
      // Quando o usuário edita o CEP manualmente, atualizamos o estado no store
      if (this.localZipcode !== this.currentAddress.zipcode) {
        userAddress.updateAddress({ 
          zipcode: this.localZipcode,
          isApiZipcode: false // Marcamos como não vindo da API, pois o usuário editou manualmente
        });
      }
    },

    loadGoogleMapsApi() {
      if (window.google && window.google.maps) {
        this.googleApiLoaded = true;
        this.initGoogleAutocomplete();
        return;
      }

      const script = document.createElement('script');
      const apiKey = 'AIzaSyAtFS9cuqhd4j5sihXFlfRgLMAgll8TOfk'; 
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.googleApiLoaded = true;
        this.initGoogleAutocomplete();
      };
      document.head.appendChild(script);
    },

    initGoogleAutocomplete() {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        return;
      }

      this.googleAutocomplete = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
    },

    onAddressInputChange(value) {
      if (!value || value.trim().length < 3) {
        this.autocompleteResults = [];
        this.showAutocompleteResults = false;
        return;
      }

      // Limpar timeout existente
      if (this.autocompleteDebounceTimeout) {
        clearTimeout(this.autocompleteDebounceTimeout);
      }

      // Configurar novo timeout (debounce)
      this.autocompleteDebounceTimeout = setTimeout(() => {
        this.fetchAddressSuggestions(value);
      }, 300);
    },

    fetchAddressSuggestions(query) {
      if (!this.googleApiLoaded || !this.googleAutocomplete) return;

      this.googleAutocomplete.getPlacePredictions(
        { input: query, componentRestrictions: { country: 'br' } },
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            this.autocompleteResults = [];
            this.showAutocompleteResults = false;
            return;
          }

          this.autocompleteResults = predictions;
          this.showAutocompleteResults = true;
        }
      );
    },

    async selectAutocompleteResult(result) {
      this.isFetchingAddress = true;
      this.addressError = '';
      this.googleSearchQuery = result.description;
      this.showAutocompleteResults = false;

      try {
        if (!this.placesService) {
          const mapDiv = document.createElement('div');
          this.placesService = new google.maps.places.PlacesService(mapDiv);
        }

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

        // Reset do zipcode e status da API
        this.localZipcode = '';
        this.isApiZipcode = false;

        const position = placeDetails.geometry.location;
        const addressComponents = this.parseGoogleAddressComponents(placeDetails.address_components);
        
        // Preservar o número apenas se vier do Google, caso contrário manter o que o usuário digitou
        const number = addressComponents.number || this.localNumber;
        
        // Marcar o CEP como vindo da API se for retornado
        if (addressComponents.zipcode) {
          this.isApiZipcode = true;
          this.localZipcode = addressComponents.zipcode;
        }
        
        // Atualizar dados do endereço
        userAddress.updateAddress({
          street: addressComponents.street || '',
          neighborhood: addressComponents.neighborhood || '',
          city: addressComponents.city || '',
          state: addressComponents.state || '',
          zipcode: addressComponents.zipcode || '',
          latitude: position.lat(),
          longitude: position.lng(),
          number, // Usar o número do Google se disponível
          complement: this.localComplement, // Sempre manter o complemento inserido pelo usuário
          isApiZipcode: !!addressComponents.zipcode, // Novo campo para controlar se o CEP veio da API
        });
        
        // Atualizar o número local se vier do Google
        if (addressComponents.number) {
          this.localNumber = addressComponents.number;
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do endereço:', error);
        this.addressError = 'Não foi possível obter detalhes do endereço selecionado.';
      } finally {
        this.isFetchingAddress = false;
      }
    },

    handleClickOutside(event) {
      // Verificar se o clique foi fora da área de autocompletar
      const autocompleteArea = document.querySelector('.autocomplete-results');
      const searchInput = document.querySelector('input[label="Buscar endereço"]');

      // Se clicou fora do campo de busca e fora da lista de resultados, fechar a lista
      if (
        autocompleteArea &&
        searchInput &&
        !autocompleteArea.contains(event.target) &&
        !searchInput.contains(event.target)
      ) {
        this.showAutocompleteResults = false;
      }
    },

    parseGoogleAddressComponents(components) {
      if (!components || !Array.isArray(components)) return {};

      const result = {
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        state_name: '',
        zipcode: '',
        number: '',
      };

      components.forEach((component) => {
        const types = component.types;

        if (types.includes('street_number')) {
          result.number = component.long_name;
        } else if (types.includes('route')) {
          result.street = component.long_name;
        } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
          result.neighborhood = component.long_name;
        } else if (types.includes('administrative_area_level_2')) {
          result.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          result.state = component.short_name;
          result.state_name = component.long_name;
        } else if (types.includes('postal_code')) {
          result.zipcode = component.long_name;
        }
      });

      return result;
    },
  },
};
</script>

<style scoped>
.autocomplete-results {
  position: absolute;
  z-index: 10;
  width: calc(100% - 24px);
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
}

.google-map {
  width: 100%;
  height: 180px;
  border-radius: 4px;
}

.map-container-clean {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-actions-clean {
  position: absolute;
  bottom: 4px;
  right: 4px;
  top: 4px;
  z-index: 1;
}

.empty-address-placeholder {
  background-color: #f5f5f5;
  border-radius: 4px;
  height: 180px;
  width: 100%;
}

.status-card {
  width: 100%;
  height: 200px;
}

.error-card {
  background-color: #ffebee;
}

.autocomplete-results .v-list-item-title {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}

.map-container-clean,
.map-actions-clean,
.google-map,
.map-wrapper {
  display: none;
}

.empty-address-placeholder {
  display: none;
}

.status-card {
  width: 100%;
}

.error-card {
  background-color: #ffebee;
}

.autocomplete-results .v-list-item-title {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}
</style> 