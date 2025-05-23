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
                <v-icon small class="mr-1">mdi-link</v-icon>
                <span class="text-truncate">{{ profileUrl }}</span>
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
      </v-col>

      <v-col cols="12">
        <!-- Bio Section -->
        <PageConfigSection icon="mdi-text" title="Sobre" subtitle="Crie uma bio para exibir aos clientes"
          :loading="isLoading" @save="handleSaveBio" @cancel="handleCancelBio">
          <RichTextEditorV2 ref="bioEditor" v-model="biography" placeholder="Apresente-se em poucas palavras..."
            :disabled="isLoading" :max-length="255" />
        </PageConfigSection>

        <!-- Social Links Section -->
        <PageConfigSection icon="mdi-link-variant" title="Links" subtitle="Website & mídias sociais"
          :loading="isLoading" @save="handleSaveSocialLinks" @cancel="handleCancelSocialLinks">
          <SocialMediaLinks v-model="socialLinks" @change="handleSocialLinkChange" />
        </PageConfigSection>

        <!-- Contact Info Section -->
        <PageConfigSection icon="mdi-account-box-outline" title="Informações de contato"
          subtitle="E-mail e telefone para contato" :loading="isLoading" @save="handleSaveContactInfo"
          @cancel="handleCancelContactInfo">
          <ContactForm ref="contactForm" :contact-email.sync="contactEmail" :contact-phone.sync="contactPhone"
            :disabled="isLoading" />
        </PageConfigSection>
      </v-col>
    </v-row>

    <!-- Hidden file input for profile image -->
    <input ref="fileInput" type="file" accept="image/*" style="display: none"
      @change="handleImageUpload($event.target.files[0])">

    <!-- Loading Overlay -->
    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <Toast />

    <ShareProfileSidebar :show="showShareSidebar" :profile-url="profileUrl" @update:show="showShareSidebar = $event" />
  </v-container>
</template>

<script>
import { user, userDocuments, toast, event } from '@/utils/store-util';
import { formatRealValue } from '@/utils/formatters';

export default {

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
      }
    };
  },

  computed: {
    userId() {
      return this.$cookies.get('user_id');
    },
    profileUrl() {
      return `${window.location.origin}/p/${this.userAlias}`;
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

  methods: {
    formatRealValue,

    async fetchData() {
      try {
        this.isLoading = true;
        await userDocuments.fetchDocumentStatus(this.userId);
        const resultEvents = await event.fetchEventsByPromoterId({ promoterId: this.userId, preloads: ['status', 'tickets', 'attachments'] });

        this.events = resultEvents.map(event => ({
          ...event,
          link_online: event.attachments.find(attachment => attachment.name === 'link_online')?.url || '',
        }));

        const bioDoc = userDocuments.$userAttachments.find(doc => doc.name === 'biography');
        const profileImageDoc = userDocuments.$userAttachments.find(doc => doc.name === 'profile_image');
        const socialLinksDoc = userDocuments.$userAttachments.find(doc => doc.name === 'social_links');
        const contactInfoDoc = userDocuments.$userAttachments.find(doc => doc.name === 'contact_info');

        this.biography = bioDoc?.value || '';
        this.userAlias = user.$user.alias;
        this.profileImageUrl = profileImageDoc?.value || '';
        this.socialLinks = socialLinksDoc ? JSON.parse(socialLinksDoc.value) : {};
        this.originalSocialLinks = { ...this.socialLinks };

        if (contactInfoDoc) {
          const contactInfo = JSON.parse(contactInfoDoc.value);
          this.contactEmail = contactInfo.email || user.$user.email || '';
          this.contactPhone = contactInfo.phone || '';
        } else {
          this.contactEmail = user.$user.email || '';
          this.contactPhone = '';
        }

        this.originalContactInfo = {
          email: this.contactEmail,
          phone: this.contactPhone,
        };

      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.setToast({ text: 'Erro ao carregar dados do usuário', type: 'error', time: 3000 });
      } finally {
        this.isLoading = false;
      }
    },

    async handleImageUpload(file) {
      try {
        this.isLoading = true;

        let profileImageDoc = userDocuments.$userAttachments.find(doc => doc.name === 'profile_image');

        if (!profileImageDoc) {
          profileImageDoc = await userDocuments.createUserDocument({
            name: 'profile_image',
            type: 'image',
            userId: this.userId
          });
        }

        const imageUrl = await userDocuments.uploadUserDocument({
          documentFile: file,
          attachmentId: profileImageDoc.id
        });

        this.profileImageUrl = imageUrl;
        toast.setToast({ text: 'Foto de perfil atualizada com sucesso', type: 'success', time: 3000 });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.setToast({ text: 'Erro ao atualizar foto de perfil', type: 'error', time: 3000 });
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
        const bioDoc = userDocuments.$userAttachments.find(doc => doc.name === 'biography');

        if (bioDoc) {
          await userDocuments.updateUserAttachment({
            id: bioDoc.id,
            value: this.biography
          });
        } else {
          await userDocuments.createUserDocument({
            name: 'biography',
            type: 'text',
            userId: this.userId,
            value: this.biography
          });
        }

        toast.setToast({ text: 'Biografia atualizada com sucesso', type: 'success', time: 3000 });
      } catch (error) {
        console.error('Error saving bio:', error);
        toast.setToast({ text: 'Erro ao atualizar biografia', type: 'error', time: 3000 });
      } finally {
        this.isLoading = false;
      }
    },

    handleCancelBio() {
      const bioDoc = userDocuments.$userAttachments.find(doc => doc.name === 'biography');
      this.biography = bioDoc?.value || '';
    },

    async handleSaveSocialLinks() {
      try {
        this.isLoading = true;
        const socialLinksDoc = userDocuments.$userAttachments.find(doc => doc.name === 'social_links');

        if (socialLinksDoc) {
          await userDocuments.updateUserAttachment({
            id: socialLinksDoc.id,
            value: JSON.stringify(this.socialLinks)
          });
        } else {
          await userDocuments.createUserDocument({
            name: 'social_links',
            type: 'json',
            userId: this.userId,
            value: JSON.stringify(this.socialLinks)
          });
        }

        this.originalSocialLinks = { ...this.socialLinks };
        toast.setToast({ text: 'Links atualizados com sucesso', type: 'success', time: 3000 });
      } catch (error) {
        console.error('Error saving social links:', error);
        toast.setToast({ text: 'Erro ao atualizar links', type: 'error', time: 3000 });
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
          toast.setToast({ text: 'Por favor, corrija os erros no formulário antes de salvar', type: 'error', time: 3000 });
          return;
        }

        this.isLoading = true;
        const contactInfoDoc = userDocuments.$userAttachments.find(doc => doc.name === 'contact_info');

        const contactInfo = {
          email: this.contactEmail,
          phone: this.contactPhone,
        };

        if (contactInfoDoc) {
          await userDocuments.updateUserAttachment({
            id: contactInfoDoc.id,
            value: JSON.stringify(contactInfo)
          });
        } else {
          await userDocuments.createUserDocument({
            name: 'contact_info',
            type: 'json',
            userId: this.userId,
            value: JSON.stringify(contactInfo)
          });
        }

        this.originalContactInfo = { ...contactInfo };
        toast.setToast({ text: 'Informações de contato atualizadas com sucesso', type: 'success', time: 3000 });
      } catch (error) {
        console.error('Error saving contact info:', error);
        toast.setToast({ text: 'Erro ao atualizar informações de contato', type: 'error', time: 3000 });
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