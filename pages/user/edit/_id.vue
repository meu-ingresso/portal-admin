<template>
  <v-container class="user-edit-page">
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card>
          <v-card-title class="headline">
            Editar Perfil
          </v-card-title>
          <v-card-text>
            <user-edit-form 
              :loading="isLoading" 
              :user="$user" 
              @submit="handleSubmit"
              @cancel="handleCancel" 
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <confirm-dialog
      v-model="dialog.show"
      :title="dialog.title"
      :message="dialog.message"
      :loading="dialog.loading"
      :loading-text="dialog.loadingText"
      @confirm="confirmUpdate"
    />
  </v-container>
</template>

<script>
import { user, loading, toast } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default {
  data() {
    return {
      dialog: {
        show: false,
        title: 'Confirmar alterações',
        message: 'Tem certeza que deseja salvar as alterações em seu perfil?',
        loading: false,
        loadingText: 'Salvando alterações...',
      }
    };
  },

  async fetch() {
    try {
      loading.setIsLoading(true);
      await user.get(this.$route.params.id);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.setToast({
        text: 'Erro ao carregar dados do usuário',
        type: 'error',
        time: 5000,
      });
    } finally {
      loading.setIsLoading(false);
    }
  },

  computed: {
    isLoading() {
      return loading.$isLoading;
    },
    $user() {
      return user.$user;
    },
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    handleSubmit() {
      this.dialog.show = true;
    },

    handleCancel() {
      this.$router.push('/');
    },

    async confirmUpdate() {
      try {
        this.dialog.loading = true;
        const response = await user.update();
        
        if (response && response.body && response.body.code === 'UPDATE_SUCCESS') {
          toast.setToast({
            text: 'Perfil atualizado com sucesso!',
            type: 'success',
            time: 5000,
          });
          this.dialog.show = false;
          this.$router.push('/');
        } else {
          throw new Error('Erro ao atualizar perfil');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        toast.setToast({
          text: 'Erro ao atualizar perfil',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.dialog.loading = false;
      }
    },
  },
};
</script> 

<style scoped>
.user-edit-page {
  max-width: 1440px;
  margin: 0 auto;
}
</style>