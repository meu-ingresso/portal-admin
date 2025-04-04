<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card tile flat>
          <v-card-text class="px-8 py-8">
            <v-row align="center" no-gutters>
              <v-col cols="auto" class="mr-4">
                <v-avatar size="64" class="profile-image">
                  <v-img :src="profileImageUrl || '/default_avatar.svg'" @click="$refs.fileInput.click()">
                    <template #placeholder>
                      <v-icon size="32">mdi-account</v-icon>
                    </template>
                  </v-img>
                </v-avatar>
              </v-col>
              <v-col>
                <div class="d-flex flex-column">
                  <div class="text-h6 font-weight-bold">{{ userAlias }}</div>
                  <div class="text-body-2 grey--text">
                    <v-icon small class="mr-1">mdi-link</v-icon>
                    {{ profileUrl }}
                  </div>
                </div>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="auto">
                <ButtonWithIcon
                  text="Compartilhar"
                  icon="mdi-share-variant"
                  @click="handleShare"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Statistics Cards 
    <v-row class="center-row mb-6">

      <v-col cols="12"> 
        <div class="template-title">Análises da página</div>
      </v-col>

      <v-col v-for="(stat, index) in getStatistics" :key="index" cols="12" sm="6" md="4">
        <v-card tile flat class="stat-card">
          <v-card-text>
            <div class="d-flex flex-column">
              <div class="text-h4 font-weight-bold primary--text">{{ stat.value }}</div>
              <div class="text-body-2 grey--text text--darken-1">{{ stat.title }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    -->

    <v-row class="center-row mb-6 mt-6">
      <v-col cols="12"> 
        <StatisticList :statistics="getStatistics" title="Análises da página" />
      </v-col>
    </v-row>


    <!-- Configurações da página -->
    <v-row class="center-row">
      <v-col cols="12">
        <div class="template-title">Configurações da página</div>
      </v-col>
      
      <v-col cols="12">
        <PageConfigSection
          icon="mdi-text"
          title="Sobre"
          subtitle="Crie uma bio para exibir aos clientes"
          :loading="isLoading"
          @save="handleSaveBio"
          @cancel="handleCancelBio"
        >
          <RichTextEditor
            ref="bioEditor"
            v-model="biography"
            placeholder="Apresente-se em poucas palavras..."
            :actions="['bold', 'italic', 'list']"
            :disabled="isLoading"
          />
        </PageConfigSection>

        <PageConfigSection
          icon="mdi-link-variant"
          title="Links"
          subtitle="Website & mídias sociais"
          :loading="isLoading"
          @save="handleSaveSocialLinks"
          @cancel="handleCancelSocialLinks"
        >
          <SocialMediaLinks
            v-model="socialLinks"
            @change="handleSocialLinkChange"
          />
        </PageConfigSection>

        <PageConfigSection
          icon="mdi-account-box-outline"
          title="Informações de contato"
          subtitle="E-mail e telefone para contato"
          :loading="isLoading"
          @save="handleSaveContactInfo"
          @cancel="handleCancelContactInfo"
        >
          <v-row>
            <v-col cols="12" sm="6">
              <v-card tile flat>
                <v-card-text>
                  <v-text-field
                    v-model="contactEmail"
                    label="E-mail para contato"
                    outlined
                    dense
                    :disabled="isLoading"
                  ></v-text-field>
                  <v-checkbox
                    v-model="showContactEmail"
                    label="Exibir meu email de contato na minha página"
                    :disabled="isLoading"
                    class="mt-0"
                  ></v-checkbox>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card tile flat>
                <v-card-text>
                  <v-text-field
                    v-model="contactPhone"
                    label="Telefone para contato"
                    outlined
                    max-length="15"
                    dense
                    :disabled="isLoading"
                    @input="formatPhoneInput"
                  ></v-text-field>
                  <v-checkbox
                    v-model="showContactPhone"
                    label="Exibir meu telefone de contato na minha página"
                    :disabled="isLoading"
                    class="mt-0"
                  ></v-checkbox>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </PageConfigSection>
      </v-col>
    </v-row>

    <!-- Hidden file input for profile image -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleImageUpload($event.target.files[0])"
    >

    <!-- Loading Overlay -->
    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <Toast />

    <ShareProfileSidebar
      :show="showShareSidebar"
      :profile-url="profileUrl"
      @update:show="showShareSidebar = $event"
    />
  </v-container>
</template>

<script>
import { user, userDocuments, toast, event } from '@/utils/store-util';
import { formatRealValue, onFormatCellphone } from '@/utils/formatters';

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
      showContactEmail: false,
      contactPhone: '',
      showContactPhone: false,
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
          this.showContactEmail = contactInfo.showEmail || false;
          this.contactPhone = contactInfo.phone || '';
          this.showContactPhone = contactInfo.showPhone || false;
        } else {
          // Default to user's email
          this.contactEmail = user.$user.email || '';
          this.showContactEmail = false;
          this.contactPhone = '';
          this.showContactPhone = false;
        }
        
        this.originalContactInfo = {
          email: this.contactEmail,
          showEmail: this.showContactEmail,
          phone: this.contactPhone,
          showPhone: this.showContactPhone
        };
        
        // Fetch statistics from API (you'll need to implement this endpoint)
        // For now using dummy data
        this.totalViews = 1234;
        this.totalSales = 56;
        this.totalRevenue = 12345.67;
        
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
        this.isLoading = true;
        const contactInfoDoc = userDocuments.$userAttachments.find(doc => doc.name === 'contact_info');
        
        const contactInfo = {
          email: this.contactEmail,
          showEmail: this.showContactEmail,
          phone: this.contactPhone,
          showPhone: this.showContactPhone
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
      this.showContactEmail = this.originalContactInfo.showEmail;
      this.contactPhone = this.originalContactInfo.phone;
      this.showContactPhone = this.originalContactInfo.showPhone;
    },

    handleSocialLinkChange({ type, value }) {
      // You can add specific validation or formatting here if needed
      console.log(`Social link changed: ${type} = ${value}`);
    },

    formatPhoneInput() {
      if (!this.contactPhone) return;
      this.contactPhone = onFormatCellphone(this.contactPhone);
    }
  }
}
</script>

<style scoped>
.profile-image {
  border: 2px solid var(--v-primary-base);
  cursor: pointer;
}

.center-row {
  max-width: 1200px;
  margin: 0 auto;
}

.bio-textarea {
  background-color: white;
}
</style>