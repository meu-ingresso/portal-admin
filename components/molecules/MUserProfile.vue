<template>
  <div class="user-profile" :class="[`user-profile--${variant}`, { 'user-profile--loading': loading }]">
    <!-- Loading state -->
    <div v-if="loading" class="user-profile__loading">
      <v-skeleton-loader :type="variant === 'card' ? 'list-item-avatar' : 'avatar'"
        class="user-profile__skeleton"></v-skeleton-loader>
    </div>

    <!-- User content -->
    <div v-else class="user-profile__content">
      <!-- Avatar -->
      <UserAvatar :name="computedUserName" :src="computedUserPicture" :color="avatarColor" :size="avatarSize"
        :avatar-class="avatarClass" />

      <!-- User details (visible in card and inline variants) -->
      <div v-if="showDetails" class="user-profile__details">
        <div class="user-profile__name" :class="nameClass">
          {{ computedUserName }}
        </div>
        <div v-if="showEmail" class="user-profile__email" :class="emailClass">
          {{ computedUserEmail }}
        </div>
      </div>

      <!-- Action slot -->
      <div v-if="$slots.action" class="user-profile__action">
        <slot name="action"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'MUserProfile',

  props: {
    // Data source
    user: {
      type: Object,
      default: null
    },

    // Visual variant
    variant: {
      type: String,
      default: 'avatar', // 'avatar', 'card', 'inline'
      validator: (value: string) => ['avatar', 'card', 'inline'].includes(value)
    },

    // Avatar props
    avatarSize: {
      type: [String, Number],
      default: 32
    },
    avatarColor: {
      type: String,
      default: 'primary'
    },
    avatarClass: {
      type: String,
      default: ''
    },

    // Display options
    showEmail: {
      type: Boolean,
      default: true
    },

    // Custom classes
    nameClass: {
      type: String,
      default: ''
    },
    emailClass: {
      type: String,
      default: ''
    },

    // States
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    // Get user data from props or store
    activeUser() {
      if (this.user) {
        return this.user;
      }

      return this.$store.state.auth.user || null;
    },

    // Computed user name with all fallbacks
    computedUserName() {
      if (!this.activeUser) return 'Usuário';

      // Priority 1: Direct name property
      if (this.activeUser.name && this.activeUser.name.trim()) {
        return this.activeUser.name.trim();
      }

      // Priority 2: Backend structure (people.first_name + people.last_name)
      const people = this.activeUser.people || {};
      const firstName = people.first_name || this.activeUser.first_name || this.activeUser.given_name || '';
      const lastName = people.last_name || this.activeUser.last_name || this.activeUser.family_name || '';

      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }

      // Priority 3: Google structure (given_name + family_name)
      const givenName = this.activeUser.given_name || '';
      const familyName = this.activeUser.family_name || '';

      if (givenName || familyName) {
        return `${givenName} ${familyName}`.trim();
      }

      // Priority 4: Extract from email
      if (this.activeUser.email) {
        const emailPart = this.activeUser.email.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        return emailPart
          .replace(/[._]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }

      // Priority 5: Use alias if available
      if (this.activeUser.alias && this.activeUser.alias.trim()) {
        return this.activeUser.alias.trim();
      }

      // Final fallback
      return 'Usuário';
    },

    // Computed user email
    computedUserEmail() {
      if (!this.activeUser) return '';

      return this.activeUser.email || '';
    },

    // Computed user picture/avatar
    computedUserPicture() {
      if (!this.activeUser) return null;

      // Priority 1: Backend avatar_url
      if (this.activeUser.avatar_url) {
        return this.activeUser.avatar_url;
      }

      // Priority 2: Google picture
      if (this.activeUser.picture) {
        return this.activeUser.picture;
      }

      // Priority 3: Generic avatar property
      if (this.activeUser.avatar) {
        return this.activeUser.avatar;
      }

      // Priority 4: Check attachments for profile image
      if (this.activeUser.attachments && Array.isArray(this.activeUser.attachments)) {
        const profileImage = this.activeUser.attachments.find(
          (att: any) => att.name === 'profile_image' && att.value
        );
        if (profileImage) {
          return profileImage.value;
        }
      }

      return null;
    },

    // Show details based on variant
    showDetails() {
      return this.variant === 'card' || this.variant === 'inline';
    }
  },

  methods: {
    // Get user data for external use
    getUserData() {
      return {
        name: this.computedUserName,
        email: this.computedUserEmail,
        picture: this.computedUserPicture,
        raw: this.activeUser
      };
    }
  }
});
</script>

<style lang="scss" scoped>
.user-profile {
  &__loading {
    display: flex;
    align-items: center;
  }

  &__content {
    display: flex;
    align-items: center;
  }

  &__details {
    margin-left: 12px;
    flex: 1;
  }

  &__name {
    font-weight: 500;
    line-height: 1.2;
  }

  &__email {
    font-size: 0.875rem;
    color: #666;
    line-height: 1.2;
    margin-top: 2px;
  }

  &__action {
    margin-left: auto;
  }

  // Variants
  &--avatar {
    .user-profile__content {
      justify-content: center;
    }
  }

  &--card {
    .user-profile__content {
      width: 100%;
    }

    .user-profile__name {
      font-size: 1rem;
      font-weight: 600;
    }

    .user-profile__email {
      font-size: 0.875rem;
    }
  }

  &--inline {
    .user-profile__content {
      gap: 8px;
    }

    .user-profile__name {
      font-size: 0.875rem;
    }

    .user-profile__email {
      font-size: 0.75rem;
    }
  }

  // Loading state
  &--loading {
    .user-profile__skeleton {
      width: 100%;
    }
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .user-profile {
    &--card {
      .user-profile__name {
        font-size: 0.875rem;
      }

      .user-profile__email {
        font-size: 0.75rem;
      }
    }
  }
}
</style>
