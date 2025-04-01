<template>
  <v-container :class="{'mobile-container': $vuetify.breakpoint.smAndDown}">

    <!-- Mobile -->
    <v-row v-if="$vuetify.breakpoint.smAndDown">
      <v-col cols="12" class="pa-0">
        <div class="profile-top">
          <div class="d-flex justify-space-between pa-4">
            <v-btn icon @click="$router.go(-1)">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn icon @click="showEditDialog = true">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </div>
          
          <div class="profile-content text-center">
            <div class="profile-image-wrapper mx-auto mb-3">
              <v-avatar size="120" class="profile-image">
                <v-img :src="profileImageUrl || '/default_avatar.svg'" @click="$refs.fileInput.click()"></v-img>
                <div class="image-overlay" @click="$refs.fileInput.click()">
                  <v-icon color="white">mdi-camera</v-icon>
                </div>
              </v-avatar>
            </div>
            <div class="display-name">{{ userAlias }}</div>
            <div class="occupation">{{ userBio || 'Adicione sua biografia' }}</div>
            
            <div class="social-icons mt-4">
              <v-btn icon class="mx-1" color="primary">
                <v-icon>mdi-linkedin</v-icon>
              </v-btn>
              <v-btn icon class="mx-1" color="pink">
                <v-icon>mdi-dribbble</v-icon>
              </v-btn>
              <v-btn icon class="mx-1" color="blue">
                <v-icon>mdi-behance</v-icon>
              </v-btn>
              <v-btn icon class="mx-1" color="purple">
                <v-icon>mdi-instagram</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Dark Card Section -->
        <div class="info-card">
          <div class="info-card-content">
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-value">{{ events.length }}</div>
                <div class="stat-label">Eventos</div>
              </div>
              <v-divider vertical></v-divider>
              <div class="stat-item">
                <div class="stat-value">{{ totalTickets }}</div>
                <div class="stat-label">Ingressos</div>
              </div>
              <v-divider vertical></v-divider>
              <div class="stat-item">
                <div class="stat-value">{{ formatRealValue(totalRevenue) }}</div>
                <div class="stat-label">Receita</div>
              </div>
            </div>

            <div class="events-section">
              <div class="section-title">Meus Eventos</div>
              
              <div v-if="events.length === 0" class="no-events">
                <v-icon size="64" color="grey lighten-1">mdi-calendar-blank</v-icon>
                <div class="mt-2">Nenhum evento encontrado</div>
              </div>
              
              <v-card 
                v-for="event in events" 
                :key="event.id" 
                class="event-card mb-4" 
                @click="viewEvent(event.id)"
              >
                <div class="event-date">
                  <div class="date-day">{{ formatDay(event.start_date) }}</div>
                  <div class="date-month">{{ formatMonth(event.start_date) }}</div>
                </div>
                <div class="event-details">
                  <div class="event-name">{{ event.name }}</div>
                  <div class="event-location">
                    <v-icon small class="mr-1">mdi-map-marker</v-icon>
                    {{ event.location_name }}
                  </div>
                </div>
                <div class="event-stats">
                  <div class="event-stat">
                    <v-icon small>mdi-ticket</v-icon>
                    <span>{{ event.totalizers.totalSales || 0 }}</span>
                  </div>
                  <div class="event-stat">
                    <span>{{ formatRealValue(event.totalizers.totalSalesAmount || 0) }}</span>
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Desktop -->
    <v-row v-else>
      <v-col cols="12">
        <div class="desktop-header d-flex align-center mb-6">
          <v-btn icon class="mr-2" @click="$router.go(-1)">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-bold">Minha página</h1>
        </div>
        
        <v-row>
          <!-- Profile Card -->
          <v-col cols="12" md="4" lg="3">
            <v-card class="profile-card" elevation="2">
              <v-card-text class="text-center">
                <div class="profile-image-wrapper mx-auto my-4">
                  <v-avatar size="150" class="profile-image">
                    <v-img :src="profileImageUrl || '/default_avatar.svg'"></v-img>
                    <div class="image-overlay" @click="$refs.fileInput.click()">
                      <v-icon color="white">mdi-camera</v-icon>
                    </div>
                  </v-avatar>
                </div>
                
                <div class="d-flex align-center justify-center mb-2">
                  <h2 class="text-h5 font-weight-bold mr-2">{{ userAlias }}</h2>
                  <v-btn icon small @click="showEditDialog = true">
                    <v-icon small>mdi-pencil</v-icon>
                  </v-btn>
                </div>
                
                <p class="text-body-1 text-center grey--text mb-4">
                  {{ userBio || 'Adicione sua biografia' }}
                </p>
                
                <div class="social-icons mb-4">
                  <v-btn icon class="mx-1" color="purple">
                    <v-icon>mdi-instagram</v-icon>
                  </v-btn>
                </div>
                
                <v-divider class="my-4"></v-divider>
                
                <div class="stats-grid">
                  <div class="stat-box">
                    <div class="stat-value primary--text">{{ events.length }}</div>
                    <div class="stat-label">Eventos</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value primary--text">{{ totalTickets }}</div>
                    <div class="stat-label">Ingressos</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value primary--text">{{ formatRealValue(totalRevenue) }}</div>
                    <div class="stat-label">Receita</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <!-- Events and Analytics -->
          <v-col cols="12" md="8" lg="9">
            
            <StatisticList :statistics="getStatistics" title="Visão geral" />

            <v-row class="mb-4">
              <v-col cols="12">
                <div class="template-title">Meus Eventos</div>
              </v-col>
              <v-col cols="12" md="12" sm="12">
                <EmptyState
                  v-if="events.length === 0"
                  title="Nenhum evento encontrado"
                  subtitle="Crie seu primeiro evento para começar a vender ingressos"
                  icon="mdi-calendar-blank">
                  <template #action>
                    <DefaultButton
                      text="Criar evento"
                      icon="mdi-plus"
                      @click="createEvent"
                    />
                  </template>
                </EmptyState>
              <v-data-table
                v-else
                :headers="eventHeaders"
                :items="events"
                :items-per-page="5"
                class="elevation-0"
                @click:row="(item) => viewEvent(item.id)"
              >
                <template #item.start_date="{ item }">
                  {{ new Date(item.start_date).toLocaleDateString('pt-BR') }}
                </template>
                
                <template #item.status.name="{ item }">
                  <StatusBadge :text="item.status.name" />
                </template>
                
                <template #item.totalizers.totalSales="{ item }">
                  {{ item.totalizers.totalSales || 0 }}
                </template>
                
                <template #item.totalizers.totalSalesAmount="{ item }">
                  {{ formatRealValue(item.totalizers.totalSalesAmount || 0) }}
                </template>
                
                <template #item.actions="{ item }">
                  <v-btn icon small @click.stop="viewEvent(item.id)">
                    <v-icon small>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn icon small @click.stop="editEvent(item.id)">
                    <v-icon small>mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>


    <!-- Edit Profile Dialog for Mobile -->
    <v-dialog v-model="showEditDialog" fullscreen transition="dialog-bottom-transition">
      <v-card tile flat>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showEditDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Editar Perfil</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="saveProfileChanges">
              Salvar
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <div class="text-center my-4">
                <v-avatar size="120" class="profile-image">
                  <v-img :src="profileImageUrl || '/default_avatar.svg'"></v-img>
                </v-avatar>
                <div class="mt-2">
                  <v-btn color="primary" text @click="$refs.fileInput.click()">
                    <v-icon left>mdi-camera</v-icon>
                    Alterar foto
                  </v-btn>
                </div>
              </div>
            </v-list-item-content>
          </v-list-item>
        
          
          <v-list-item>
            <v-list-item-content>
              <v-text-field
                v-model="editedAlias"
                label="Nome de exibição"
                outlined
                hide-details
                dense
              ></v-text-field>
            </v-list-item-content>
          </v-list-item>
          
          <v-list-item>
            <v-list-item-content>
              <v-textarea
                v-model="editedBio"
                label="Biografia"
                outlined
                auto-grow
                rows="3"
                counter
                maxlength="200"
              ></v-textarea>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleImageUpload($event.target.files[0])"
    >
    <Toast />
    
    <!-- Loading Overlay -->
    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
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
      events: [],
      totalEvents: 0,
      totalTickets: 0,
      totalRevenue: 0,
      showEditDialog: false,
      editedAlias: '',
      editedBio: '',
      eventHeaders: [
        { text: 'Nome', value: 'name', sortable: true },
        { text: 'Data', value: 'start_date', sortable: true },
        { text: 'Local', value: 'location_name', sortable: true },
        { text: 'Status', value: 'status.name', sortable: true },
        { text: 'Receita', value: 'totalizers.totalSalesAmount', sortable: true, align: 'right' },
        { text: 'Ações', value: 'actions', sortable: false, align: 'center' }
      ]
    };
  },

  computed: {
    userId() {
      return this.$cookies.get('user_id');
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
        // Fetch user documents (bio and profile image)
        await userDocuments.fetchDocumentStatus(this.userId);
        this.events = await event.fetchEventsByPromoterId({ promoterId: this.userId, preloads: ['status', 'tickets'] });

        const bioDoc = userDocuments.$userAttachments.find(doc => doc.name === 'biography');
        const profileImageDoc = userDocuments.$userAttachments.find(doc => doc.name === 'profile_image');
        
        this.userBio = bioDoc?.value || '';
        this.userAlias = user.$user.alias;
        this.profileImageUrl = profileImageDoc?.value || '';
        
        // Set edited values
        this.editedAlias = this.userAlias;
        this.editedBio = this.userBio;

        // Calculate totals
        this.totalEvents = this.events.length;
        this.totalTickets = this.events.reduce((sum, event) => sum + (event.tickets.length || 0), 0);
        this.totalRevenue = this.events.reduce((sum, event) => sum + (event.totalizers.totalSalesAmount || 0), 0);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.setToast({ text: 'Erro ao carregar dados do usuário', type: 'error', time: 3000 });
      } finally {
        this.isLoading = false;
      }
    },

    async updateAlias(newAlias) {
      try {
        this.isLoading = true;
        await user.updateUser({
          id: this.userId,
          alias: newAlias
        });
        this.userAlias = newAlias;
        toast.setToast({ text: 'Nome de exibição atualizado com sucesso', type: 'success', time: 3000 });
      } catch (error) {
        console.error('Error updating alias:', error);
        toast.setToast({ text: 'Erro ao atualizar nome de exibição', type: 'error', time: 3000 });
      } finally {
        this.isLoading = false;
      }
    },

    async updateBiography(newBio) {
      try {
        this.isLoading = true;
        const bioDoc = userDocuments.$userAttachments.find(doc => doc.name === 'biography');
        
        if (bioDoc) {
          await userDocuments.updateUserAttachment({
            id: bioDoc.id,
            value: newBio
          });
        } else {
          await userDocuments.createUserDocument({
            name: 'biography',
            type: 'text',
            userId: this.userId,
            value: newBio
          });
        }
        this.userBio = newBio;
        toast.setToast({ text: 'Biografia atualizada com sucesso', type: 'success', time: 3000 });
      } catch (error) {
        console.error('Error updating biography:', error);
        toast.setToast({ text: 'Erro ao atualizar biografia', type: 'error', time: 3000 });
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

    saveChanges() {
      toast.setToast({ text: 'Alterações salvas com sucesso', type: 'success', time: 3000 });
    },

    async saveProfileChanges() {
      if (this.editedAlias !== this.userAlias) {
        await this.updateAlias(this.editedAlias);
      }
      
      if (this.editedBio !== this.userBio) {
        await this.updateBiography(this.editedBio);
      }
      
      this.showEditDialog = false;
    },

    viewEvent(eventId) {
      this.$router.push(`/events/${eventId}`);
    },

    editEvent(eventId) {
      this.$router.push(`/events/${eventId}/edit`);
    },

    createEvent() {
      this.$router.push('/events/create');
    },
    
    formatDay(dateString) {
      const date = new Date(dateString);
      return date.getDate();
    },
    
    formatMonth(dateString) {
      const date = new Date(dateString);
      const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      return months[date.getMonth()];
    },
  
  }
}
</script> 
  
<style scoped>
.profile-top {
  height: 50vh;
  background: white;
  position: relative;
}

.profile-content {
  padding: 20px;
  position: relative;
  top: 50%;
  transform: translateY(-65%);
}

.profile-image-wrapper {
  position: relative;
  width: auto;
  height: auto;
}

.profile-image {
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.image-overlay {
  position: absolute;
  background-color: rgba(0,0,0,0.6);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.display-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.occupation {
  color: rgba(0,0,0,0.6);
  font-size: 0.875rem;
  max-width: 280px;
  margin: 0 auto;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.info-card {
  min-height: 50vh;
  margin-top: 0;
  border-top-left-radius: 32px !important;
  border-top-right-radius: 32px !important;
  position: relative;
  z-index: 2;
  background-color: var(--primary) !important;
  padding-bottom: 24px;
}

.info-card-content {
  padding: 24px 24px;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray1);
  margin-top: 4px;
}

.events-section {
  padding: 0 4px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
}

.event-card {
  display: flex;
  background-color: var(--beige) !important;
  border-radius: 12px;
  overflow: hidden;
  padding: 12px;
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--primary, #1976d2);
  color: white;
  border-radius: 8px;
  padding: 8px;
  width: 60px;
  height: 60px;
  margin-right: 12px;
}

.date-day {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.event-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.event-location {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.event-status {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  font-weight: 500;
}

.event-stats {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.event-stat {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 4px;
}

.event-stat i {
  margin-right: 4px;
}

.no-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 32px 0;
}

.profile-editor-container {
  max-width: 1280px;
  margin: 0 auto;
}

.mobile-container {
  padding: 0;
  background-color: white !important;
}

/* Desktop styles */
.desktop-header {
  padding: 16px 0;
}

.profile-card {
  height: 100%;
  border-radius: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-box {
  text-align: center;
  padding: 8px;
}

.analytics-card {
  height: 100%;
  transition: transform 0.2s;
}

.analytics-card:hover {
  transform: translateY(-4px);
}

.analytics-icon {
  width: 48px;
  height: 48px;
}
</style>