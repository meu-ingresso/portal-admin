<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="container">
    <div v-if="$isLoading">
      <Lottie path="./animations/loading_ship.json" height="300" width="300" />
    </div>

    <div v-else>
      <v-row :class="isMobile && !screenGhost ? 'searchSessionMobile' : 'searchSession'">
        <v-col cols="12" md="2" :class="!isMobile ? 'content' : ''">
          <v-row
            :class="
              isMobile && !screenGhost
                ? 'text-center mt-2'
                : screenGhost
                ? 'mt-3 ml-5'
                : 'ml-5 mt-2'
            ">
            <DataTableFilter
              filter-type="bob"
              :loading-values="isLoadingNewValues"
              @update-bob-list="filtersParamChanged" />
          </v-row>
        </v-col>

        <v-spacer v-if="!isMobile || screenGhost" />

        <v-col v-if="!isMobile" cols="1" />

        <v-col
          cols="12"
          :md="screenGhost ? '3' : '2'"
          :align="isMobile ? '' : 'end'"
          :class="isMobile && !screenGhost ? 'selectMobile' : 'mt-4'">
          <v-autocomplete
            v-model="screenType"
            :items="screenOptions"
            :menu-props="{ maxHeight: '400' }"
            label="Visualização*"
            persistent-hint
            hide-details="auto"
            dense
            outlined
            :search-input.sync="searchInput.screenType"
            @input="searchInput.screenType = null" />
        </v-col>

        <v-col cols="12" md="3">
          <v-row :class="isMobile && !screenGhost ? 'text-center' : 'ml-5 mt-0'">
            <v-col
              cols="12"
              md="12"
              :class="!isMobile || screenGhost ? '' : 'contentMobile'"
              :align="!isMobile || screenGhost ? 'end' : ''">
              <AddButton url="/bob/create" text="Cadastrar BOB" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row class="mt-10">
        <v-col cols="12">
          <v-data-table
            v-if="!isMobile"
            :headers="getHeaders"
            :items="getBobList"
            :item-class="getClass"
            :options.sync="options"
            :server-items-length="total"
            :footer-props="footerProps"
            :loading="isLoadingGrid"
            loading-text="Carregando Lista de BOB..."
            no-data-text="Nenhum BOB encontrado"
            fixed-header
            dense
            height="70vh">
            <template #item.index="{ index }">
              {{ index + 1 }}
            </template>

            <template #item.seller.first_name="{ item }">
              <span>
                {{
                  `${capitalizeLetters(item.seller.first_name)} ${capitalizeLetters(
                    item.seller.last_name
                  )}`
                }}
              </span>
            </template>

            <template #item.customer="{ item }">
              <span>
                {{ item.customer ? capitalizeLetters(item.customer) : '-' }}
              </span>
            </template>

            <template #item.trade="{ item }">
              <span>
                {{ item.trade ? capitalizeLetters(item.trade) : '-' }}
              </span>
            </template>

            <template #item.origin="{ item }">
              <span>
                {{ item.origin ? capitalizeLetters(item.origin) : '-' }}
              </span>
            </template>

            <template #item.destiny="{ item }">
              <span>
                {{ item.destiny ? capitalizeLetters(item.destiny) : '-' }}
              </span>
            </template>

            <template #item.product="{ item }">
              <span>
                {{ item.product ? capitalizeLetters(item.product) : '-' }}
              </span>
            </template>

            <template #item.seller_target="{ item }">
              <span>
                {{ item.seller_target ? formatValue(item.seller_target) : '-' }}
              </span>
            </template>

            <template #item.seller_freetime_origin="{ item }">
              <span>
                {{ item.seller_freetime_origin ? item.seller_freetime_origin : '-' }}
              </span>
            </template>

            <template #item.seller_freetime_destiny="{ item }">
              <span>
                {{ item.seller_freetime_destiny ? item.seller_freetime_destiny : '-' }}
              </span>
            </template>

            <template #item.volume="{ item }">
              <v-tooltip left>
                <template #activator="{ on, attrs }">
                  <span class="cursor-pointer" v-bind="attrs" v-on="on">
                    {{ item.volume }}</span
                  >
                  <br />
                </template>
                <span class="bold tooltipTitle"> Volume: </span>
                <span class="tooltipContent"> {{ item.volume }} </span> <br />

                <span class="bold tooltipTitle"> Total: </span>
                <span class="tooltipContent"> {{ getTotalvolume }} </span>
              </v-tooltip>
            </template>

            <template #item.seller_note="{ item }">
              <v-icon
                v-if="item.seller_note"
                color="primary"
                size="20"
                @click="seeBob(item)">
                mdi-plus
              </v-icon>
              <span v-else> - </span>
            </template>

            <template #item.action="{ item }">
              <v-row>
                <v-col cols="3">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-icon
                        color="primary"
                        size="20"
                        v-bind="attrs"
                        @click="seeBob(item)"
                        v-on="on">
                        {{ getIcon(item) }}
                      </v-icon>
                    </template>

                    <span>{{ getDescription(item) }}</span>
                  </v-tooltip>
                </v-col>

                <v-col cols="3">
                  <v-menu v-if="Number(item.month_effective) >= isCurrentBobMonth" bottom>
                    <template #activator="{ on, attrs }">
                      <v-icon color="primary" size="20" v-bind="attrs" v-on="on"
                        >mdi-dots-vertical</v-icon
                      >
                    </template>

                    <v-list>
                      <v-list-item v-for="(element, i) in actionItems" :key="i">
                        <v-list-item-title
                          class="cursor-pointer"
                          @click="
                            element.action === 'duplicate' ? bobDuplicate(item) : ''
                          "
                          >{{ element.title }}</v-list-item-title
                        >
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-col>

                <v-col cols="3">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-icon
                        v-if="item.seller_id === getUserId || getIsAdmin"
                        color="red"
                        size="20"
                        v-bind="attrs"
                        @click="deleteBob(item)"
                        v-on="on">
                        mdi-delete
                      </v-icon>
                    </template>

                    <span>Excluir</span>
                  </v-tooltip>
                </v-col>

                <v-col cols="3" />
              </v-row>
            </template>

            <!-- COMMERCIAL FIELDS -->

            <template #item.pricing_note="{ item }">
              <v-icon
                v-if="item.pricing_note"
                color="primary"
                size="20"
                @click="seeBob(item)">
                mdi-plus
              </v-icon>
              <span v-else> - </span>
            </template>

            <template #item.shipowner.name="{ item }">
              <span>
                {{ item.shipowner ? item.shipowner.name : '-' }}
              </span>
            </template>

            <template #item.freight="{ item }">
              <span>
                {{ item.freight ? formatValue(item.freight) : '-' }}
              </span>
            </template>

            <template #item.ens_bl="{ item }">
              <span>
                {{ item.ens_bl ? formatValue(item.ens_bl) : '-' }}
              </span>
            </template>

            <template #item.pricing_target="{ item }">
              <span>
                {{ item.pricing_target ? item.pricing_target : '-' }}
              </span>
            </template>

            <template #item.pricing_freetime_origin="{ item }">
              <span>
                {{ item.pricing_freetime_origin ? item.pricing_freetime_origin : '-' }}
              </span>
            </template>

            <template #item.pricing_freetime_destiny="{ item }">
              <span>
                {{ item.pricing_freetime_destiny ? item.pricing_freetime_destiny : '-' }}
              </span>
            </template>

            <!-- FIM COMMERCIAL -->
          </v-data-table>

          <div v-if="isMobile && !isLoadingGrid">
            <v-row v-for="(item, idx) in getBobList" :key="idx" align-items="center">
              <v-col v-if="screenType === 'Comercial'" cols="12">
                <v-card elevation="5" outlined shaped tile>
                  <v-card-title>
                    <span>{{ idx + 1 }}</span>
                  </v-card-title>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Cliente: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.customer) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Origem: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.origin) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Destino: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.destiny) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Produto: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.product) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Container: </span>
                    <span class="bodyInfo"
                      >{{ item.container ? item.container.name : '-' }}
                    </span>
                  </v-card-text>

                  <v-card-text v-if="item.shipowner" class="pb-1 pt-1">
                    <span class="headerInfo"> Armador: </span>
                    <span class="bodyInfo">{{ item.shipowner.name }} </span>
                  </v-card-text>

                  <v-card-text v-if="item.ens_bl" class="pb-1 pt-1">
                    <span class="headerInfo"> ENS/bl: </span>
                    <span class="bodyInfo"
                      >{{ item.ens_bl ? formatValue(item.ens_bl) : '-' }}
                    </span>
                  </v-card-text>

                  <v-card-text v-if="item.freight" class="pb-1 pt-1">
                    <span class="headerInfo"> Frete: </span>
                    <span class="bodyInfo">{{ formatValue(item.freight) }} </span>
                  </v-card-text>

                  <v-card-text v-if="item.pricing_target" class="pb-1 pt-1">
                    <span class="headerInfo"> Target Batido: </span>
                    <span class="bodyInfo">{{ item.pricing_target }} </span>
                  </v-card-text>

                  <v-card-text v-if="item.pricing_freetime_origin" class="pb-1 pt-1">
                    <span class="headerInfo"> FT Origem: </span>
                    <span class="bodyInfo"
                      >{{
                        item.pricing_freetime_origin ? item.pricing_freetime_origin : '-'
                      }}
                    </span>
                  </v-card-text>

                  <v-card-text v-if="item.pricing_freetime_destiny" class="pb-1 pt-1">
                    <span class="headerInfo"> FT Destino: </span>
                    <span class="bodyInfo"
                      >{{
                        item.pricing_freetime_destiny
                          ? item.pricing_freetime_destiny
                          : '-'
                      }}
                    </span>
                  </v-card-text>

                  <v-card-text v-if="item.pricing_note" class="pb-1 pt-1">
                    <span class="headerInfo"> OBS: </span>
                    <span class="bodyInfo">{{ item.pricing_note }} </span>
                  </v-card-text>

                  <v-card-actions>
                    <v-list-item class="grow pa-2">
                      <span class="headerInfo pa-0 ma-0"> Ações: </span>
                      <v-row align-items="center" justify="end">
                        <v-spacer />
                        <v-col cols="2" align="end">
                          <v-icon
                            color="primary"
                            size="30"
                            class="cursor-pointer icon-mobile mt-0 pr-6 mt-0"
                            @click="seeBob(item)">
                            {{ getIcon(item) }}
                          </v-icon>
                        </v-col>
                        <v-col cols="2" align="end">
                          <v-menu
                            v-if="Number(item.month_effective) >= isCurrentBobMonth"
                            bottom
                            left>
                            <template #activator="{ on, attrs }">
                              <v-icon color="primary" size="20" v-bind="attrs" v-on="on"
                                >mdi-dots-vertical</v-icon
                              >
                            </template>

                            <v-list>
                              <v-list-item v-for="(element, i) in actionItems" :key="i">
                                <v-list-item-title
                                  class="cursor-pointer"
                                  @click="
                                    element.action === 'duplicate'
                                      ? bobDuplicate(item)
                                      : ''
                                  "
                                  >{{ element.title }}</v-list-item-title
                                >
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </v-col>
                        <v-col cols="2" align="end">
                          <v-icon color="red" size="20" @click="deleteBob(item)">
                            mdi-delete
                          </v-icon>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col v-if="screenType === 'Pricing'" cols="12">
                <v-card elevation="5" outlined shaped tile>
                  <v-card-title>
                    <span>{{ idx + 1 }}</span>
                  </v-card-title>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Vendedor: </span>
                    <span class="bodyInfo"
                      >{{
                        `${capitalizeLetters(item.seller.first_name)} ${capitalizeLetters(
                          item.seller.last_name
                        )}`
                      }}
                    </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Cliente: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.customer) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Origem: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.origin) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Destino: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.destiny) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Volume: </span>
                    <span class="bodyInfo">{{ item.volume }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Produto: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.product) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Container: </span>
                    <span class="bodyInfo">{{ item.container.name }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Target: </span>
                    <span class="bodyInfo"
                      >{{ item.seller_target ? formatValue(item.seller_target) : '-' }}
                    </span>
                  </v-card-text>

                  <v-card-text v-if="item.seller_freetime_origin" class="pb-1 pt-1">
                    <span class="headerInfo"> FT Origem: </span>
                    <span class="bodyInfo"
                      >{{
                        item.seller_freetime_origin ? item.seller_freetime_origin : '-'
                      }}
                    </span>
                  </v-card-text>

                  <v-card-text v-if="item.seller_freetime_destiny" class="pb-1 pt-1">
                    <span class="headerInfo"> FT Destino: </span>
                    <span class="bodyInfo"
                      >{{
                        item.seller_freetime_destiny ? item.seller_freetime_destiny : '-'
                      }}
                    </span>
                  </v-card-text>

                  <v-card-text v-if="item.seller_note" class="pb-1 pt-1">
                    <span class="headerInfo"> OBS: </span>
                    <span class="bodyInfo">{{ item.seller_note }} </span>
                  </v-card-text>

                  <v-card-actions>
                    <v-list-item class="grow pa-2">
                      <span class="headerInfo pa-0 ma-0"> Ações: </span>
                      <v-row align-items="center" justify="end">
                        <v-icon
                          color="primary"
                          size="30"
                          class="cursor-pointer icon-mobile mt-0 pr-6 mt-0"
                          @click="seeBob(item)">
                          {{ getIcon(item) }}
                        </v-icon>
                      </v-row>
                    </v-list-item>
                  </v-card-actions>
                </v-card>
              </v-col>
              <br />
            </v-row>
            <br /><br /><br />
          </div>
        </v-col>
      </v-row>
    </div>

    <BobDialogDelete
      v-if="dialogDelete"
      :dialog="dialogDelete"
      :bob-id="bobId"
      @update-dialog-delete="updateDialogDelete" />

    <BobDialog
      v-if="dialog"
      :dialog="dialog"
      :bob-id="bobId"
      @update-dialog="updateDialog" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  capitalizeFirstLetters,
  formatDateToBr,
  formatDollarValue,
} from '@/utils/formatters';
import { loading, bob, filter } from '@/store';
import { isMobileDevice, getNextYearIfLastMonth, getInitialMonth } from '@/utils/utils';

export default Vue.extend({
  data() {
    return {
      searchInput: {
        screenType: null,
      },
      isLoadingGrid: true,
      dialog: false,
      dialogDelete: false,
      screenGhost: false,
      screenType: 'Comercial',
      screenOptions: ['Comercial', 'Pricing'],
      options: {
        groupBy: [],
        groupDesc: [],
        itemsPerPage: 500,
        multiSort: false,
        mustSort: false,
        page: 1,
        sortBy: [],
        sortDesc: [],
      },
      optionsCopy: {
        page: 1,
        itemsPerPage: 500,
        sortBy: [],
        sortDesc: [],
        groupBy: [],
        groupDesc: [],
        mustSort: false,
        multiSort: false,
      },
      total: 0,
      totalFiltered: 0,
      currentWidth: 0,
      bobData: [],
      bobId: '',
      monthWhere: '',
      yearWhere: '',
      footerProps: {
        'items-per-page-options': [100, 200, 500, 1000, 2000, 5000],
        'items-per-page-all-text': 'Todos',
        'items-per-page-text': 'Registros por Página',
      },
      actionItems: [{ title: 'Duplicar', action: 'duplicate' }],
      isLoadingNewValues: false,
    };
  },

  computed: {
    getUserId() {
      return this.$cookies.get('user_id');
    },

    getIsAdmin() {
      return this.$cookies.get('user_role') === 'Administrador';
    },

    $isLoading() {
      return loading.$isLoading;
    },

    $bob() {
      return bob.$bob;
    },

    $bobList() {
      return bob.$bobList;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isCurrentBobMonth() {
      return new Date().getMonth() + 2;
    },

    $bobCustomersFilter() {
      return bob.$bobCustomerList;
    },

    $bobSellersFilter() {
      return bob.$bobSellerList;
    },

    $bobPricersFilter() {
      return bob.$bobPricerList;
    },

    $bobOriginsFilter() {
      return bob.$bobOriginList;
    },

    $bobDestiniesFilter() {
      return bob.$bobDestinyList;
    },

    $bobProductsFilter() {
      return bob.$bobProductList;
    },

    $bobTargetsFilter() {
      return ['Sim', 'Não', 'Sem Target'];
    },

    getTotalvolume() {
      return this.getBobList.reduce((acc, item) => acc + item.volume, 0);
    },

    getHeaders(): Object[] {
      const headers = {
        Comercial: [
          { text: '', value: 'index', width: '3rem' },
          { text: 'Cliente', value: 'customer', width: '18rem' },
          { text: 'Origem', value: 'origin', width: '10rem' },
          { text: 'Destino', value: 'destiny', width: '10rem' },
          { text: 'Produto', value: 'product', width: '12rem' },
          { text: 'Cntr', value: 'container.name', width: '3rem' },
          { text: 'Armador', value: 'shipowner.name', width: '7rem' },
          { text: 'ENS/bl', value: 'ens_bl', width: '5rem' },
          { text: 'Frete', value: 'freight', width: '8rem' },
          { text: 'Target Batido', value: 'pricing_target', width: '7rem' },
          { text: 'FT Origem', value: 'pricing_freetime_origin', width: '7rem' },
          { text: 'FT Destino', value: 'pricing_freetime_destiny', width: '7rem' },
          { text: 'Obs', value: 'pricing_note', width: '4rem' },
          { text: 'Ações', value: 'action', width: '8rem', sortable: false },
        ],

        Pricing: [
          { text: '', value: 'index', width: '3rem' },
          { text: 'Vendedor', value: 'seller.first_name', width: '8rem' },
          { text: 'Cliente', value: 'customer', width: '18rem' },
          { text: 'Origem', value: 'origin', width: '10rem' },
          { text: 'Destino', value: 'destiny', width: '10rem' },
          { text: 'Volume', value: 'volume', width: '5rem' },
          { text: 'Produto', value: 'product', width: '12rem' },
          { text: 'Cntr', value: 'container.name', width: '3rem' },
          { text: 'Target', value: 'seller_target', width: '7rem' },
          { text: 'FT Origem', value: 'seller_freetime_origin', width: '7rem' },
          { text: 'FT Destino', value: 'seller_freetime_destiny', width: '7rem' },
          { text: 'Obs', value: 'seller_note', width: '4rem' },
          { text: 'Ações', value: 'action', width: '8rem', sortable: false },
        ],
      };

      return this.screenType === 'Comercial' ? headers.Comercial : headers.Pricing;
    },

    hasFilter: () => filter.$filters.bob.some((filter) => filter.selected.length),

    getBobList() {
      let listFiltered = this.bobData;

      if (this.hasFilter) {
        filter.$filters.bob.forEach((filter) => {
          if (filter.selected.length) {
            listFiltered = listFiltered.filter((item) => {
              // Verifica se o item é um objeto e contém o atributo 'id'
              if (
                typeof item[filter.type] === 'object' &&
                item[filter.type] !== null &&
                !Array.isArray(item[filter.type])
              ) {
                return filter.selected.includes(item[filter.type].id);
              }
              // Verifica se o item é um array para utilizar 'some'
              else if (Array.isArray(item[filter.type])) {
                return item[filter.type].some((option) =>
                  filter.selected.includes(option.id)
                );
              }
              // Trata caso o item seja uma string ou número
              else if (typeof item[filter.type] === 'string') {
                return filter.selected.includes(item[filter.type].trim());
              } else {
                // Para valores numéricos ou de outros tipos
                return filter.selected.includes(item[filter.type]);
              }
            });
          }
        });
      }

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.total = listFiltered.length;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.totalFiltered = this.total;

      return listFiltered;
    },
  },

  watch: {
    options: {
      handler(val) {
        if (JSON.stringify(this.optionsCopy) !== JSON.stringify(val)) {
          this.optionsCopy = val;
          this.getBobs();
        }
      },
    },

    isMobile(val) {
      if (val) {
        this.getBobs();
      }
    },
  },

  async mounted() {
    loading.setIsLoading(true);

    this.setInitialYearAndMonth();

    this.currentWidth = this.$vuetify.breakpoint.width;
    if (this.$vuetify.breakpoint.width > 959 && this.$vuetify.breakpoint.width < 1264) {
      this.$set(this, 'screenGhost', true);
    }

    await this.getBobs();

    await Promise.all([
      bob.filterCustomers(),
      bob.filterSellers(),
      bob.filterPricers(),
      bob.filterOrigins(),
      bob.filterDestinies(),
      bob.filterProducts(),
    ]);

    filter.mountFilters({
      type: 'bob',
      items: [
        {
          text: 'Cliente',
          selected: [],
          items: bob.$bobCustomerList,
          type: 'customer',
        },
        {
          text: 'Responsável Comercial',
          selected: [],
          items: bob.$bobSellerList.map((item) => ({
            value: item.id,
            text: item.name,
          })),
          type: 'seller',
        },
        {
          text: 'Responsável Pricing',
          selected: [],
          items: bob.$bobPricerList.map((item) => ({
            value: item.id,
            text: item.name,
          })),
          type: 'user',
        },
        {
          text: 'Origem',
          selected: [],
          items: bob.$bobOriginList,
          type: 'origin',
        },
        {
          text: 'Destino',
          selected: [],
          items: bob.$bobDestinyList,
          type: 'destiny',
        },
        {
          text: 'Produto',
          selected: [],
          items: bob.$bobProductList,
          type: 'product',
        },
        {
          text: 'Target Batido',
          selected: [],
          items: this.$bobTargetsFilter,
          type: 'pricing_target',
        },
        {
          text: 'Status',
          selected: [true],
          items: [
            { value: true, text: 'Ativo' },
            { value: false, text: 'Excluido' },
          ],
          type: 'is_active',
        },
      ],
    });

    loading.setIsLoading(false);
  },

  created() {},

  methods: {
    getDescription(item: any): string {
      let description = '';

      if (!item.user_id && this.screenType === 'Pricing') {
        description = 'Preencher Informações';
      } else {
        description = 'Visualizar';
      }

      return description;
    },

    getIcon(item: any): string {
      let icon = '';

      if (!item.user_id && this.screenType === 'Pricing') {
        icon = 'mdi-bullseye-arrow';
      } else {
        icon = 'mdi-eye';
      }

      return icon;
    },

    setInitialYearAndMonth() {
      this.yearWhere = getNextYearIfLastMonth();

      const month = getInitialMonth();
      this.monthWhere = month.value;
    },

    filtersParamChanged(data: string) {
      const formattedData = JSON.parse(data);
      let isChanged = false;

      if (this.yearWhere !== formattedData.year) {
        this.$set(this, 'yearWhere', formattedData.year);
        isChanged = true;
      }
      if (this.monthWhere !== formattedData.month) {
        this.$set(this, 'monthWhere', formattedData.month);
        isChanged = true;
      }

      if (isChanged) {
        this.$set(this, 'isLoadingNewValues', true);
        this.getBobs();
      }
    },

    async getBobs() {
      const startTime = new Date().getTime();

      this.$set(this, 'isLoadingGrid', true);

      const { sortBy, sortDesc, page, itemsPerPage } = this.options;

      const response = await bob.getActiveBobs({
        page,
        limit: itemsPerPage,
        monthWhere: this.monthWhere,
        yearWhere: this.yearWhere,
        sortBy: sortBy.length ? sortBy : ['created_at'],
        sortDesc: sortDesc.length ? sortDesc : [true],
      });

      this.$set(this, 'bobData', []);

      if (response && response.code === 'SEARCH_SUCCESS') {
        const data = response.data;

        data.forEach((item, idx) => {
          this.bobData.push({
            ...item,
            class: idx % 2 === 0 ? '' : 'bg-gray',
          });
        });

        const elapsedTime = new Date().getTime() - startTime;
        const timeoutDuration = Math.max(1000 - elapsedTime, 0);

        setTimeout(() => {
          if (this.totalFiltered !== this.total) {
            this.total = this.totalFiltered;
          } else {
            this.total = response.total;
            this.$set(this, 'isLoadingGrid', false);
          }
        }, timeoutDuration);
      } else {
        this.$set(this, 'isLoadingGrid', false);
      }

      this.$set(this, 'isLoadingNewValues', false);
    },

    formatValue(value: number): string {
      return formatDollarValue(value);
    },

    getClass(item: any) {
      return 'data-table-row ' + item.class;
    },

    capitalizeLetters(value: string): String {
      return capitalizeFirstLetters(value);
    },

    formatDate(value: string): String {
      return formatDateToBr(value);
    },

    seeBob(item) {
      this.$set(this, 'dialog', true);

      this.$set(this, 'bobId', item.id);
    },

    deleteBob(item) {
      this.$set(this, 'dialogDelete', true);

      this.$set(this, 'bobId', item.id);
    },

    bobDuplicate(item) {
      this.$router.replace({
        path: '/bob/create',
        query: {
          customer: item.customer,
          trade: item.trade,
          origin: item.origin,
          destiny: item.destiny,
          product: item.product,
          container_id: item.container_id,
          seller_freetime_origin: item.seller_freetime_origin,
          seller_freetime_destiny: item.seller_freetime_destiny,
          year_effective: item.year_effective,
          month_effective: item.month_effective,
        },
      });
    },

    resetBob(this: any): void {
      bob.reset();
    },

    bobEdit(this: any, id: string): void {
      this.$router.replace('/bob/edit/' + id);
    },

    updateDialog(status: boolean): void {
      if (!status) {
        this.$set(this, 'bob', {});
      }

      this.$set(this, 'dialog', status);

      this.getBobs();
    },

    updateDialogDelete(status: boolean): void {
      if (!status) {
        this.$set(this, 'bob', {});
      }

      this.$set(this, 'dialogDelete', status);

      this.getBobs();
    },
  },
});
</script>

<style scoped>
.searchSession {
  border-radius: 12px;
  height: 95px;
  background-color: var(--white) !important;
  width: 100%;
  margin-left: 2px;
}

.searchSessionMobile {
  border-radius: 12px;
  height: 220px;
  background-color: var(--white) !important;
}

.content {
  margin-top: 10px;
}

.contentMobile {
  margin-top: -10px;
}

.v-data-table-header {
  font-weight: bold;
}

.selectMobile {
  margin-top: 0px;
}

.v-card__title {
  height: 50px !important;
}

.tooltipTitle,
.tooltipContent {
  color: var(--white) !important;
}
</style>
