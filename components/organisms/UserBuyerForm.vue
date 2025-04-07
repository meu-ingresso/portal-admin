<template>
  <v-form ref="form" v-model="isValid" class="py-6 px-2">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="cpf"
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
          v-model="phone"
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
          v-model="birthDate"
          label="Data de Nascimento"
          type="date"
          outlined
          dense
        />
      </v-col>
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
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-text-field
          v-model="address.street"
          label="Endereço"
          :rules="addressRules"
          outlined
          dense
        />
      </v-col>
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
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="address.complement"
          label="Complemento"
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="address.neighborhood"
          label="Bairro"
          :rules="addressRules"
          outlined
          dense
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-text-field
          v-model="address.city"
          label="Cidade"
          :rules="addressRules"
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" md="4">
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
          @click="saveProfile"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { user, userAddress, toast } from '@/store';
import { $axios } from '@/utils/nuxt-instance';

export default {

  data() {
    return {
      isValid: true,
      isLoading: false,
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
    documentMask() {
      return this.cpf && this.cpf.length > 14 ? '##.###.###/####-##' : '###.###.###-##';
    },
    
    people() {
      return user.$user?.people || {};
    },
    
    currentAddress() {
      return userAddress.$address || {};
    }
  },
  
  watch: {
    people(newVal) {
      if (newVal) {
        this.cpf = newVal.tax || '';
        this.phone = newVal.phone || '';
        this.birthDate = newVal.birth_date || '';
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
    }
  },

  created() {
    this.loadUserData();
  },

  methods: {
    loadUserData() {
      if (this.people) {
        this.cpf = this.people.tax || '';
        this.phone = this.people.phone || '';
        this.birthDate = this.people.birth_date || '';
      }
      
      // Carrega o endereço do usuário se disponível
      if (user.$user?.people?.id) {
        userAddress.fetchUserAddress(user.$user.people.id);
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
        
        // Atualiza as informações do usuário
        await user.updatePeople({
          id: peopleId,
          tax: this.cpf,
          phone: this.phone,
          birth_date: this.birthDate
        });
        
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

        toast.setToast({
          text: 'Informações de comprador atualizadas com sucesso!',
          type: 'success',
          time: 5000,
        });
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
    },
  },
}
</script> 