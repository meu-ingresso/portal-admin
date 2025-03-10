<template>
  <v-navigation-drawer
    v-if="getSidebar && !isMobile"
    v-model="$_drawer"
    clipped
    app
    :class="$vuetify.breakpoint.mobile ? 'navigationMobile' : 'navigation'">
    <v-list class="py-0">
      <div v-for="(item, i) in getSidebar" :key="i" class="event-drawer-item">
        <v-list-item
          :to="item.to"
          router
          exact
          :class="{ 'active-item': item.to === currentPath }">
          <v-list-item-action v-if="item.icon" class="text-center">
            <v-icon v-if="$route.meta.template === item.template || $route.path === item.to">{{
              item.iconActive
            }}</v-icon>
            <v-icon v-else>{{ item.icon }}</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list>
  </v-navigation-drawer>

  <v-select
    v-else-if="getSelectItems && isMobile"
    v-model="selectedItem"
    outlined
    dense
    return-object
    hide-details
    :items="getSelectItems" />
</template>

<script>
import { loading, eventGeneralInfo } from '@/store';
import { reportsSideBar } from '@/utils/reports-sidebar';
import { isMobileDevice } from '@/utils/utils';

export default {
  props: {
    drawer: {
      type: Boolean,
      default: false,
    },
    selectedEvent: {
      type: Object,
      default: null,
    },
    selectedView: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      selectedItem: null,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    currentPath() {
      return this.$route.path;
    },

    $_drawer: {
      get() {
        return this.drawer;
      },
      set(val) {
        this.$emit('update:drawer', val);
      },
    },

    isLoading() {
      return loading.$isLoading;
    },

    getSelectItems() {
      if (this.isLoading) return null;
      return this.getSidebar.map((item) => {
        return {
          text: item.title,
          value: item.to,
        };
      });
    },

    getSidebar() {
      if (this.isLoading) return null;
      return reportsSideBar;
    },

    selectedEventBanner() {
      if (!this.selectedEvent) return null;

      const banner = this.selectedEvent.attachments?.find(
        (attach) => attach.type === 'image' && attach.name === 'banner'
      );

      return banner && banner.url
        ? banner.url
        : require(`~/assets/images/default_banner.png`);
    },
    
    hasSessions() {
      return this.selectedEvent && 
             (this.selectedEvent.hasSessions || 
              (this.selectedEvent.sessionIds && this.selectedEvent.sessionIds.length > 1));
    },
    
    sessionsCount() {
      if (!this.selectedEvent) return 0;
      
      if (this.selectedEvent.sessionsCount) {
        return this.selectedEvent.sessionsCount;
      }
      
      if (this.selectedEvent.sessionIds) {
        return this.selectedEvent.sessionIds.length;
      }
      
      // Se não tiver informações explícitas, vamos checar os eventos com o mesmo grupo
      if (this.selectedEvent.groups && this.selectedEvent.groups.length > 0) {
        const groupId = this.selectedEvent.groups[0].id;
        const eventsInGroup = eventGeneralInfo.$eventList.filter(event => 
          event.groups && 
          event.groups.length > 0 && 
          event.groups[0].id === groupId
        );
        
        return eventsInGroup.length;
      }
      
      return 0;
    },
  },

  watch: {
    selectedItem(val) {
      if (val && val.value) {
        this.$router.push(val.value);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.navigation {
  height: 100vh !important;
  top: 80px !important;
  background-color: var(--tertiary) !important;
  color: var(--black-text) !important;
  font-weight: 400 !important;
  font-size: 16px !important;
  font-family: var(--font-family) !important;
}

.navigationMobile {
  height: 105vh !important;
  top: 0px !important;
}

.active-item::before {
  opacity: 0 !important;
}

.active-item {
  background-color: var(--primary) !important;
  border-radius: 8px;
  color: white;
  font-size: 16px !important;
  font-family: var(--font-family) !important;
}

.active-item::before {
  opacity: 0 !important;
}

.image-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  width: 540px;
  height: auto;
}

.image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  height: auto;
}

.event-detail-image {
  margin: 0px;
  margin-bottom: 8px;
  padding: 0;
  overflow: hidden;
}

.event-drawer-item {
  padding-right: 8px;
  padding-left: 8px;
  margin-bottom: 2px;
}

.event-drawer-item:hover {
  background-color: var(--tertiary);
  border-radius: 8px;
}

.event-drawer-item a:hover {
  background-color: transparent;
}

.event-drawer-item a:hover::before {
  background-color: transparent;
  opacity: 0;
}
</style> 