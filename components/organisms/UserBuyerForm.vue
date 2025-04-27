<template>
  <div class="py-6 px-4">
    <!-- Visualização dos dados -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h3 class="text-h6 mb-0 primary--text font-weight-bold">Dados de compra</h3>
      <v-btn icon class="ml-2" @click="showEditDialog = true">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </div>

    <v-card flat tile>
      <v-card-text class="px-0 py-0">
        <v-row>
          <v-col cols="12" md="6" sm="12">
            <div>
              <div class="text-caption grey--text">CPF/CNPJ</div>
              <div class="text-subtitle-1">{{ formatDocument(people?.tax) }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6" sm="12">
            <div>
              <div class="text-caption grey--text">Telefone</div>
              <div class="text-subtitle-1">{{ formatPhone(people?.phone) }}</div>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6" sm="12">
            <div>
              <div class="text-caption grey--text">Data de Nascimento</div>
              <div class="text-subtitle-1">{{ formatBirthDate(people?.birth_date) || '-' }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6" sm="12">
            <div>
              <div class="text-caption grey--text">CEP</div>
              <div class="text-subtitle-1">{{ formatCEP(currentAddress?.zipcode) }}</div>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <div>
              <div class="text-caption grey--text">Endereço</div>
              <div class="text-subtitle-1">{{ formatAddress }}</div>
            </div>
          </v-col>
        </v-row>

        <v-row v-if="currentAddress?.complement">
          <v-col cols="12">
            <div>
              <div class="text-caption grey--text">Complemento</div>
              <div class="text-subtitle-1">{{ currentAddress.complement }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Modal de edição -->
    <v-dialog v-model="showEditDialog" max-width="800" :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="headline">
          Editar dados de compra
          <v-spacer></v-spacer>
          <v-btn icon @click="showEditDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isValid" class="py-6">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.cpf"
                  label="CPF/CNPJ"
                  :rules="documentRules"
                  outlined
                  dense
                  :mask="documentMask"
                  disabled
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.phone"
                  label="Telefone"
                  :rules="phoneRules"
                  outlined
                  dense
                  mask="(##) #####-####"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.birthDate"
                  label="Data de Nascimento"
                  type="date"
                  outlined
                  dense
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.zipcode"
                  label="CEP"
                  :rules="zipcodeRules"
                  outlined
                  dense
                  mask="#####-###"
                  @input="fetchAddressFromZipcode"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="formData.address.street"
                  label="Endereço"
                  :rules="addressRules"
                  outlined
                  dense
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.address.number"
                  label="Número"
                  :rules="addressNumberRules"
                  outlined
                  dense
                  type="number"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="formData.address.complement"
                  label="Complemento"
                  outlined
                  dense
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.address.neighborhood"
                  label="Bairro"
                  :rules="addressRules"
                  outlined
                  dense
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.address.city"
                  label="Cidade"
                  :rules="addressRules"
                  outlined
                  dense
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="formData.address.state"
                  label="Estado"
                  :rules="addressRules"
                  outlined
                  dense
                  maxlength="2"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pb-6 px-6 d-flex align-center justify-space-between">
          <DefaultButton
            text="Cancelar"
            outlined
            @click="showEditDialog = false"
          />
          <DefaultButton
            text="Salvar"
            :loading="isLoading"
            :disabled="!isValid"
            @click="saveProfile"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { user, userAddress, toast } from '@/store';
import { $axios } from '@/utils/nuxt-instance';
import { onFormatCNPJ, onFormatCPF, onFormatCEP, onFormatCellphone, formatDateToBr } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';
export default {
  data() {
    return {
      showEditDialog: false,
      isValid: true,
      isLoading: false,
      formData: {
        cpf: '',
        phone: '',
        birthDate: '',
        zipcode: '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: ''
        }
      },
      documentRules: [
        v => !!v || 'Documento obrigatório'
      ],
      phoneRules: [
        v => !!v || 'Telefone obrigatório',
        v => (v && v.length >= 14) || 'Telefone inválido'
      ],
      zipcodeRules: [
        v => !!v || 'CEP obrigatório',
        v => (v && v.length === 9) || 'CEP inválido'
      ],
      addressRules: [
        v => !!v || 'Campo obrigatório'
      ],
      addressNumberRules: [
        v => !!v || 'Número obrigatório'
      ]
    };
  },

  computed: {

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    documentMask() {
      return this.formData.cpf && this.formData.cpf.length > 14 ? '##.###.###/####-##' : '###.###.###-##';
    },
    
    people() {
      return user.$user?.people || {};
    },
    
    currentAddress() {
      return userAddress.$address || {};
    },

    formatAddress() {
      if (!this.currentAddress) return '-';
      
      const parts = [
        this.currentAddress.street,
        this.currentAddress.number,
        this.currentAddress.neighborhood,
        `${this.currentAddress.city}-${this.currentAddress.state}`
      ].filter(Boolean);
      
      return parts.join(', ');
    },
  },
  
  watch: {
    showEditDialog(val) {
      if (val) {
        this.initializeFormData();
      }
    }
  },

  created() {
    this.loadUserData();
  },

  methods: {

    formatBirthDate(date) {
      if (!date) return '-';
      return formatDateToBr(date);
    },

    loadUserData() {
      if (user.$user?.people?.id) {
        userAddress.fetchUserAddress(user.$user.people.id);
      }
    },

    initializeFormData() {
      this.formData = {
        cpf: this.people.tax || '',
        phone: this.people.phone || '',
        birthDate: this.people.birth_date || '',
        zipcode: this.currentAddress?.zipcode || '',
        address: {
          street: this.currentAddress?.street || '',
          number: this.currentAddress?.number || '',
          complement: this.currentAddress?.complement || '',
          neighborhood: this.currentAddress?.neighborhood || '',
          city: this.currentAddress?.city || '',
          state: this.currentAddress?.state || ''
        }
      };
    },

    formatDocument(doc) {
      if (!doc) return '-';
      return doc.length > 11 ? onFormatCNPJ(doc) : onFormatCPF(doc);
    },

    formatPhone(phone) {
      if (!phone) return '-';
      return onFormatCellphone(phone);
    },

    formatCEP(cep) {
      if (!cep) return '-';
      return onFormatCEP(cep);
    },

    async fetchAddressFromZipcode() {
      if (this.formData.zipcode && this.formData.zipcode.length === 9) {
        try {
          const cleanZipcode = this.formData.zipcode.replace('-', '');
          const response = await $axios.$get(`https://viacep.com.br/ws/${cleanZipcode}/json/`);
          
          if (!response.erro) {
            this.formData.address.street = response.logradouro;
            this.formData.address.neighborhood = response.bairro;
            this.formData.address.city = response.localidade;
            this.formData.address.state = response.uf;
          }
        } catch (error) {
          console.error('Erro ao buscar CEP:', error);
        }
      }
    },

    async saveProfile() {
      try {
        this.isLoading = true;
        
        if (!this.$refs.form.validate()) {
          return;
        }

        const peopleId = user.$user.people_id;
        
        // Atualiza as informações do usuário
        await user.updatePeople({
          id: peopleId,
          tax: this.formData.cpf,
          phone: this.formData.phone,
          birth_date: this.formData.birthDate
        });
        
        // Atualiza ou cria o endereço
        if (this.currentAddress && this.currentAddress.id) {
          await userAddress.updateUserAddress({
            addressId: this.currentAddress.id,
            data: {
              ...this.formData.address,
              zipcode: this.formData.zipcode
            }
          });
        } else {
          await userAddress.createUserAddress({
            ...this.formData.address,
            zipcode: this.formData.zipcode
          });
        }

        toast.setToast({
          text: 'Informações de comprador atualizadas com sucesso!',
          type: 'success',
          time: 5000,
        });

        this.showEditDialog = false;
        this.loadUserData();
      } catch (error) {
        console.error('Erro ao atualizar informações de comprador:', error);
        
        toast.setToast({
          text: 'Erro ao atualizar informações. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.text-subtitle-1 {
  font-size: 0.875rem !important;
  font-weight: 500;
}
</style> 