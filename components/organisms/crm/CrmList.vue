<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="container">
    <div v-if="$isLoading">
      <Lottie path="./animations/loading_ship.json" height="300" width="300" />
    </div>

    <div v-else :class="isMobile ? 'rowMobile' : ''">
      <v-row class="pa-0 ma-0">
        <v-col v-if="!isMobile" md="4" />

        <v-col v-if="isMultiTenant" class="pr-1 pt-0 mt-0" cols="12" md="4">
          <v-autocomplete
            v-if="!$isLoading"
            v-model="users"
            :items="getUserList"
            label="Vendedores*"
            hide-details="auto"
            persistent-hint
            multiple
            outlined
            :search-input.sync="searchInput.users"
            @input="searchInput.users = null" />
        </v-col>

        <v-col v-if="!isMobile" md="4" />
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-data-table
            v-if="!isMobile"
            :headers="getHeaders"
            :items="getCrmDataList"
            :item-class="getClass"
            :loading="isLoadingGrid"
            :options.sync="options"
            loading-text="Carregando Dados..."
            :no-data-text="
              isMultiTenant && users.length === 0
                ? 'Selecione um Vendedor para carregar os dados'
                : 'Nenhum dado encontrado'
            "
            fixed-header
            hide-default-footer
            height="70vh">
            <template #item.index="{ index }">
              {{ index + 1 }}
            </template>

            <template #item.Favorito="{ item }">
              <v-icon
                v-if="item.Favorito === 1"
                class="is-favorite"
                @click="onChangeFav(item)"
                >mdi-star</v-icon
              >
              <v-icon v-else @click="onChangeFav(item)">mdi-star-outline</v-icon>
            </template>

            <template #item.Tipo="{ item }">
              <span v-if="item.Tipo === 'Trabalhando'"> Lead </span>
              <span v-else>
                {{ item.Tipo ? capitalizeLetters(item.Tipo) : '-' }}
              </span>
            </template>

            <template #item.Vendedor="{ item }">
              {{ capitalizeLetters(getSellerName(item.Vendedor)) }}
            </template>

            <template #item.Decisor="{ item }">
              {{ capitalizeLetters(item.Decisor) }}
            </template>

            <template #item.Cliente_Fantasia="{ item }">
              <span class="cursor-pointer" @click="openDetails(item)">
                {{
                  capitalizeLetters(
                    item.Cliente_Fantasia ? item.Cliente_Fantasia : item.Cliente
                  )
                }}
              </span>
            </template>

            <template #item.Municipio="{ item }">
              {{ item.Municipio ? capitalizeLetters(item.Municipio) : '-' }}
            </template>

            <template #item.Grupo="{ item }">
              {{ item.Grupo ? capitalizeLetters(formatGroupName(item.Grupo)) : '-' }}
            </template>

            <template #item.Tempo_Ultima_Visita="{ item }">
              {{
                parseInt(item.Tempo_Ultima_Visita) >= 0 ? item.Tempo_Ultima_Visita : '-'
              }}
            </template>

            <template #item.Dias_Processo="{ item }">
              {{ parseInt(item.Dias_Processo) >= 0 ? item.Dias_Processo : '-' }}
            </template>

            <template #item.Dias_Proposta="{ item }">
              {{ parseInt(item.Dias_Proposta) >= 0 ? item.Dias_Proposta : '-' }}
            </template>

            <!-- <template #item.actions="{ item }">
              <v-list-item class="grow pa-2">
                <v-menu bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon color="primary" size="20" v-bind="attrs" v-on="on">
                      mdi-dots-vertical
                    </v-icon>
                  </template>

                  <v-list>
                    <v-list-item>
                      <v-list-item-title
                        class="cursor-pointer"
                        @click="openDetails(item)">
                        Detalhes
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item>
            </template> -->

            <template #item.Dias_Tuc="{ item }">
              <v-chip
                v-if="!item.isSelected"
                :color="getStatusColor(getTucDiff(item))"
                class="pl-2"
                @click="onSelectItem(item)">
                <span :class="isMobile ? 'itemChipMobile' : 'itemChip'"
                  >{{
                    getTucDiff(item) === 0
                      ? 'Hoje'
                      : getTucDiff(item) === 1
                      ? 'Ontem'
                      : getTucDiff(item)
                  }}
                </span>
              </v-chip>

              <v-menu
                v-else
                ref="menu"
                v-model="item.isSelected"
                :close-on-content-click="true"
                transition="scale-transition"
                offset-y
                left
                min-width="auto">
                <template #activator="{ on, attrs }">
                  <v-chip
                    v-bind="attrs"
                    :color="getStatusColor(getTucDiff(item))"
                    class="pl-2"
                    v-on="on"
                    @blur="updateItem(item)">
                    <span :class="isMobile ? 'itemChipMobile' : 'itemChip'"
                      >{{
                        getTucDiff(item) === 0
                          ? 'Hoje'
                          : getTucDiff(item) === 1
                          ? 'Ontem'
                          : getTucDiff(item)
                      }}
                    </span>
                  </v-chip>
                </template>

                <v-date-picker
                  v-model="item.Tuc_Novo"
                  locale="pt-br"
                  no-title
                  @input="updateItem(item)" />
              </v-menu>
            </template>
          </v-data-table>

          <div v-if="isMobile && !isLoadingGrid" class="ma-0 pa-0">
            <v-row v-for="(item, idx) in getCrmDataList" :key="idx" align-items="center">
              <v-col cols="12">
                <v-card elevation="5" outlined shaped tile>
                  <v-card-title>
                    <span class="idxItem">{{ idx + 1 }}</span>
                    <v-spacer />

                    <v-icon
                      v-if="item.Favorito === 1"
                      class="is-favorite"
                      size="30"
                      @click="onChangeFav(item)">
                      mdi-star
                    </v-icon>
                    <v-icon v-else size="30" @click="onChangeFav(item)">
                      mdi-star-outline
                    </v-icon>
                  </v-card-title>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Empresa: </span>
                    <span class="bodyInfo"
                      >{{
                        capitalizeLetters(
                          item.Cliente_Fantasia ? item.Cliente_Fantasia : item.Cliente
                        )
                      }}
                    </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Decisor: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.Decisor) }} </span>
                  </v-card-text>

                  <v-card-text v-if="isMultiTenant" class="pb-1 pt-1">
                    <span class="headerInfo"> Tipo: </span>
                    <span v-if="item.Tipo === 'Trabalhando'" class="bodyInfo">
                      Lead
                    </span>
                    <span v-else class="bodyInfo"
                      >{{ item.Tipo ? item.Tipo : '-' }}
                    </span>
                  </v-card-text>

                  <v-card-text v-if="isMultiTenant" class="pb-1 pt-1">
                    <span class="headerInfo"> Vendedor: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.Vendedor) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> UF: </span>
                    <span class="bodyInfo">{{ item.UF }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Município: </span>
                    <span class="bodyInfo">{{ capitalizeLetters(item.Municipio) }} </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> Grupo: </span>
                    <span class="bodyInfo"
                      >{{ capitalizeLetters(formatGroupName(item.Grupo)) }}
                    </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> TUV: </span>
                    <span class="bodyInfo">
                      {{
                        parseInt(item.Tempo_Ultima_Visita) >= 0
                          ? item.Tempo_Ultima_Visita
                          : '-'
                      }}
                    </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> DUP: </span>
                    <span class="bodyInfo">
                      {{ parseInt(item.Dias_Processo) >= 0 ? item.Dias_Processo : '-' }}
                    </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> DUO: </span>
                    <span class="bodyInfo">
                      {{ parseInt(item.Dias_Proposta) >= 0 ? item.Dias_Proposta : '-' }}
                    </span>
                  </v-card-text>

                  <v-card-text class="pb-1 pt-1">
                    <span class="headerInfo"> DUC: </span>
                    <v-chip
                      v-if="!item.isSelected"
                      :color="getStatusColor(getTucDiff(item))"
                      @click="onSelectItem(item)">
                      <span class="itemColor">
                        {{
                          getTucDiff(item) === 0
                            ? 'Hoje'
                            : getTucDiff(item) === 1
                            ? 'Ontem'
                            : getTucDiff(item)
                        }}
                      </span>
                    </v-chip>

                    <v-menu
                      v-else
                      ref="menu"
                      v-model="item.isSelected"
                      :close-on-content-click="true"
                      transition="scale-transition"
                      offset-y
                      bottom
                      min-width="auto">
                      <template #activator="{ on, attrs }">
                        <v-chip
                          v-bind="attrs"
                          :color="getStatusColor(getTucDiff(item))"
                          @blur="updateItem(item)"
                          v-on="on">
                          <span class="itemColor">{{ getTucDiff(item) }} </span>
                        </v-chip>
                      </template>

                      <v-date-picker
                        v-model="item.Tuc_Novo"
                        locale="pt-br"
                        no-title
                        @input="updateItem(item)" />
                    </v-menu>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer />
                    <v-icon size="30" color="primary" @click="openDetails(item)">
                      mdi-eye
                    </v-icon>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            <br /><br />
          </div>

          <div v-if="isMobile && isLoadingGrid">
            <Loading />
          </div>
        </v-col>
      </v-row>
    </div>

    <CrmDialog
      v-if="dialog"
      :dialog="dialog"
      :customer="listItem"
      @update-dialog="updateDialog"
      @update-favorite="onChangeFav" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  capitalizeFirstLetters,
  formatDateToBr,
  formatDateToUs,
} from '@/utils/formatters';
import { loading, headSoft, toast, user } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  data() {
    return {
      searchInput: {
        users: null,
      },
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
      isLoadingGrid: false,
      currentWidth: 0,
      crmData: [],
      users: [],
      isSelected: false,
      isValidDate: true,
      today: new Date().toISOString().slice(0, 10),
      dialog: false,
      listItem: {},
    };
  },

  computed: {
    isMultiTenant() {
      return (
        this.$cookies.get('user_role') === 'Administrador' ||
        this.$cookies.get('user_role') === 'Coordenador/Gestor' ||
        this.$cookies.get('user_role') === 'Diretoria'
      );
    },

    getUserList() {
      return user.$userList
        .filter(
          (el) =>
            (el.role.name === 'Vendedor' ||
              el.role.name === 'Inside Sales' ||
              el.role.name === 'Coordenador/Gestor' ||
              el.role.name === 'Diretoria') &&
            el.is_active
        )
        .map((item: any) => ({
          value: item.id,
          text: item.first_name + ' ' + item.last_name,
        }));
    },

    $isLoading() {
      return loading.$isLoading;
    },

    $crmDataList() {
      return headSoft.$crmDataList.filter;
    },

    $sellers() {
      return this.$cookies.get('sellers');
    },

    $userIdErp() {
      return this.$cookies.get('id_erp');
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getHeaders(): Object[] {
      const headers = {
        Comercial: [
          { text: '', value: 'index', width: '2rem', sortable: false },
          { text: 'Favorito', value: 'Favorito', width: '4rem' },
          {
            text: 'Empresa',
            value: 'Cliente_Fantasia',
            width: '15rem',
          },
          { text: 'Decisor', value: 'Decisor', width: '8rem' },
          { text: 'Tipo', value: 'Tipo', width: '5rem' },
          // { text: 'Telefone', value: 'Telefone', width: '7rem', sortable: false },
          { text: 'País', value: 'Pais', width: '5rem' },
          { text: 'UF', value: 'UF', width: '3rem' },
          { text: 'Município', value: 'Municipio', width: '10rem' },
          { text: 'Grupo', value: 'Grupo', width: '5rem' },
          { text: 'TUV', value: 'Tempo_Ultima_Visita', width: '5rem' },
          { text: 'DUP', value: 'Dias_Processo', width: '5rem' },
          { text: 'DUO', value: 'Dias_Proposta', width: '5rem' },
          { text: 'DUC', value: 'Dias_Tuc', width: '5rem' },
          { text: '', value: 'actions', width: '3rem' },
        ],

        Gestor: [
          { text: '', value: 'index', width: '2rem', sortable: false },
          { text: 'Favorito', value: 'Favorito', width: '4rem' },
          {
            text: 'Empresa',
            value: 'Cliente_Fantasia',
            width: '15rem',
          },
          { text: 'Decisor', value: 'Decisor', width: '8rem' },
          { text: 'Tipo', value: 'Tipo', width: '5rem' },
          { text: 'Vendedor', value: 'Vendedor', width: '8rem' },
          // { text: 'Telefone', value: 'Telefone', width: '7rem', sortable: false },
          { text: 'País', value: 'Pais', width: '5rem' },
          { text: 'UF', value: 'UF', width: '3rem' },
          { text: 'Município', value: 'Municipio', width: '10rem' },
          { text: 'Grupo', value: 'Grupo', width: '5rem' },
          { text: 'TUV', value: 'Tempo_Ultima_Visita', width: '5rem' },
          { text: 'DUP', value: 'Dias_Processo', width: '5rem' },
          { text: 'DUO', value: 'Dias_Proposta', width: '5rem' },
          { text: 'DUC', value: 'Dias_Tuc', width: '5rem' },
          { text: '', value: 'actions', width: '3rem' },
        ],
      };

      return this.isMultiTenant ? headers.Gestor : headers.Comercial;
    },

    getCrmDataList() {
      return this.crmData;
    },
  },

  watch: {
    isMobile(val) {
      if (val) {
        this.getCrmData();
      }
    },

    users(val) {
      if (val && val.length) {
        this.getCrmData();
      } else {
        this.$set(this, 'crmData', []);
      }
    },
  },

  async mounted() {
    loading.setIsLoading(true);

    this.currentWidth = this.$vuetify.breakpoint.width;

    if (this.isMultiTenant) {
      await user.getUsers({
        page: 1,
        limit: 99999999,
        search: this.search,
        sortBy: ['first_name'],
        sortDesc: [false],
      });
    } else {
      await this.getCrmData();
    }

    loading.setIsLoading(false);
  },

  methods: {
    openDetails(item) {
      this.$set(this, 'dialog', true);

      this.$set(this, 'listItem', item);
    },

    updateDialog(status: boolean): void {
      this.$set(this, 'dialog', status);
    },

    async onChangeFav(item) {
      item.Favorito = item.Favorito === 1 ? null : 1;

      this.crmData = this.crmData.map((el) => {
        if (el.IdPessoa === item.IdPessoa) {
          el.Favorito = item.Favorito;
        }
        return el;
      });

      const payload = {
        IdPessoa: item.IdPessoa,
        Favorito: item.Favorito === 1 ? 1 : 0,
      };

      await headSoft.updateFav(payload);

      this.crmData = this.sortByFavorite(this.crmData);
    },

    getTucDiff(item) {
      if (!item.Tuc && !item.Data_Contato_MAX_TUC_E_ACOMP) return 'Sem Data';

      const today = new Date(this.today);
      today.setHours(0, 0, 0, 0);

      const tuc = item.Tuc ? new Date(item.Tuc) : null;

      const contatoMax = item.Data_Contato_MAX_TUC_E_ACOMP
        ? new Date(item.Data_Contato_MAX_TUC_E_ACOMP)
        : null;

      if (tuc) tuc.setHours(0, 0, 0, 0);
      if (contatoMax) contatoMax.setHours(0, 0, 0, 0);

      const latestDate =
        tuc && contatoMax ? (tuc > contatoMax ? tuc : contatoMax) : tuc || contatoMax;

      const diffTime = today.getTime() - latestDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      return Math.ceil(diffDays);
    },

    getSellerName(fullName: string) {
      const nameParts = fullName.split(' ');

      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];

      return `${firstName} ${lastName}`;
    },

    formatDateBr(date: string): String {
      return formatDateToBr(date);
    },

    formatDateUs(date: string): String {
      return formatDateToUs(date);
    },

    getStatusColor(status) {
      if (status > 14 && status < 30) {
        return 'warning';
      } else if (status >= 30 || status === 'Sem Data') {
        return 'error';
      } else {
        return 'green';
      }
    },

    async updateItem(item) {
      this.validatePositiveNumber(item);

      if (!this.isValidDate) return;

      this.$set(item, 'isSelected', false);

      const payload = {
        Tuc: `${item.Tuc}T00:00:00.000Z`,
        IdPessoa: item.IdPessoa,
        Decisor_Numero: item.Decisor_Numero,
        IdConfiguracao_Campo_Livre: item.Tuc_Id,
      };

      const result = await headSoft.updateCrmData(payload);

      if (result && result.body && result.body.code !== 'UPDATE_SUCCESS') {
        toast.setToast({
          text: 'Erro ao atualizar.',
          type: 'danger',
          time: 3000,
        });
      } else {
        toast.setToast({
          text: 'Data atualizada com sucesso.',
          type: 'success',
          time: 3000,
        });
      }
    },

    validatePositiveNumber(item: any) {
      const diffDays = this.getTucDiff(item);

      if (diffDays < 0) {
        this.$set(this, 'isValidDate', false);

        toast.setToast({
          text: 'A data selecionada deve ser menor ou igual à data atual.',
          type: 'danger',
          time: 5000,
        });

        this.$set(item, 'Tuc_Novo', item.Tuc);
      } else {
        this.$set(this, 'isValidDate', true);
        this.$set(item, 'Tuc', item.Tuc_Novo);
      }
    },

    onSelectItem(item) {
      this.$set(item, 'isSelected', true);

      if (!this.isMobile) {
        this.$nextTick(() => {
          const menuRef = this.$refs.menu;
          if (menuRef && menuRef.length > 0) {
            menuRef[0].focus();
          }
        });
      }
    },

    async getCrmData() {
      const startTime = new Date().getTime();

      this.$set(this, 'isLoadingGrid', true);
      let response = null;

      const IdsErp: Number[] = [];

      if (this.isMultiTenant) {
        for (let i = 0; i < this.users.length; i++) {
          const userInfo = await user.get(this.users[i]);

          if (userInfo && userInfo.body && userInfo.body.code === 'SEARCH_SUCCESS') {
            IdsErp.push(Number(userInfo.body.result.data[0].id_erp));
          }
        }
      } else {
        this.$sellers.forEach((seller) => {
          IdsErp.push(Number(seller.id_erp));
        });

        IdsErp.push(this.$userIdErp);
      }

      response = await headSoft.getCrmData(IdsErp.join(','));

      this.$set(this, 'crmData', []);

      if (response && response.body && response.body.code === 'SEARCH_SUCCESS') {
        const data = response.body.result;

        data.forEach((item) => {
          this.crmData.push({
            ...item,
            // class: idx % 2 === 0 ? '' : 'bg-gray',
            isSelected: false,
            Dias_Tuc_Novo: item.Dias_Tuc,
            Tuc_Novo: item.Tuc,
          });
        });

        this.crmData = this.sortByFavorite(this.crmData);

        const elapsedTime = new Date().getTime() - startTime;
        const timeoutDuration = Math.max(1000 - elapsedTime, 0);

        setTimeout(() => {
          this.$set(this, 'isLoadingGrid', false);
        }, timeoutDuration);
      } else {
        this.$set(this, 'isLoadingGrid', false);
      }
    },

    sortByFavorite(data) {
      return data.sort((a, b) => {
        if (a.Favorito === null && b.Favorito !== null) {
          return 1;
        }
        if (a.Favorito !== null && b.Favorito === null) {
          return -1;
        }

        const clienteA = a.Cliente_Fantasia || a.Cliente;
        const clienteB = b.Cliente_Fantasia || b.Cliente;

        if (a.Favorito === b.Favorito) {
          return clienteA.localeCompare(clienteB);
        }

        return a.Favorito.localeCompare(b.Favorito);
      });
    },

    getClass(item: any) {
      return 'data-table-row ' + item.class;
    },

    capitalizeLetters(value: string): String {
      return capitalizeFirstLetters(value);
    },

    formatGroupName(value: string): string {
      if (!value) return value;
      return value.replace(/^\d+\./, '').trim();
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

.itemChip {
  color: var(--white) !important;
  margin-left: 3px;
}

.itemChipMobile {
  color: var(--white) !important;
}

.tableInput {
  width: 150px;
}

.tableInputDesk {
  width: 100px;
}

.idxItem {
  font-size: 14px;
}

.rowMobile {
  margin-top: -50px;
}

.itemColor {
  color: var(--white) !important;
}

.is-favorite {
  color: #ffc107 !important;
}
</style>
