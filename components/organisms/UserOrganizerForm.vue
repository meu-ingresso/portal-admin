<template>
  <v-form ref="form" v-model="isValid" class="py-6 px-2">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="document"
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
          v-model="birthDate"
          label="Data de Nascimento"
          type="date"
          outlined
          dense
          :disabled="isJuridicalPerson"
        />
      </v-col>
    </v-row>

    <v-row v-if="isJuridicalPerson">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="companyName"
          label="Razão Social"
          :rules="nameRules"
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="tradeName"
          label="Nome Fantasia"
          :rules="nameRules"
          outlined
          dense
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="phone"
          label="Telefone"
          :rules="phoneRules"
          outlined
          dense
          mask="(##) #####-####"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="pixKey"
          label="Chave PIX"
          :rules="pixKeyRules"
          outlined
          dense
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-select
          v-model="pixKeyType"
          :items="pixKeyTypes"
          label="Tipo de Chave PIX"
          outlined
          dense
        />
      </v-col>
    </v-row>

    <h4 class="mt-4 mb-2">Endereço</h4>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="zipcode"
          label="CEP"
          :rules="zipcodeRules"
          outlined
          dense
          mask="#####-###"
          @input="fetchAddressFromZipcode"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="address.street"
          label="Endereço"
          :rules="addressRules"
          outlined
          dense
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="address.number"
          label="Número"
          :rules="addressNumberRules"
          outlined
          dense
          type="number"
        />
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field
          v-model="address.complement"
          label="Complemento"
          outlined
          dense
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="address.neighborhood"
          label="Bairro"
          :rules="addressRules"
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="address.city"
          label="Cidade"
          :rules="addressRules"
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-text-field
          v-model="address.state"
          label="Estado"
          :rules="addressRules"
          outlined
          dense
          maxlength="2"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <ButtonWithIcon
          text="Salvar Alterações"
          icon="mdi-content-save"
          :loading="isLoading"
          :disabled="!isValid"
          direction="left"
          @click="saveProfile"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { user, userAddress, userDocuments, toast } from '@/store';
import { $axios } from '@/utils/nuxt-instance';

export default {
  name: 'UserOrganizerForm',
  
  data() {
    return {
      isValid: true,
      isLoading: false,
      document: '',
      birthDate: '',
      companyName: '',
      tradeName: '',
      phone: '',
      pixKey: '',
      pixKeyType: 'cpf',
      zipcode: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
      },
      pixKeyTypes: [
        { text: 'CPF', value: 'cpf' },
        { text: 'CNPJ', value: 'cnpj' },
        { text: 'E-mail', value: 'email' },
        { text: 'Telefone', value: 'phone' },
        { text: 'Chave aleatória', value: 'random' }
      ],
      documentRules: [
        v => !!v || 'Documento obrigatório'
      ],
      nameRules: [
        v => !!v || 'Campo obrigatório',
        v => (v && v.length >= 2) || 'Deve ter no mínimo 2 caracteres'
      ],
      phoneRules: [
        v => !!v || 'Telefone obrigatório',
        v => (v && v.length >= 14) || 'Telefone inválido'
      ],
      pixKeyRules: [
        v => !!v || 'Chave PIX obrigatória'
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
    documentMask() {
      return this.document && this.document.length > 14 ? '##.###.###/####-##' : '###.###.###-##';
    },
    
    isJuridicalPerson() {
      return this.document && this.document.length > 14;
    },
    
    people() {
      return user.$user?.people || {};
    },
    
    currentAddress() {
      return userAddress.$address || {};
    },
    
    pixInfo() {
      return userDocuments.$userAttachments.find(doc => doc.name === 'Pix Key') || {};
    }
  },
  
  watch: {
    people(newVal) {
      if (newVal) {
        this.document = newVal.tax || '';
        this.birthDate = newVal.birth_date || '';
        this.phone = newVal.phone || '';
        this.companyName = newVal.social_name || '';
        this.tradeName = newVal.fantasy_name || '';
      }
    },
    
    currentAddress(newVal) {
      if (newVal) {
        this.zipcode = newVal.zipcode || '';
        this.address = {
          street: newVal.street || '',
          number: newVal.number || '',
          complement: newVal.complement || '',
          neighborhood: newVal.neighborhood || '',
          city: newVal.city || '',
          state: newVal.state || ''
        };
      }
    },
    
    pixInfo(newVal) {
      if (newVal) {
        this.pixKey = newVal.value || '';
        this.pixKeyType = newVal.type || 'cpf';
      }
    }
  },

  created() {
    this.loadUserData();
  },

  methods: {
    loadUserData() {
      if (this.people) {
        this.document = this.people.tax || '';
        this.birthDate = this.people.birth_date || '';
        this.phone = this.people.phone || '';
        this.companyName = this.people.social_name || '';
        this.tradeName = this.people.fantasy_name || '';
      }
      
      // Carrega o endereço do usuário se disponível
      if (user.$user?.people?.id) {
        userAddress.fetchUserAddress(user.$user.people.id);
      }
      
      // Carrega os documentos (incluindo PIX)
      if (user.$user?.id) {
        userDocuments.fetchDocumentStatus(user.$user.id);
      }
    },

    async fetchAddressFromZipcode() {
      if (this.zipcode && this.zipcode.length === 9) {
        try {
          const cleanZipcode = this.zipcode.replace('-', '');
          const response = await $axios.$get(`https://viacep.com.br/ws/${cleanZipcode}/json/`);
          
          if (!response.erro) {
            this.address.street = response.logradouro;
            this.address.neighborhood = response.bairro;
            this.address.city = response.localidade;
            this.address.state = response.uf;
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
        const userId = user.$user.id;
        
        // Dados específicos para pessoa jurídica
        const peopleData = {
          id: peopleId,
          phone: this.phone,
          birth_date: this.birthDate
        };
        
        // Adiciona campos específicos para pessoa jurídica se for o caso
        if (this.isJuridicalPerson) {
          Object.assign(peopleData, {
            social_name: this.companyName,
            fantasy_name: this.tradeName
          });
        }
        
        // Atualiza as informações do usuário
        await user.updatePeople(peopleData);
        
        // Atualiza ou cria o endereço
        if (this.currentAddress && this.currentAddress.id) {
          await userAddress.updateUserAddress({
            addressId: this.currentAddress.id,
            data: {
              ...this.address,
              zipcode: this.zipcode
            }
          });
        } else {
          await userAddress.createUserAddress({
            ...this.address,
            zipcode: this.zipcode
          });
        }
        
        // Salva informações de PIX
        await userDocuments.savePixInformation({
          userId,
          pixKey: this.pixKey,
          pixKeyType: this.pixKeyType
        });

        toast.setToast({
          text: 'Informações de organizador atualizadas com sucesso!',
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        console.error('Erro ao atualizar informações de organizador:', error);
        
        toast.setToast({
          text: 'Erro ao atualizar informações. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
}
</script> 