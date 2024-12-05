<template>
  <div>
    <div v-if="isLoading" class="text-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-if="!isLoading">
      <v-row class="text-center">
        <v-col cols="3">
          <Loading v-if="$isLoadingApproval" />

          <span v-else class="mainInfos" :class="getApprovalColor($approvalRate)">
            {{ $approvalRate }}%
          </span>
        </v-col>

        <v-col cols="3">
          <Loading v-if="$isLoadingTotalizer" />

          <span v-else class="mainInfos">
            {{
              $customerTotalizer.Total_Processos ? $customerTotalizer.Total_Processos : 0
            }}
          </span>
        </v-col>

        <v-col cols="3">
          <Loading v-if="$isLoadingTotalizer" />

          <span v-else class="mainInfos">
            {{
              $customerTotalizer.Total_TEUS ? $customerTotalizer.Total_TEUS + ' Teus' : 0
            }}
          </span>
        </v-col>

        <v-col cols="3">
          <Loading v-if="$isLoadingTotalizer" />

          <span v-else class="mainInfos">
            {{ formatWeight($customerTotalizer.Total_Tons) }}
          </span>
        </v-col>
      </v-row>

      <v-row class="text-center labelInfos">
        <v-col cols="3">
          <span> Taxa de Aprovação </span>
        </v-col>
        <v-col cols="3">
          <span> Processos </span>
        </v-col>
        <v-col cols="3">
          <span>Volume Marítimo </span>
        </v-col>
        <v-col cols="3">
          <span> Volume Aéreo </span>
        </v-col>
      </v-row>

      <v-row class="mt-5 mb-2">
        <v-divider />
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <span class="titleCustomerInfos">
                {{ $customer.Tipo_Pessoa === true ? 'Razão Social' : 'Nome' }}
              </span>
            </v-col>
            <v-col cols="4">
              <span class="titleCustomerInfos">
                {{ $customer.Tipo_Pessoa === true ? 'CNPJ' : 'CPF' }}
              </span>
            </v-col>

            <v-col cols="4">
              <span class="titleCustomerInfos">
                {{ $customer.Tipo_Pessoa === true ? 'Inscrição Estadual' : 'RG' }}
              </span>
            </v-col>
          </v-row>

          <v-row class="labelInfos">
            <v-col cols="4">
              <span class="customerInfos">
                {{ $customer.Nome }}
              </span>
            </v-col>
            <v-col cols="4">
              <span class="customerInfos">
                {{ $customer.Cpf_Cnpj }}
              </span>
            </v-col>

            <v-col cols="4">
              <span class="customerInfos">
                {{
                  $customer.Rg_Inscricao_Estadual ? $customer.Rg_Inscricao_Estadual : '-'
                }}
              </span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Tipo </span>
            </v-col>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Grupo </span>
            </v-col>

            <v-col cols="4">
              <span class="titleCustomerInfos"> Vendedor Responsável </span>
            </v-col>
          </v-row>

          <v-row class="labelInfos">
            <v-col cols="4">
              <span class="customerInfos">
                {{ customer.Tipo }}
              </span>
            </v-col>
            <v-col cols="4">
              <span class="customerInfos">
                {{ capitalizeLetters(customer.Grupo) }}
              </span>
            </v-col>

            <v-col cols="4">
              <span class="customerInfos">
                {{ capitalizeLetters(customer.Vendedor) }}
              </span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Cliente </span>
            </v-col>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Importador </span>
            </v-col>

            <v-col cols="4">
              <span class="titleCustomerInfos"> Exportador </span>
            </v-col>
          </v-row>

          <v-row class="labelInfos">
            <v-col cols="4">
              <span class="customerInfos">
                {{ $customer.Cliente ? 'Sim' : 'Não' }}
              </span>
            </v-col>
            <v-col cols="4">
              <span class="customerInfos">
                {{ $customer.Importador ? 'Sim' : 'Não' }}
              </span>
            </v-col>

            <v-col cols="4">
              <span class="customerInfos">
                {{ $customer.Exportador ? 'Sim' : 'Não' }}
              </span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Endereço </span>
            </v-col>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Número </span>
            </v-col>

            <v-col cols="4">
              <span class="titleCustomerInfos"> Complemento </span>
            </v-col>
          </v-row>

          <v-row class="labelInfos">
            <v-col cols="4">
              <span class="customerInfos">
                {{ capitalizeLetters($customer.Logradouro) }}
              </span>
            </v-col>
            <v-col cols="4">
              <span class="customerInfos">
                {{
                  $customer.Numero !== 'null' && $customer.Numero !== ''
                    ? $customer.Numero
                    : '-'
                }}
              </span>
            </v-col>

            <v-col cols="4">
              <span class="customerInfos">
                {{
                  $customer.Complemento !== 'null' && $customer.Complemento !== ''
                    ? capitalizeLetters($customer.Complemento)
                    : '-'
                }}
              </span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <span class="titleCustomerInfos"> CEP </span>
            </v-col>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Bairro </span>
            </v-col>

            <v-col cols="4">
              <span class="titleCustomerInfos"> Tempo Última Visita </span>
            </v-col>
          </v-row>

          <v-row class="labelInfos">
            <v-col cols="4">
              <span class="customerInfos">
                {{ $customer.Cep ? $customer.Cep : '-' }}
              </span>
            </v-col>
            <v-col cols="4">
              <span class="customerInfos">
                {{ $customer.Bairro ? capitalizeLetters($customer.Bairro) : '-' }}
              </span>
            </v-col>

            <v-col cols="4">
              <span class="customerInfos">
                {{
                  parseInt(customer.Tempo_Ultima_Visita) >= 0
                    ? customer.Tempo_Ultima_Visita + ' dias'
                    : '-'
                }}
              </span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <span class="titleCustomerInfos"> País </span>
            </v-col>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Estado </span>
            </v-col>

            <v-col cols="4">
              <span class="titleCustomerInfos"> Cidade </span>
            </v-col>
          </v-row>

          <v-row class="labelInfos">
            <v-col cols="4">
              <span class="customerInfos">
                {{ capitalizeLetters(customer.Pais) }}
              </span>
            </v-col>
            <v-col cols="4">
              <span class="customerInfos">
                {{ customer.UF ? customer.UF : '-' }}
              </span>
            </v-col>

            <v-col cols="4">
              <span class="customerInfos">
                {{ customer.Municipio ? capitalizeLetters(customer.Municipio) : '-' }}
              </span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Telefone </span>
            </v-col>
            <v-col cols="4">
              <span class="titleCustomerInfos"> Email </span>
            </v-col>

            <v-col cols="4">
              <span class="titleCustomerInfos"> Cliente Desde </span>
            </v-col>
          </v-row>

          <v-row class="labelInfos">
            <v-col cols="4">
              <span class="customerInfos">
                {{ $customer.Fone }}
              </span>
            </v-col>
            <v-col cols="4">
              <span class="customerInfos">
                {{
                  $customer.EMail &&
                  $customer.EMail !== 'null' &&
                  $customer.Email !== 'undefined'
                    ? $customer.EMail
                    : '-'
                }}
              </span>
            </v-col>

            <v-col cols="4">
              <span class="customerInfos">
                {{
                  $customer.Cliente_Desde ? formatDateSince($customer.Cliente_Desde) : '-'
                }}
              </span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { headSoft } from '@/store';
import { capitalizeFirstLetters } from '@/utils/formatters';

export default Vue.extend({
  props: {
    customer: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      isLoading: false,
    };
  },

  computed: {
    $customer() {
      return headSoft.$customerData;
    },

    $customerTotalizer() {
      return headSoft.$customerTotalizer;
    },

    $customerApproval() {
      return headSoft.$customerApproval;
    },

    $isLoadingTotalizer() {
      return headSoft.$isLoadingTotalizer;
    },

    $isLoadingApproval() {
      return headSoft.$isLoadingApproval;
    },

    $approvalRate() {
      let totalApproved = 0;
      let totalProposals = 0;

      this.$customerApproval.forEach((item) => {
        totalProposals += item.Total_Propostas;
        if (item.Situacao_Oferta === 'Aprovada') {
          totalApproved += item.Total_Propostas;
        }
      });

      if (totalProposals === 0) {
        return 0;
      }

      const approvalRate = ((totalApproved / totalProposals) * 100).toFixed(2);

      return Number(approvalRate);
    },
  },

  async mounted() {
    this.$set(this, 'isLoading', true);

    await headSoft.getCustomerData(this.customer.IdPessoa);
    headSoft.getCustomerTotalizer(this.customer.IdPessoa);
    headSoft.getCustomerApproval(this.customer.IdPessoa);

    this.$set(this, 'isLoading', false);
  },

  methods: {
    formatWeight(weight) {
      if (weight < 1) {
        return 0;
      } else if (weight < 1000) {
        return `${weight.toFixed(1)} KG`;
      } else {
        const tons = weight / 1000;

        return `${tons.toFixed(1)} Tons`;
      }
    },

    getApprovalColor(rate) {
      if (rate < 10) {
        return 'rateError';
      } else if (rate >= 10 && rate < 30) {
        return 'rateWarning';
      } else {
        return 'rateSuccess';
      }
    },

    capitalizeLetters(value: string): string {
      return capitalizeFirstLetters(value);
    },

    formatDateSince(dateString) {
      if (!dateString) {
        return '-';
      }

      const date = new Date(dateString);
      const monthNames = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ];

      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      return `${month}/${year}`;
    },
  },
});
</script>

<style scoped>
.mainInfos {
  font-size: 22px !important;
  color: var(--black) !important;
}

.customerInfos {
  font-size: 15px !important;
  color: var(--black) !important;
}

.rateError {
  color: var(--error) !important;
}

.rateWarning {
  color: var(--warning) !important;
}

.rateSuccess {
  color: var(--success) !important;
}

.labelInfos {
  margin-top: -25px !important;
}

.titleCustomerInfos {
  font-size: 12px !important;
}
</style>
