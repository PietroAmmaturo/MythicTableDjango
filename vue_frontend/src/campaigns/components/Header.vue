<template>
    <header :class="{ scrolled: scrolled }">
        <router-link to="/" v-if="!getIsTruthDay">
            <img src="/static/images/logo.svg" class="logo" />
        </router-link>
        <a href="https://mythictable.com/land-ack" v-else>
            <img src="/static/images/logoOrange.svg" class="logo" />
        </a>

        <div class="spacer" />
        <div v-if="me" class="user" @click="toggleUserPanel">
            <img id="arrow-down" :class="{ rotate: !userDropdownHidden }" src="/static/icons/layout/arrow-down.svg" />
            <img class="profile profile-image-adjustments" :src="me.imageUrl" />
        </div>
        <UserDropdown
            :user="me"
            :hide="userDropdownHidden"
            @account="goToAccount"
            @edit-profile="editProfile"
            @sign-out="signOutOidc"
        />
    </header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import UserDropdown from './UserDropdown';

export default {
    components: {
        UserDropdown,
    },
    data() {
        return {
            userDropdownHidden: true,
            scrolled: false,
        };
    },
    computed: {
        ...mapState('profile', {
            me: 'me',
        }),
        getIsTruthDay() {
            let current = new Date();
            return (
                (current.getMonth() == 8 && current.getDate() == 30) ||
                (current.getMonth() == 9 && current.getDate() < 7)
            );
        },
    },
    mounted() {
        window.addEventListener('scroll', this.checkScrollPosition);
    },
    methods: {
        ...mapActions(['signOutOidc']),
        goToAccount: function() {
            this.$router.push({ name: 'profile' });
        },
        editProfile() {
            this.$emit('profile-activate');
        },
        toggleUserPanel() {
            this.userDropdownHidden = !this.userDropdownHidden;
        },
        checkScrollPosition() {
            this.scrolled = window.scrollY > 40;
        },
    },
    destroy() {
        window.removeEventListener('scroll', this.checkScrollPosition);
    },
};
</script>

<style lang="scss" scoped>
header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: left;
    padding: 1em;
    padding-right: 2em;
    .spacer {
        flex-grow: 1;
    }
    z-index: 1000;
    background: #31313ac7;
    backdrop-filter: blur(10px);
    user-select: none;
    transition: all 1s ease;
}
header.scrolled {
    padding-right: 1em;
    box-shadow: rgba(0, 0, 0, 0.171) 0px 0px 20px;
    .logo {
        height: 3em;
    }
    .user {
        img.profile {
            width: 2.5em;
            height: 2.5em;
        }
        img#arrow-down {
            width: 0.65em;
        }
    }
}

.logo {
    display: block;
    height: 5em;
    border-bottom-style: none;
    padding-right: 10px;
    transition: height 0.5s ease;
}

.user {
    display: flex;
    align-items: center;
    align-self: right;
    background: #0000002c;
    border-radius: 3em;
    padding: 3px;
    cursor: pointer;
    transition: background 1s;
    img.profile {
        width: 4em;
        height: 4em;
        transition: all 0.5s ease;
    }
    img#arrow-down {
        transition: width 0.5s ease, transform 0.5s ease;
        width: 1.25em;
        margin: 0px 10px;
    }
    img#arrow-down.rotate {
        transform: rotateX(180deg);
    }
}
.user:hover {
    background: #000000cc;
    transition: background 0.5s;
}
</style>
