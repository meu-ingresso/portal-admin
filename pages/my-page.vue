<template>
  <v-container fluid class="pa-0">
    <!-- Profile Header Card -->
    <v-card elevation="0" class="mb-6 rounded-lg">
      <v-card-text class="px-8 py-8">
        <v-row align="center" no-gutters>
          <v-col cols="auto" class="mr-4">
            <div class="profile-image-container">
              <v-avatar size="80" class="profile-image">
                <v-img :src="getMyPageImage" :aspect-ratio="1">
                  <template #placeholder>
                    <v-icon size="32">mdi-account</v-icon>
                  </template>
                </v-img>
              </v-avatar>
              <div class="image-upload-overlay" @click="$refs.fileInput.click()">
                <v-icon color="white">mdi-camera</v-icon>
              </div>
            </div>
          </v-col>
          <v-col>
            <div class="d-flex flex-column">
              <div class="text-h6 font-weight-bold">{{ userAlias }}</div>
              <div class="text-body-2 grey--text d-flex align-center">
                <a :href="profileUrl" target="_blank" class="text-truncate">{{ profileUrl }}</a>
              </div>
            </div>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <ButtonWithIcon text="Compartilhar" icon="mdi-share-variant" @click="handleShare" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Statistics Section -->
    <v-row class="center-row mb-6">
      <v-col cols="12">
        <StatisticList :statistics="getStatistics" title="Análises da página" />
      </v-col>
    </v-row>

    <!-- Page Configuration Sections -->
    <v-row class="center-row">
      <v-col cols="12">
        <div class="template-title mb-4">Configurações da página</div>

        <!-- Bio Section -->
        <PageConfigSection
icon="mdi-text" title="Sobre" subtitle="Crie uma bio para exibir aos clientes"
          :loading="isLoading" @save="handleSaveBio" @cancel="handleCancelBio">
                    <RichTextEditorV2
 ref="bioEditor" v-model="biography" placeholder="Apresente-se em poucas palavras..."
            :disabled="isLoading" :max-length="255" :enable-image-upload="false"
            :image-upload-handler="handleBiographyImageUpload" :max-image-size="2 * 1024 * 1024"
            :accepted-image-types="['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']"
            @image-upload-start="handleImageUploadStart" @image-uploaded="handleImageUploaded"
            @image-upload-error="handleImageUploadError" />
        </PageConfigSection>

        <!-- Social Links Section -->
        <PageConfigSection
icon="mdi-link-variant" title="Links" subtitle="Website & mídias sociais"
          :loading="isLoading" @save="handleSaveSocialLinks" @cancel="handleCancelSocialLinks">
          <SocialMediaLinks v-model="socialLinks" @change="handleSocialLinkChange" />
        </PageConfigSection>

        <!-- Contact Info Section -->
        <PageConfigSection
icon="mdi-account-box-outline" title="Informações de contato"
          subtitle="E-mail e telefone para contato" :loading="isLoading" @save="handleSaveContactInfo"
          @cancel="handleCancelContactInfo">
          <ContactForm
ref="contactForm" :contact-email.sync="contactEmail" :contact-phone.sync="contactPhone"
            :disabled="isLoading" />
        </PageConfigSection>
      </v-col>
    </v-row>

        <!-- Hidden file input for profile image -->
    <input
 ref="fileInput" type="file" accept="image/*" style="display: none"
      @change="handleProfileImageUpload($event.target.files[0])">

    <!-- Loading Overlay -->
    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <Toast />

    <ShareProfileSidebar :show="showShareSidebar" :profile-url="profileUrl" @update:show="showShareSidebar = $event" />
  </v-container>
</template>

<script>
import RichTextEditorV2 from '@/components/molecules/RichTextEditorV2.vue';
import { formatRealValue } from '@/utils/formatters';

export default {
  components: {
    RichTextEditorV2,
  },

  // Adicionar listener para avisar sobre mudanças não salvas
  beforeRouteLeave(_to, _from, next) {
    if (this.isEditingBio && this.tempUploadedImages.length > 0) {
      const answer = window.confirm(
        'Você tem alterações não salvas. Suas imagens serão perdidas. Deseja continuar?'
      );
      if (answer) {
        this.cleanupTemporaryImages().then(() => {
          next();
        });
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  data() {
    return {
      isLoading: false,
      userBio: '',
      userAlias: '',
      profileImageUrl: '',
      totalViews: 0,
      totalSales: 0,
      events: [],
      totalEvents: 0,
      totalTickets: 0,
      totalRevenue: 0,
      biography: '',
      originalBiography: '', // Para rastrear estado original
      socialLinks: {},
      originalSocialLinks: {},
      showShareSidebar: false,
      contactEmail: '',
      contactPhone: '',
      originalContactInfo: {
        email: '',
        showEmail: false,
        phone: '',
        showPhone: false
      },
      // Controle de imagens temporárias
      tempUploadedImages: [], // IDs das imagens enviadas durante esta sessão de edição
      isEditingBio: false, // Flag para controlar se está em modo de edição
    };
  },

  computed: {
    userId() {
      return this.$store.state.auth.user?.id;
    },
    profileUrl() {
      return `https://vitrine.meuingresso.com.br/produtores/${this.userAlias}`;
    },
    getStatistics() {
      return [
        {
          title: 'Visualizações',
          value: `${this.events.reduce((sum, event) => sum + (event.totalizers.totalViews || 0), 0)}`,
        },
        {
          title: 'Vendas',
          value: `${formatRealValue(this.events.reduce((sum, event) => sum + (event.totalizers.totalSales || 0), 0))}`,
        },
        {
          title: 'Receita',
          value: `${formatRealValue(this.events.reduce((sum, event) => sum + (event.totalizers.totalSalesAmount || 0), 0))}`,
        },
      ];
    },

    getMyPageImage() {
      return this.profileImageUrl || require('~/assets/images/default_avatar.svg');
    }
  },

  mounted() {
    this.fetchData();
  },

  async beforeDestroy() {
    // Cleanup automático de imagens temporárias ao sair da página
    if (this.isEditingBio && this.tempUploadedImages.length > 0) {
      console.log('Página sendo fechada, limpando imagens temporárias...');
      await this.cleanupTemporaryImages();
    }
  },

  methods: {
    formatRealValue,

    async fetchData() {
      try {
        this.isLoading = true;
        await this.$store.dispatch('userDocuments/fetchDocumentStatus', this.userId);
        const resultEvents = await this.$store.dispatch('event/fetchEventsByPromoterId', {
          promoterId: this.userId,
          preloads: ['status', 'tickets', 'attachments']
        });

        this.events = resultEvents.map(event => ({
          ...event,
          link_online: event.attachments.find(attachment => attachment.name === 'link_online')?.url || '',
        }));

        const userAttachments = this.$store.getters['userDocuments/$userAttachments'];
        const userInfo = this.$auth.user;

        const bioDoc = userAttachments.find(doc => doc.name === 'biography');
        const profileImageDoc = userAttachments.find(doc => doc.name === 'profile_image');
        const socialLinksDoc = userAttachments.find(doc => doc.name === 'social_links');
        const contactInfoDoc = userAttachments.find(doc => doc.name === 'contact_info');

        this.biography = bioDoc?.value || '';
        this.userAlias = userInfo.alias;
        this.profileImageUrl = profileImageDoc?.value || '';
        this.socialLinks = socialLinksDoc ? JSON.parse(socialLinksDoc.value) : {};
        this.originalSocialLinks = { ...this.socialLinks };

        // Inicializar estado original da biografia
        this.originalBiography = this.biography;

        if (contactInfoDoc) {
          const contactInfo = JSON.parse(contactInfoDoc.value);
          this.contactEmail = contactInfo.email || userInfo.email || '';
          this.contactPhone = contactInfo.phone || '';
        } else {
          this.contactEmail = userInfo.email || '';
          this.contactPhone = '';
        }

        this.originalContactInfo = {
          email: this.contactEmail,
          phone: this.contactPhone,
        };

      } catch (error) {
        console.error('Error fetching user data:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao carregar dados do usuário',
          type: 'error',
          time: 5000
        });
      } finally {
        this.isLoading = false;
      }
    },

    // Método específico para upload da imagem de perfil
    async handleProfileImageUpload(file) {
      try {
        this.isLoading = true;

        const userAttachments = this.$store.getters['userDocuments/$userAttachments'];
        const profileImageDoc = userAttachments.find(doc => doc.name === 'profile_image');

        let imageUrl;

        if (profileImageDoc) {
          // Se já existe um attachment de profile_image, atualiza ele
          imageUrl = await this.$store.dispatch('userDocuments/uploadUserDocument', {
            documentFile: file,
            attachmentId: profileImageDoc.id
          });
        } else {
          // Se não existe, cria um novo attachment com name 'profile_image'
          const newImageDoc = await this.$store.dispatch('userDocuments/createUserDocument', {
            name: 'profile_image',
            type: 'image',
            userId: this.userId
          });

          imageUrl = await this.$store.dispatch('userDocuments/uploadUserDocument', {
            documentFile: file,
            attachmentId: newImageDoc.id
          });
        }

        // Atualizar a URL da imagem de perfil localmente
        this.profileImageUrl = imageUrl;

        this.$store.dispatch('toast/setToast', {
          text: 'Imagem de perfil atualizada com sucesso',
          type: 'success',
          time: 5000
        });

        return imageUrl;

      } catch (error) {
        console.error('Erro no upload da imagem de perfil:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao atualizar imagem de perfil',
          type: 'error',
          time: 5000
        });
      } finally {
        this.isLoading = false;
      }
    },

    // Método para upload de imagens na biografia (sistema temporário)
    async handleBiographyImageUpload(file) {
      try {
        this.isLoading = true;

        // Gerar nome temporário com timestamp e identificador
        const timestamp = Date.now();
        const tempName = `temp_${timestamp}_biography_${file.name}`;

        // Criar documento de imagem temporário
        const imageDoc = await this.$store.dispatch('userDocuments/createUserDocument', {
          name: tempName,
          type: 'image',
          userId: this.userId
        });

        // Upload da imagem
        const imageUrl = await this.$store.dispatch('userDocuments/uploadUserDocument', {
          documentFile: file,
          attachmentId: imageDoc.id
        });

        // Adicionar à lista de imagens temporárias desta sessão
        this.tempUploadedImages.push({
          id: imageDoc.id,
          name: tempName,
          url: imageUrl,
          fileName: file.name,
          uploadedAt: timestamp
        });

        return imageUrl;

      } catch (error) {
        console.error('Erro no upload da imagem:', error);
        throw new Error('Falha no upload da imagem: ' + error.message);
      } finally {
        this.isLoading = false;
      }
    },

    handleShare() {
      this.showShareSidebar = true;
    },

    async handleSaveBio() {
      try {
        this.isLoading = true;

        // Confirmar imagens temporárias antes de salvar
        await this.makeImagesPermanent();

        const userAttachments = this.$store.getters['userDocuments/$userAttachments'];
        const bioDoc = userAttachments.find(doc => doc.name === 'biography');

        if (bioDoc) {
          await this.$store.dispatch('userDocuments/updateUserAttachment', {
            id: bioDoc.id,
            value: this.biography
          });
        } else {
          await this.$store.dispatch('userDocuments/createUserDocument', {
            name: 'biography',
            type: 'text',
            userId: this.userId,
            value: this.biography
          });
        }

        // Atualizar estado original após salvamento bem-sucedido
        this.originalBiography = this.biography;
        this.isEditingBio = false;

        this.$store.dispatch('toast/setToast', {
          text: 'Biografia atualizada com sucesso',
          type: 'success',
          time: 5000
        });
      } catch (error) {
        console.error('Error saving bio:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao atualizar biografia',
          type: 'error',
          time: 5000
        });
      } finally {
        this.isLoading = false;
      }
    },

    async handleCancelBio() {
      try {
        // Limpar imagens temporárias antes de cancelar
        await this.cleanupTemporaryImages();

        // Restaurar conteúdo original
        const userAttachments = this.$store.getters['userDocuments/$userAttachments'];
        const bioDoc = userAttachments.find(doc => doc.name === 'biography');
        this.biography = bioDoc?.value || '';
        this.originalBiography = this.biography;
        this.isEditingBio = false;

        if (this.tempUploadedImages.length > 0) {
          this.$store.dispatch('toast/setToast', {
            text: 'Edição cancelada. Imagens temporárias foram removidas.',
            type: 'info',
            time: 5000
          });
        }
      } catch (error) {
        console.error('Error canceling bio edit:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao cancelar edição',
          type: 'error',
          time: 5000
        });
      }
    },

    async handleSaveSocialLinks() {
      try {
        this.isLoading = true;
        const userAttachments = this.$store.getters['userDocuments/$userAttachments'];
        const socialLinksDoc = userAttachments.find(doc => doc.name === 'social_links');

        if (socialLinksDoc) {
          await this.$store.dispatch('userDocuments/updateUserAttachment', {
            id: socialLinksDoc.id,
            value: JSON.stringify(this.socialLinks)
          });
        } else {
          await this.$store.dispatch('userDocuments/createUserDocument', {
            name: 'social_links',
            type: 'json',
            userId: this.userId,
            value: JSON.stringify(this.socialLinks)
          });
        }

        this.originalSocialLinks = { ...this.socialLinks };
        this.$store.dispatch('toast/setToast', {
          text: 'Links atualizados com sucesso',
          type: 'success',
          time: 5000
        });
      } catch (error) {
        console.error('Error saving social links:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao atualizar links',
          type: 'error',
          time: 5000
        });
      } finally {
        this.isLoading = false;
      }
    },

    handleCancelSocialLinks() {
      this.socialLinks = { ...this.originalSocialLinks };
    },

    async handleSaveContactInfo() {
      try {
        // Verificar se o formulário é válido antes de salvar
        const contactForm = this.$refs.contactForm;
        if (!contactForm || !contactForm.isFormValid()) {
          this.$store.dispatch('toast/setToast', {
            text: 'Por favor, corrija os erros no formulário antes de salvar',
            type: 'error',
            time: 5000
          });
          return;
        }

        this.isLoading = true;
        const userAttachments = this.$store.getters['userDocuments/$userAttachments'];
        const contactInfoDoc = userAttachments.find(doc => doc.name === 'contact_info');

        const contactInfo = {
          email: this.contactEmail,
          phone: this.contactPhone,
        };

        if (contactInfoDoc) {
          await this.$store.dispatch('userDocuments/updateUserAttachment', {
            id: contactInfoDoc.id,
            value: JSON.stringify(contactInfo)
          });
        } else {
          await this.$store.dispatch('userDocuments/createUserDocument', {
            name: 'contact_info',
            type: 'json',
            userId: this.userId,
            value: JSON.stringify(contactInfo)
          });
        }

        this.originalContactInfo = { ...contactInfo };
        this.$store.dispatch('toast/setToast', {
          text: 'Informações de contato atualizadas com sucesso',
          type: 'success',
          time: 5000
        });
      } catch (error) {
        console.error('Error saving contact info:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao atualizar informações de contato',
          type: 'error',
          time: 5000
        });
      } finally {
        this.isLoading = false;
      }
    },

    handleCancelContactInfo() {
      this.contactEmail = this.originalContactInfo.email;
      this.contactPhone = this.originalContactInfo.phone;
    },

    handleSocialLinkChange({ type, value }) {
      console.log(`Social link changed: ${type} = ${value}`);
    },

    handleImageUploadStart(file) {
      console.log('Iniciando upload da imagem:', file.name);
      this.isEditingBio = true; // Marca que está editando
    },

    handleImageUploaded({ file, url }) {
      console.log('Imagem enviada com sucesso:', file.name, url);
      this.$store.dispatch('toast/setToast', {
        text: `Imagem "${file.name}" enviada com sucesso`,
        type: 'success',
        time: 5000
      });
    },

    handleImageUploadError({ file, error }) {
      console.error('Erro no upload da imagem:', file?.name, error);
      this.$store.dispatch('toast/setToast', {
        text: `Erro ao enviar imagem: ${error}`,
        type: 'error',
        time: 5000
      });
    },

    // Método para deletar imagens temporárias
    async cleanupTemporaryImages() {
      if (this.tempUploadedImages.length === 0) return;

      try {
        console.log('Limpando imagens temporárias:', this.tempUploadedImages.length);

        const deletePromises = this.tempUploadedImages.map(async (image) => {
          try {
            await this.$store.dispatch('userDocuments/deleteUserAttachment', image.id);
            console.log(`Imagem temporária deletada: ${image.fileName}`);
          } catch (error) {
            console.error(`Erro ao deletar imagem ${image.fileName}:`, error);
          }
        });

        await Promise.allSettled(deletePromises);
        this.tempUploadedImages = [];

      } catch (error) {
        console.error('Erro na limpeza de imagens temporárias:', error);
      }
    },

    // Método para marcar imagens como permanentes (renomear para nome definitivo)
    async makeImagesPermanent() {
      if (this.tempUploadedImages.length === 0) return;

      try {
        const updatePromises = this.tempUploadedImages.map(async (image) => {
          try {
            // Gerar nome permanente removendo o prefixo 'temp_' e timestamp
            const permanentName = `biography_image_${Date.now()}_${image.fileName}`;

            await this.$store.dispatch('userDocuments/updateUserAttachment', {
              id: image.id,
              name: permanentName
            });

            console.log(`Imagem confirmada: ${image.fileName} -> ${permanentName}`);
          } catch (error) {
            console.error(`Erro ao confirmar imagem ${image.fileName}:`, error);
          }
        });

        await Promise.allSettled(updatePromises);
        this.tempUploadedImages = [];

      } catch (error) {
        console.error('Erro ao confirmar imagens:', error);
      }
    }
  }
}
</script>

<style scoped>
.profile-image-container {
  position: relative;
  display: inline-block;
}

.profile-image {
  border: 2px solid var(--v-primary-base);
  transition: all 0.3s ease;
}

.image-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.upload-text {
  color: white;
  font-size: 12px;
  margin-top: 4px;
}

.profile-image-container:hover .image-upload-overlay {
  opacity: 1;
}

.center-row {
  max-width: 1200px;
  margin: 0 auto;
}

.template-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--v-primary-base);
}

/* Add card styling */
.v-card {
  transition: all 0.3s ease;
}

.custom-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>