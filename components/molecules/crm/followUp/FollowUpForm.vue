<template>
  <div>
    <div v-if="!isLoading && !newFollowUp">
      <v-row class="text-center py-4">
        <v-col cols="12" md="2">
          <v-btn
            text
            class="btnDialog btnSuccess"
            :class="isMobile ? 'btnMobile' : ''"
            @click="newFollow">
            Novo Acompanhamento
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <div v-else-if="!isLoading && newFollowUp">
      <v-form ref="form" v-model="valid" @submit.prevent="validate">
        <v-row>
          <v-col cols="12" md="4">
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              bottom
              min-width="auto">
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-bind="attrs"
                  v-model="formattedDate"
                  :rules="[validationRequired]"
                  label="Data*"
                  :class="isMobile ? 'menuMobile' : ''"
                  readonly
                  outlined
                  dense
                  v-on="on" />
              </template>

              <v-date-picker
                v-model="followDate"
                locale="pt-br"
                no-title
                @input="saveDate" />
            </v-menu>
          </v-col>

          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="user"
              :items="getUserList"
              :rules="[validationRequired]"
              label="Responsável*"
              hide-details="auto"
              persistent-hint
              outlined
              dense
              return-object
              :search-input.sync="searchInput.users"
              @input="searchInput.users = null" />
          </v-col>

          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="type"
              :items="followType"
              :rules="[validationRequired]"
              label="Tipo*"
              hide-details="auto"
              persistent-hint
              outlined
              dense
              :search-input.sync="searchInput.followType"
              @input="searchInput.followType = null" />
          </v-col>
        </v-row>

        <v-row :class="isMobile ? '' : 'another-rows'">
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="enterprise"
              :items="$enterprises"
              :rules="[validationRequired]"
              label="Empresa*"
              hide-details="auto"
              persistent-hint
              outlined
              dense
              :search-input.sync="searchInput.enterprise"
              @input="searchInput.enterprise = null" />
          </v-col>

          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="task"
              :items="$taskGroups"
              :rules="[validationRequired]"
              label="Grupo*"
              hide-details="auto"
              persistent-hint
              outlined
              dense
              return-object
              :search-input.sync="searchInput.taskGroup"
              @input="searchInput.taskGroup = null" />
          </v-col>
        </v-row>

        <v-row :class="isMobile ? '' : 'another-rows'">
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="modal"
              :items="modals"
              :rules="[validationRequired]"
              label="Modal*"
              hide-details="auto"
              persistent-hint
              outlined
              dense
              return-object
              :search-input.sync="searchInput.modal"
              @input="searchInput.modal = null"
              @change="
                ($event) => {
                  setOperationsByModal();
                }
              " />
          </v-col>

          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="operation"
              :disabled="!modal"
              :items="operations"
              :rules="[validationRequired]"
              label="Operação*"
              hide-details="auto"
              persistent-hint
              outlined
              dense
              return-object
              :search-input.sync="searchInput.operation"
              @input="searchInput.operation = null" />
          </v-col>
        </v-row>

        <v-row :class="isMobile ? '' : 'another-rows'">
          <v-col cols="12" md="12">
            <v-text-field
              v-model="title"
              :rules="validationTitle"
              maxlength="200"
              label="Título*"
              dense
              outlined
              type="text"
              hide-details="auto" />
          </v-col>
        </v-row>

        <v-row :class="isMobile ? '' : 'another-rows'">
          <v-col cols="12" md="12">
            <Loading v-if="isImproving" />

            <v-textarea
              v-else
              v-model="description"
              :rules="[validationRequired]"
              placeholder="Não se esqueçam de comentar sobre os concorrentes, o principal business do cliente, destinos, volumes e oportunidades abertas para desenvolvimento. Essas informações são essenciais para uma análise mais precisa pela gestão comercial."
              dense
              outlined
              :row-height="getTextAreaHeight"
              :rows="getTextAreaHeight"
              hide-details="auto"
              @click:append="improveFollow">
              <template #append>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon v-bind="attrs" class="ml-2" v-on="on" @click="improveFollow">
                      mdi-auto-fix
                    </v-icon>
                  </template>
                  <span>Melhorar com IAccess</span>
                </v-tooltip>
              </template>
            </v-textarea>
          </v-col>
        </v-row>

        <v-row class="text-center" :class="isMobile ? '' : 'button-row '">
          <v-col cols="12" md="2">
            <v-btn
              v-if="!isImproving"
              text
              class="btnDialog btnSuccess"
              :class="isMobile ? 'btnMobile' : ''"
              @click="validate">
              Salvar Acompanhamento
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>

    <v-row v-else-if="isLoading" class="pa-5 text-center">
      <Loading />
    </v-row>

    <SendMailDialog
      v-if="sendMailStepper"
      :dialog="sendMailStepper"
      :follow-up="followToMail"
      @send-follow-email="sendFollowUpEmail"
      @update-dialog="updateRegisters" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { headSoft, user, toast } from '@/store';
import { isMobileDevice } from '@/utils/utils';
import { formatDateToBr } from '~/utils/formatters';

export default Vue.extend({
  data: () => ({
    isLoading: false,
    newFollowUp: false,
    followDate: new Date().toISOString().split('T')[0],
    menu: false,
    user: null,
    task: null,
    type: null,
    title: '',
    description: '',
    enterprise: null,
    modal: null,
    modals: [],
    id_project: 0,
    operation: null,
    operations: [],
    followType: [
      { value: '1', text: 'Externo' },
      { value: '2', text: 'Interno' },
    ],
    searchInput: {
      users: null,
      taskGroup: null,
      enterprise: null,
      followType: null,
      modal: null,
      operation: null,
    },

    validationTitle: [(v) => v.length <= 200 || 'Max 200 characters'],

    valid: false,
    isImproving: false,
    sendMailStepper: false,
    followToMail: {},
  }),

  computed: {
    formattedDate() {
      return formatDateToBr(this.followDate);
    },

    getTextAreaHeight() {
      const descriptionLength = this.description ? this.description.length : 0;

      if (descriptionLength < 100) return '2';
      if (descriptionLength < 250) return '4';
      if (descriptionLength < 500) return '6';
      if (descriptionLength < 800) return '8';
      if (descriptionLength < 1000) return '10';
      if (descriptionLength < 1200) return '15';
      if (descriptionLength < 1500) return '18';
      if (descriptionLength < 2000) return '20';
      if (descriptionLength < 2500) return '25';

      return '30';
    },

    getUserList() {
      return user.$userList
        .filter((element: any) => element.is_active)
        .map((item: any) => ({
          value: item.id_erp,
          text: item.first_name + ' ' + item.last_name,
        }));
    },

    $userIdErp() {
      return this.$cookies.get('id_erp');
    },

    $taskGroups() {
      return headSoft.$taskGroups.map((item: any) => ({
        value: item.id,
        text: item.name,
      }));
    },

    $enterprises() {
      return headSoft.$enterprises.map((item: any) => ({
        value: item.id,
        text: item.name,
      }));
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    $customerData() {
      return headSoft.$customerData;
    },

    $customerLogisticContracts() {
      return headSoft.$customerLogisticContracts;
    },
  },

  watch: {
    operation(val) {
      const modalSelected = this.modal.value;
      const operationSelected = val.value;

      const foundContracts = this.$customerLogisticContracts.filter((item) => {
        let isModalMatch = false;

        if (modalSelected === 'Modalidade_Aereo') {
          isModalMatch = item.Modalidade_Aereo;
        } else if (modalSelected === 'Modalidade_Maritimo') {
          isModalMatch = item.Modalidade_Maritimo;
        } else if (modalSelected === 'Modalidade_Terrestre') {
          isModalMatch = item.Modalidade_Terrestre;
        }

        let isOperationMatch = false;

        if (operationSelected === 'Operacao_Exportacao') {
          isOperationMatch = item.Operacao_Exportacao;
        } else if (operationSelected === 'Operacao_Importacao') {
          isOperationMatch = item.Operacao_Importacao;
        } else if (operationSelected === 'Operacao_Nacional') {
          isOperationMatch = item.Operacao_Nacional;
        }

        return isModalMatch && isOperationMatch && item.Agenciamento_Carga;
      });

      this.$set(this, 'id_project', foundContracts[0].IdProjeto_Atividade);
    },
  },

  async created() {
    this.$set(this, 'isLoading', true);

    await Promise.all([
      user.getUsers({
        page: 1,
        limit: 99999999,
        search: this.search,
        sortBy: ['first_name'],
        sortDesc: [false],
      }),

      headSoft.getTaskGroups(),

      headSoft.getEnterpriseSystem(),

      headSoft.getLogisticContract(this.$customerData.IdPessoa[0]),
    ]);

    const initialUser = user.$userList
      .filter((item: any) => Number(item.id_erp) === this.$userIdErp)
      .map((item: any) => ({
        value: item.id_erp,
        text: `${item.first_name} ${item.last_name}`,
      }))[0];

    this.$set(this, 'user', initialUser);

    this.$set(this, 'enterprise', this.$enterprises[0]);
    this.$set(this, 'type', this.followType[0]);

    this.setModals();

    this.$set(this, 'isLoading', false);
  },

  methods: {
    saveDate(selectedDate: string) {
      this.followDate = selectedDate;
      this.menu = false;
    },

    async improveFollow() {
      this.$set(this, 'isImproving', true);

      const response = await headSoft.improveFollowUp(this.description);

      if (response.body && response.body.code === 'CREATE_SUCCESS') {
        this.$set(this, 'description', response.body.result);
      } else {
        toast.setToast({
          text: 'Ocorreu um erro ao gerar sugestão',
          type: 'danger',
          time: 3000,
        });
      }

      this.$set(this, 'isImproving', false);
    },

    setOperationsByModal() {
      this.operations = [];

      this.$customerLogisticContracts.forEach((item) => {
        let selectedModalFlag;

        if (this.modal.value === 'Modalidade_Aereo') {
          selectedModalFlag = item.Modalidade_Aereo;
        } else if (this.modal.value === 'Modalidade_Maritimo') {
          selectedModalFlag = item.Modalidade_Maritimo;
        } else if (this.modal.value === 'Modalidade_Terrestre') {
          selectedModalFlag = item.Modalidade_Terrestre;
        }

        if (selectedModalFlag && item.Agenciamento_Carga) {
          if (
            item.Operacao_Exportacao &&
            !this.operations.some((op) => op.value === 'Operacao_Exportacao')
          ) {
            this.operations.push({ value: 'Operacao_Exportacao', text: 'Exportação' });
          }
          if (
            item.Operacao_Importacao &&
            !this.operations.some((op) => op.value === 'Operacao_Importacao')
          ) {
            this.operations.push({ value: 'Operacao_Importacao', text: 'Importação' });
          }
          if (
            item.Operacao_Nacional &&
            !this.operations.some((op) => op.value === 'Operacao_Nacional')
          ) {
            this.operations.push({ value: 'Operacao_Nacional', text: 'Nacional' });
          }
        }
      });
    },

    setModals() {
      this.modals = [];

      this.$customerLogisticContracts.forEach((item) => {
        if (item.Agenciamento_Carga) {
          if (
            item.Modalidade_Aereo &&
            !this.modals.some((modal) => modal.value === 'Modalidade_Aereo')
          ) {
            this.modals.push({ value: 'Modalidade_Aereo', text: 'Aéreo' });
          }
          if (
            item.Modalidade_Maritimo &&
            !this.modals.some((modal) => modal.value === 'Modalidade_Maritimo')
          ) {
            this.modals.push({ value: 'Modalidade_Maritimo', text: 'Marítimo' });
          }
          if (
            item.Modalidade_Terrestre &&
            !this.modals.some((modal) => modal.value === 'Modalidade_Terrestre')
          ) {
            this.modals.push({ value: 'Modalidade_Terrestre', text: 'Terrestre' });
          }
        }
      });
    },

    validationRequired(value: any): Boolean | String {
      if ((value && value.length === 0) || value === 0) {
        return 'Campo Obrigatório.';
      }

      return !!value || 'Campo Obrigatório.';
    },

    newFollow() {
      this.$set(this, 'newFollowUp', true);
    },

    resetFollow() {
      this.$set(this, 'newFollowUp', false);
      this.$set(this, 'followDate', new Date().toISOString().split('T')[0]);
      this.$set(this, 'task', null);
      this.$set(this, 'title', null);
      this.$set(this, 'description', null);
    },

    async addFollowUp() {
      this.$set(this, 'isLoading', true);

      const payloadEmail = {
        IdResponsavel: this.user,
        IdGrupo_Tarefa: this.task,
        IdEmpresa_Sistema: this.enterprise,
        Descricao: this.description,
        Data: this.followDate,
        Tipo: this.type,
        Titulo: this.title,
      };

      const payload = {
        IdResponsavel: this.user.value,
        IdGrupo_Tarefa: this.task.value,
        IdEmpresa_Sistema: this.enterprise.value,
        Descricao: this.description,
        Data: this.followDate,
        Tipo: Number(this.type.value),
        Titulo: this.title,
        IdProjeto_Atividade: Number(this.id_project),
      };

      const response = await headSoft.createFollowUp(payload);

      if (response.body && response.body.code === 'CREATE_SUCCESS') {
        toast.setToast({
          text: 'Acompanhamento cadastrado com sucesso!',
          type: 'success',
          time: 3000,
        });

        this.sendMailStepper = true;
        this.followToMail = payloadEmail;

        await this.resetFollow();
      } else {
        toast.setToast({
          text: 'Ocorreu um erro ao cadastrar o acompanhamento',
          type: 'danger',
          time: 3000,
        });
      }

      this.$set(this, 'isLoading', false);
    },

    sendFollowUpEmail() {
      this.sendMailStepper = false;
      this.followToMail = {};

      this.updateRegisters();
    },

    updateRegisters() {
      this.sendMailStepper = !this.sendMailStepper;

      this.$emit('update-follow-up');
    },

    async validate() {
      this.$refs.form.validate();

      if (this.valid) {
        await this.addFollowUp();
      } else {
        toast.setToast({
          text: 'Existem campos obrigatórios',
          type: 'danger',
          time: 3000,
        });
      }
    },
  },
});
</script>

<style scoped lang="scss">
::v-deep {
  .v-input--selection-controls {
    margin-top: 0px !important;
  }
}

.another-rows {
  margin-top: -25px;
  padding-bottom: 25px;
}

.button-row {
  margin-top: -15px;
  padding-bottom: 20px;
}

.menuMobile {
  height: 35px !important;
}
</style>
