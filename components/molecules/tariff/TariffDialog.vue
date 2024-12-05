<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-dialog
    v-model="$_dialog"
    fullscreen
    min-width="300"
    max-width="1000"
    class="modal"
    persistent>
    <v-card v-if="!isLoading">
      <v-card-title :class="isMobile ? 'text-title-mobile' : 'text-title'">
        <v-row>
          <v-col md="4" cols="6">
            <v-icon
              :color="
                selectedTariff.Nome_Cliente || selectedTariff.Nome_Fantasia_Cliente
                  ? 'orange'
                  : 'green'
              "
              size="25">
              mdi-circle
            </v-icon>

            <span class="nameTitle"> {{ selectedTariff.Numero }} </span>
          </v-col>

          <v-col
            v-if="
              (selectedTariff.Nome_Cliente || selectedTariff.Nome_Fantasia_Cliente) &&
              !isMobile
            "
            cols="6"
            md="7"
            :align="isMobile ? '' : 'end'">
            <span :class="isMobile ? 'clientNameMobile' : 'clientName'">
              {{
                selectedTariff.Nome_Fantasia_Cliente
                  ? selectedTariff.Nome_Fantasia_Cliente
                  : selectedTariff.Nome_Cliente
              }}
            </span>
          </v-col>

          <v-spacer />

          <v-col cols="2" md="1" :align="isMobile ? '' : 'end'" class="text-center">
            <v-icon class="close-button" @click="close"> mdi-close </v-icon>
          </v-col>
        </v-row>

        <v-row
          v-if="
            (selectedTariff.Nome_Cliente || selectedTariff.Nome_Fantasia_Cliente) &&
            isMobile
          "
          class="ma-0 pa-0">
          <v-col cols="12">
            <span :class="isMobile ? 'clientNameMobile' : 'clientName'">
              {{
                selectedTariff.Nome_Fantasia_Cliente
                  ? selectedTariff.Nome_Fantasia_Cliente
                  : selectedTariff.Nome_Cliente
              }}
            </span>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div v-if="isLoading" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <v-row v-else class="pa-5">
          <v-col cols="12">
            <v-row class="headers">
              <v-col
                cols="12"
                md="6"
                class="mt-1 tariffInfos"
                :align="isMobile ? '' : 'end'">
                <span> <b> Operação: </b> {{ selectedTariff.Operacao }} </span>
              </v-col>

              <v-col cols="12" md="6" class="mt-1 tariffInfos" align="start">
                <span> <b> Modal: </b> {{ selectedTariff.Modal }} </span>
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="mt-1 tariffInfos"
                :align="isMobile ? '' : 'end'">
                <span> <b>Porto: </b> {{ selectedTariff.Porto }} </span>
              </v-col>

              <v-col cols="12" md="6" class="mt-1 tariffInfos" align="start">
                <span>
                  <b>Armador: </b>
                  {{ selectedTariff.Nome_Fantasia_Armador || selectedTariff.Armador }}
                </span>
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="mt-1 tariffInfos"
                :align="isMobile ? '' : 'end'">
                <span>
                  <b> Início Vigência: </b>
                  {{ formatDate(selectedTariff.Data_Inicio_Vigencia) }}
                </span>
              </v-col>

              <v-col cols="12" md="6" class="mt-1 tariffInfos" align="start">
                <span>
                  <b>Validade: </b> {{ formatDate(selectedTariff.Data_Validade) }}
                </span>
              </v-col>
            </v-row>

            <v-divider class="mt-10" />

            <v-row class="mt-5">
              <v-col cols="12">
                <v-data-table
                  :headers="getTableHeaders()"
                  :items="$tariffRateList"
                  :item-class="getClass"
                  hide-default-footer
                  :items-per-page="100"
                  loading-text="Carregando Lista de Tarifários..."
                  no-data-text="Nenhuma Tarifa encontrada"
                  fixed-header
                  dense
                  height="auto">
                  <template #item.checkbox="{ item }">
                    <v-icon
                      v-if="!item.checked"
                      size="20"
                      color="primary"
                      @click="item.checked = !item.checked">
                      mdi-checkbox-blank-outline
                    </v-icon>

                    <v-icon
                      v-else
                      size="20"
                      color="primary"
                      @click="item.checked = !item.checked">
                      mdi-checkbox-outline
                    </v-icon>
                  </template>

                  <template #item.Equipamento_Maritimo="{ item }">
                    <span> {{ item.Equipamento_Maritimo || '-' }} </span>
                  </template>

                  <template #item.Agrup_Equipamento_Maritimo_Desc="{ item }">
                    <span> {{ item.Agrup_Equipamento_Maritimo_Desc || '-' }} </span>
                  </template>

                  <template #item.Tipo_Pagamento_Desc="{ item }">
                    <span> {{ item.Tipo_Pagamento_Desc || '-' }} </span>
                  </template>

                  <template #item.Moeda_Pagamento_Nome="{ item }">
                    <span> {{ item.Moeda_Pagamento_Nome || '-' }} </span>
                  </template>

                  <template #item.Valor_Pagamento_Unitario="{ item }">
                    <span>
                      {{
                        item.Valor_Pagamento_Unitario
                          ? formatCurrency(
                              item.Moeda_Pagamento_Nome,
                              item.Valor_Pagamento_Unitario
                            )
                          : '-'
                      }}
                    </span>
                  </template>

                  <template #item.Valor_Pagamento_Minimo="{ item }">
                    <span>
                      {{
                        item.Valor_Pagamento_Minimo
                          ? formatCurrency(
                              item.Moeda_Pagamento_Nome,
                              item.Valor_Pagamento_Minimo
                            )
                          : '-'
                      }}
                    </span>
                  </template>

                  <template #item.Tipo_Recebimento_Desc="{ item }">
                    <span> {{ item.Tipo_Recebimento_Desc || '-' }} </span>
                  </template>

                  <template #item.Moeda_Recebimento_Nome="{ item }">
                    <span> {{ item.Moeda_Recebimento_Nome || '-' }} </span>
                  </template>

                  <template #item.Valor_Recebimento_Unitario="{ item }">
                    <span>
                      {{
                        item.Valor_Recebimento_Unitario
                          ? formatCurrency(
                              item.Moeda_Recebimento_Nome,
                              item.Valor_Recebimento_Unitario
                            )
                          : '-'
                      }}
                    </span>
                  </template>

                  <template #item.Valor_Recebimento_Minimo="{ item }">
                    <span>
                      {{
                        item.Valor_Recebimento_Minimo
                          ? formatCurrency(
                              item.Moeda_Recebimento_Nome,
                              item.Valor_Recebimento_Minimo
                            )
                          : '-'
                      }}
                    </span>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>

            <v-row>
              <v-col v-if="!isMobile" cols="3" />

              <v-col cols="12" md="6" class="text-center">
                <v-row>
                  <v-col
                    v-if="isDuplicateMode"
                    cols="12"
                    md="6"
                    :align="isMobile ? '' : 'end'">
                    <!-- <v-text-field
                      v-model="rateDestiny"
                      :disabled="!!rateDestinySearched && needToDisableField"
                      label="Insira o Número do Tarifário"
                      placeholder="Ex: 000091/24"
                      dense
                      outlined /> -->

                    <v-autocomplete
                      ref="autocomplete"
                      v-model="rateDestiny"
                      :disabled="!!rateDestinySearched && needToDisableField"
                      label="Número do Tarifário"
                      dense
                      outlined
                      :items="tariffNumbersList"
                      item-text="text"
                      item-value="value"
                      return-object
                      clearable
                      persistent-hint
                      @change="rateDestinySearched = null" />
                  </v-col>

                  <v-col
                    cols="12"
                    :md="isDuplicateMode ? '6' : '12'"
                    :align="isMobile ? '' : isDuplicateMode ? 'start' : ''">
                    <v-btn
                      v-if="!rateDestinySearched || isEditingRateDestiny"
                      color="primary"
                      :disabled="needToDisableButton || isSaving"
                      @click="duplicateRates">
                      {{ getDuplicateText }}

                      <v-icon v-if="!isDuplicateMode" color="white" class="ml-2">
                        mdi-arrow-down-circle
                      </v-icon>

                      <v-icon v-else color="white" class="ml-2">
                        mdi-arrow-right-circle
                      </v-icon>
                    </v-btn>

                    <v-btn
                      v-if="rateDestinySearched && !isEditingRateDestiny"
                      color="primary"
                      :disabled="isSaving"
                      @click="onchangeRateDestiny">
                      Alterar Tarifário Destino
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>

              <v-col v-if="!isMobile" cols="3" />
            </v-row>

            <v-divider
              v-if="
                $tariffChildRateList && $tariffChildRateList.length && !isLoadingRates
              "
              class="mt-5" />

            <v-row
              v-if="
                goingToDuplicate &&
                $tariffChildRateList &&
                $tariffChildRateList.length &&
                !isLoadingRates
              "
              class="mt-5">
              <v-col cols="12" class="text-center">
                <h2 class="titleTable">
                  O Tarifário {{ rateDestinySearched.text }} ficará da seguinte forma:
                </h2>
              </v-col>

              <v-row class="headers mt-5">
                <v-col
                  cols="12"
                  md="6"
                  class="mt-1 tariffInfos"
                  :align="isMobile ? '' : 'end'">
                  <span> <b>Porto: </b> {{ childInfos?.Porto }} </span>
                </v-col>

                <v-col cols="12" md="6" class="mt-1 tariffInfos" align="start">
                  <span>
                    <b>Armador: </b>
                    {{ childInfos?.Armador }}
                  </span>
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                  class="mt-1 tariffInfos"
                  :align="isMobile ? '' : 'end'">
                  <span>
                    <b> Início Vigência: </b>
                    {{ formatDate(childInfos?.Data_Inicio_Vigencia) }}
                  </span>
                </v-col>

                <v-col cols="12" md="6" class="mt-1 tariffInfos" align="start">
                  <span>
                    <b>Validade: </b>
                    {{ formatDate(childInfos?.Data_Validade) }}
                  </span>
                </v-col>

                <v-col
                  v-if="childInfos.Nome_Cliente || childInfos.Nome_Fantasia_Cliente"
                  cols="12"
                  md="12"
                  class="mt-1 tariffInfos"
                  align="center">
                  <span>
                    <b>Cliente: </b>
                    {{ childInfos?.Nome_Fantasia_Cliente || childInfos?.Nome_Cliente }}
                  </span>
                </v-col>
              </v-row>

              <v-col cols="12" class="mt-10">
                <v-data-table
                  :headers="getTableHeaders(false)"
                  :items="$tariffChildRateList"
                  :item-class="getClass"
                  hide-default-footer
                  :items-per-page="100"
                  loading-text="Carregando Lista de Tarifários..."
                  no-data-text="Nenhuma Tarifa encontrada"
                  fixed-header
                  height="auto">
                  <template #item.Equipamento_Maritimo="{ item }">
                    <span> {{ item.Equipamento_Maritimo || '-' }} </span>
                  </template>

                  <template #item.Agrup_Equipamento_Maritimo_Desc="{ item }">
                    <span> {{ item.Agrup_Equipamento_Maritimo_Desc || '-' }} </span>
                  </template>

                  <template #item.Tipo_Pagamento_Desc="{ item }">
                    <span> {{ item.Tipo_Pagamento_Desc || '-' }} </span>
                  </template>

                  <template #item.Moeda_Pagamento_Nome="{ item }">
                    <span> {{ item.Moeda_Pagamento_Nome || '-' }} </span>
                  </template>

                  <template #item.Valor_Pagamento_Unitario="{ item }">
                    <span>
                      {{
                        item.Valor_Pagamento_Unitario
                          ? formatCurrency(
                              item.Moeda_Pagamento_Nome,
                              item.Valor_Pagamento_Unitario
                            )
                          : '-'
                      }}
                    </span>
                  </template>

                  <template #item.Valor_Pagamento_Minimo="{ item }">
                    <span>
                      {{
                        item.Valor_Pagamento_Minimo
                          ? formatCurrency(
                              item.Moeda_Pagamento_Nome,
                              item.Valor_Pagamento_Minimo
                            )
                          : '-'
                      }}
                    </span>
                  </template>

                  <template #item.Tipo_Recebimento_Desc="{ item }">
                    <span> {{ item.Tipo_Recebimento_Desc || '-' }} </span>
                  </template>

                  <template #item.Moeda_Recebimento_Nome="{ item }">
                    <span v-if="item.Moeda_Recebimento_Nome">
                      {{ item.Moeda_Recebimento_Nome }}
                    </span>

                    <v-autocomplete
                      v-else
                      ref="currencyAutocomplete"
                      v-model="item.Moeda_Recebimento"
                      label="Moeda"
                      :class="isMobile ? 'inputGridMobile' : 'inputGrid'"
                      dense
                      outlined
                      :items="$currencyList"
                      item-text="text"
                      item-value="value"
                      clearable
                      persistent-hint
                      hide-details="auto" />
                  </template>

                  <template #item.Valor_Recebimento_Unitario="{ item }">
                    <span v-if="!item.checked">
                      {{
                        item.Valor_Recebimento_Unitario
                          ? formatCurrency(
                              item.Moeda_Recebimento_Nome,
                              item.Valor_Recebimento_Unitario
                            )
                          : '-'
                      }}
                    </span>

                    <v-text-field
                      v-else
                      v-model="item.Valor_Recebimento_Unitario"
                      label="Vlr Rec Un."
                      dense
                      :class="isMobile ? 'inputGridMobile' : 'inputGrid'"
                      outlined
                      type="number"
                      hide-details="auto" />
                  </template>

                  <template #item.Valor_Recebimento_Minimo="{ item }">
                    <span>
                      {{
                        item.Valor_Recebimento_Minimo
                          ? formatCurrency(
                              item.Moeda_Recebimento_Nome,
                              item.Valor_Recebimento_Minimo
                            )
                          : '-'
                      }}
                    </span>
                  </template>
                </v-data-table>
              </v-col>

              <v-col cols="12" :align="isMobile ? '' : 'end'">
                <v-icon size="30" class="caption"> mdi-checkbox-blank </v-icon> Itens que
                serão incorporados ao Tarifário Destino
              </v-col>
            </v-row>

            <v-row
              v-if="
                goingToDuplicate &&
                $tariffChildRateList &&
                $tariffChildRateList.length &&
                !isLoadingRates
              "
              class="text-center">
              <v-col cols="12" :md="isDuplicateMode ? '2' : '12'">
                <v-btn
                  v-if="rateDestinySearched && !isEditingRateDestiny"
                  color="primary"
                  :disabled="isSaving"
                  large
                  @click="onUnifyRates">
                  Salvar Taxas
                </v-btn>
              </v-col>
            </v-row>

            <v-row
              v-if="
                !$tariffChildRateList &&
                $tariffChildRateList.length === 0 &&
                !isLoadingRates
              ">
              <v-col cols="12" class="text-center">
                <span> Nenhuma Tarifa encontrada para o número digitado</span>
              </v-col>
            </v-row>

            <v-row v-if="isLoadingRates" class="text-center">
              <Loading />
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-else height="100">
      <v-row class="text-center">
        <v-col cols="12">
          <Loading class="mt-5" />
        </v-col>
      </v-row>
    </v-card>

    <Toast />
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { tariff, toast } from '@/store';
import {
  formatDateToBr,
  formatDollarValue,
  formatRealValue,
  formatEuroValue,
} from '~/utils/formatters';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },

    selectedTariff: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      isLoading: false,
      isLoadingRates: false,
      isDuplicateMode: false,
      rateDestiny: null,
      rateDestinySearched: null,
      isEditingRateDestiny: false,
      needToDisableField: false,
      isSaving: false,
      childInfos: {},

      goingToDuplicate: false,
    };
  },

  computed: {
    $_dialog: {
      get(this: any): boolean {
        return this.dialog;
      },
      set(val): void {
        this.$emit('update-dialog', val);
      },
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    $tariffRateList() {
      return tariff.$tariffRateList;
    },

    $currencyList() {
      return tariff.$tariffCurrencyList;
    },

    $tariffChildRateList() {
      return tariff.$tariffChildRateList;
    },

    $tariff() {
      return tariff.$tariff;
    },

    tariffNumbersList() {
      return tariff.$tariffNumbersList;
    },

    hasTariffToDuplicate() {
      return this.$tariffRateList.some((item: any) => item.checked);
    },

    needToDisableButton() {
      if (!this.isDuplicateMode && !this.hasTariffToDuplicate) {
        return true;
      } else if (this.isDuplicateMode && !this.rateDestiny) {
        return true;
      } else {
        return false;
      }
    },

    getDuplicateText() {
      return this.isDuplicateMode
        ? 'Duplicar Taxas Selecionadas'
        : 'Selecionar Tarifário Destino';
    },
  },

  async mounted() {
    this.isLoading = true;

    const data = {
      payload: { id: this.selectedTariff.IdTarifario_Origem_Destino },
      mode: 'RATE_PARENT',
    };

    await tariff.getTariffRates(data);
    await tariff.getCurrencies();

    this.rateDestiny = null;
    tariff.resetChildRateList();

    tariff.getTariffNumbers();

    this.isLoading = false;
  },

  methods: {
    async onUnifyRates() {
      let success = true;
      this.isSaving = true;

      for (let i = 0; i < this.$tariffChildRateList.length; i++) {
        const element = this.$tariffChildRateList[i];

        const payload = {
          IdTarifario_Origem_Destino: this.childInfos.IdTarifario_Origem_Destino,
          IdTaxa_Logistica: element.IdTaxa_Logistica,
          IdEquipamento_Maritimo: element.IdEquipamento_Maritimo,
          IdAgrup_Equipamento_Maritimo: element.IdAgrup_Equipamento_Maritimo,
          Tipo_Pagamento: element.Tipo_Pagamento,
          IdMoeda_Pagamento: element.Moeda_Pagamento_IdMoeda,
          Valor_Pagamento_Unitario: element.Valor_Pagamento_Unitario,
          Valor_Pagamento_Minimo: element.Valor_Pagamento_Minimo,
          Tipo_Recebimento: element.Tipo_Recebimento,
          IdMoeda_Recebimento: element.Moeda_Recebimento,
          Valor_Recebimento_Unitario: element.Valor_Recebimento_Unitario,
          Valor_Recebimento_Minimo: element.Valor_Recebimento_Minimo,
        };

        const res = await tariff.createTariffRates(payload);

        if (res && res.body && res.body.code && res.body.code !== 'CREATE_SUCCESS') {
          success = false;

          toast.setToast({
            text: 'Houve um problema ao salvar as taxas',
            type: 'danger',
            time: 5000,
          });
        } else {
          toast.setToast({
            text: 'Taxas inseridas com sucesso',
            type: 'success',
            time: 5000,
          });
        }
      }

      if (success) {
        this.close();
      }

      this.isSaving = false;
    },

    async duplicateRates() {
      if (!this.isDuplicateMode) {
        this.isDuplicateMode = true;
      } else {
        this.isLoadingRates = true;
        this.goingToDuplicate = true;
        this.needToDisableField = true;
        this.isEditingRateDestiny = false;
        this.rateDestinySearched = this.rateDestiny;

        const data = {
          payload: { number: this.rateDestiny.text },
          mode: 'RATE_CHILD',
        };

        await tariff.getTariffRates(data);

        const payloadByNumber = {
          number: this.rateDestiny.text,
        };

        const childRes = await tariff.getTariffsByNumber(payloadByNumber);

        if (
          childRes &&
          childRes.body &&
          childRes.body.result &&
          !childRes.body.result.length
        ) {
          toast.setToast({
            text: 'Houve um problema ao buscar os dados do Tarifário Destino',
            type: 'danger',
            time: 5000,
          });
        }

        this.childInfos = childRes.body.result[0];

        this.prepareChildTariffData();

        this.isLoadingRates = false;
      }
    },

    prepareChildTariffData() {
      const parentItems = this.$tariffRateList.filter((item: any) => item.checked);

      const formattedParentItems = parentItems.map((item: any) => ({
        ...item,
        // Valor_Recebimento_Unitario: item.Valor_Pagamento_Unitario,
        // Valor_Pagamento_Unitario: null,
        // Moeda_Recebimento: item.Moeda_Pagamento,
        // Moeda_Recebimento_Nome: item.Moeda_Pagamento_Nome,
        // Moeda_Pagamento: null,
        // Moeda_Pagamento_Nome: null,
        class: 'bg-green',
      }));

      this.$tariffChildRateList.push(...formattedParentItems);
    },

    onchangeRateDestiny() {
      this.isEditingRateDestiny = !this.isEditingRateDestiny;
      this.needToDisableField = false;
      this.rateDestiny = null;
      this.rateDestinySearched = null;
      tariff.resetChildRateList();
    },

    getClass(item: any) {
      return 'data-table-row ' + item.class;
    },

    close() {
      this.$emit('update-dialog', false);
    },

    formatDate(param: string) {
      return formatDateToBr(param);
    },

    formatCurrency(paymentType, value) {
      if (paymentType === 'REAL') {
        return formatRealValue(value);
      } else if (paymentType === 'DOLAR AMERICANO') {
        return formatDollarValue(value);
      } else if (paymentType === 'EURO') {
        return formatEuroValue(value);
      } else {
        return value;
      }
    },

    getTableHeaders(isParentItems = true) {
      const items = [];

      if (isParentItems) {
        items.push({ text: '', value: 'checkbox', width: '5rem', sortable: false });
      }

      items.push(
        { text: 'Taxa Logística', value: 'Taxa_Logistica_Nome', width: '15rem' },
        { text: 'Equipamento Marítimo', value: 'Equipamento_Maritimo', width: '10rem' },
        {
          text: 'Agrup. Equipamento',
          value: 'Agrup_Equipamento_Maritimo_Desc',
          width: '20rem',
        },
        { text: 'Tipo Pagamento', value: 'Tipo_Pagamento_Desc', width: '10rem' },
        {
          text: 'Vlr Pgto Un.',
          value: 'Valor_Pagamento_Unitario',
          width: '10rem',
        },
        { text: 'Vlr Pgto Mín.', value: 'Valor_Pagamento_Minimo', width: '10rem' },
        // { text: 'Moeda Pagamento', value: 'Moeda_Pagamento_Nome', width: '10rem' },
        { text: 'Tipo Recebimento', value: 'Tipo_Recebimento_Desc', width: '10rem' }
      );

      if (!isParentItems) {
        items.push({
          text: 'Moeda Recebimento',
          value: 'Moeda_Recebimento_Nome',
          width: '20rem',
        });
      }

      items.push(
        {
          text: 'Vlr Rec Un.',
          value: 'Valor_Recebimento_Unitario',
          width: '10rem',
        },
        {
          text: 'Vlr Rec Mín.',
          value: 'Valor_Recebimento_Minimo',
          width: '10rem',
        }
      );

      return items;
    },
  },
});
</script>

<style scoped scss>
.text-title {
  font-size: 18px !important;
}

.text-title-mobile {
  font-size: 15px !important;
}

::v-deep .v-sheet.v-card {
  border-radius: 0 !important;
}

::v-deep.v-card__title {
  background-color: var(--primary) !important;
  color: white !important;
}

.close-button {
  color: white !important;
}

.bg-tabs {
  height: 48px !important;
  background-color: var(--light);
}

.v-tab--active,
.bg-tabs:hover {
  background-color: rgba(2, 63, 136, 0.2);
  border-bottom: 0px;
}

.theme--light.v-tabs > .v-tabs-bar {
  background-color: rgba(2, 63, 136, 0.2);
}

.v-tabs-slider-wrapper {
  height: 0px !important;
  width: 0px !important;
}

.v-tab:before {
  background-color: black;
}

.modal {
  height: 50vh !important;
}

.btnMobile {
  width: 200px;
}

.tariffInfos {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: black;
  width: 100%;
}

.titleTable {
  color: var(--primary);
  font-size: 22px;
}

.caption {
  color: var(--light-green) !important;
}

.headers {
  background-color: var(--light);
}

.inputGrid,
.inputGridMobile {
  height: 10px !important;
  margin-top: -20px !important;
}

.inputGrid {
  width: 200px !important;
}

.inputGridMobile {
  width: 150px !important;
}
</style>
