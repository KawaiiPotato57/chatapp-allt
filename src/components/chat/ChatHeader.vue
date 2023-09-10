<template>
  <div class="chatHeader">
    <div class="imageWrapper">
      <img :src="chatIcon" alt="User Avatar" class="userImage" />
      <div class="statusDot" v-if="contacts?.isOnlineUser"></div>
    </div>
    <div class="userInfo">
      <div class="userName">
        {{ contacts?.userMobileNo }}
        <span style="font-size: smaller; font-weight: 400; color: rgb(67, 67, 67)"
          >(Average Response Time:
          {{ `${(contacts?.averageResponseTime / 1000).toFixed(0)} secs` }})</span
        >
      </div>
      <div class="userStatus" v-if="contacts?.isOnlineUser" :class="contacts?.isOnlineUser">
        Online
      </div>
      <div class="userStatus" v-else :class="contacts?.isOnlineUser">Offline</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import chatIcon from '@/assets/chatIcon.png';

import { ref, watch, computed, watchEffect } from 'vue';
import { useStore } from 'vuex';
const store = useStore();

const selected = computed(() => store.state.selectedUser);

interface UserList {
  userId: number;
  userMobileNo: string;
  userName: string;
  isOnlineUser: boolean;
  newMsgCount: number;
  averageResponseTime: number;
}
let contacts = ref<UserList>({
  userId: 0,
  userMobileNo: '',
  userName: '',
  isOnlineUser: false,
  newMsgCount: 0,
  averageResponseTime: 0
});

interface User {
  name: string;
  image: string;
  isOnline: boolean;
}
const currentUser = ref<User>({
  name: 'John Doe',
  image: chatIcon,
  isOnline: true
});
console.log('Selected User', selected.value);
watch(
  store.state.selectedUser,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      console.log('User changed: ', newVal);
      // Your code to handle the user change
    }
  },
  { deep: true }
);
watchEffect(() => {
  const selectedUser1 = store.state.selectedUser;
  console.log('Selected user:', selectedUser1);
  // Handle the user change logic here
});
</script>

<style scoped>
.chatHeader {
  display: flex;
  align-items: center;
  position: relative;
  padding: 10px;
}
.chatHeader::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0.5px;
  box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.75);
}
.imageWrapper {
  position: relative;
}
.userImage {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1px;
}

.userInfo {
  display: flex;
  flex-direction: column;
}

.userName {
  font-weight: bold;
}

.userStatus {
  font-size: 0.8em;
  color: gray;
}
.userStatus.true {
  color: green;
}
.statusDot {
  width: 10px;
  height: 10px;
  background-color: green;
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
