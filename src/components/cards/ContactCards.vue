<template>
  <div class="chatBar">
    <div
      class="contactCard"
      v-for="contact in randomContacts"
      :key="contact.userId"
      @click="handleCardClick(contact)"
    >
      <div class="imageWrapper">
        <img :src="chatIcon" alt="contact avatar" class="contactImage" />
        <div class="statusDot" v-if="contact.isOnlineUser"></div>
      </div>
      <div class="contactDetails">
        <div class="contactName">{{ contact.userMobileNo }}</div>
        <div class="lastMessage">
          {{ recentMessages[contact.userId].lastMessage || 'Danse' }}
        </div>
      </div>
      <div class="latestDiv">
        <div class="countClass" v-if="recentMessages[contact.userId].count > 0">
          {{ recentMessages[contact.userId].count }}
        </div>
        <div class="messageTime">
          {{ recentMessages[contact.userId].dateTime || '12:01 pm' }}
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="chatBar" v-else>
    <h4 style="font-size: medium; font-weight: 400; padding-top: 40%; padding-right: 10%">
      Search contacts to start chatting
    </h4>
  </div> -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import chatIcon from '@/assets/chatIcon.png';
import { useStore } from 'vuex';
const store = useStore();

interface User {
  userId: number;
  userMobileNo: string;
  userName: string;
  isOnlineUser: boolean;
  newMsgCount: number;
  averageResponseTime: number;
}
const contactList = computed(() => store.state.userList);
const randomContacts = ref<User[]>([]);
const contactsCheck = ref(true); // Assume true initially until data is fetched
const recentChats = computed(() => store.state.recentMessage);
const setRecents = ref();
console.log('In the cards', setRecents.value);
watch(
  () => store.state.userList,
  (newVal) => {
    randomContacts.value = newVal;
    console.log('contactList changed', newVal);
  }
);

watch(
  () => recentChats.value,
  (newVal) => {
    setRecents.value = newVal;
    console.log('ONE?', recentChats.value[1]);
  },
  {
    immediate: true
  }
);

const recentMessages = computed(() => {
  const recentMessagesMap: any = {};
  for (const recentChat of recentChats.value) {
    recentMessagesMap[recentChat.userId] = recentChat;
  }
  return recentMessagesMap;
});
const handleCardClick = (user: User) => {
  // currentReceiverId.value = userId;
  // fetchChats(userId);
  store.commit('setActiveUser', user);
  console.log('clicked Card');
  store.dispatch('fetchChats', false);
};
// Fetch data when the component is mounted
onMounted(() => {
  console.log('MOUNTED');
  store.dispatch('getUserList');
}); // Set to true to display random contacts
</script>

<style>
.chatBar {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
}
.chatBar::-webkit-scrollbar {
  width: 5px; /* Width of the scrollbar */
}

.chatBar::-webkit-scrollbar-thumb {
  background-color: darkgrey; /* Color of the scroll thumb */
  outline: 1px solid slategrey; /* 1px border around thumb */
}

.chatBar::-webkit-scrollbar-thumb:hover {
  background: grey; /* Color of thumb when hovered */
}

.chatBar::-webkit-scrollbar-track {
  background: lightgrey; /* Color of the track */
}
.countClass {
  border-radius: 50%;
  color: white;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(0, 72, 90);
  font-size: 15px;
  position: relative;
}
.contactCard {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  height: 10vh;
  width: 25vw;
  color: black;
  cursor: pointer;
}
.contactCard:hover {
  background-color: rgba(202, 202, 202, 0.568);
}
.contactCard::after {
  content: '';
  position: absolute;
  left: 1;
  bottom: 0;
  width: 90%;
  height: 1px;
  background-color: rgb(72, 72, 72);
}

.contactImage {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  margin-right: 1px;
}

.contactDetails {
  flex-grow: 1;
  position: relative;
}

.contactName {
  font-weight: bold;
  padding-bottom: 20px;
}

.latestDiv {
  position: relative;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column; /* changed from row to column */
  align-items: flex-end;
}

.lastMessage {
  color: rgb(48, 48, 48);
  white-space: nowrap; /* Prevent wrapping to next line */
  text-overflow: ellipsis; /* Show ellipsis when text is too long */
  overflow: hidden; /* Hide the overflow */
}

.messageTime {
  margin-left: auto;
  justify-content: flex-end;
  color: rgb(48, 48, 48);
}
.imageWrapper {
  position: relative;
  margin: 5px;
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

@media (max-width: 1200px) {
  .contactCard {
    height: 8vh;
    width: 45vw;
  }
  .contactCard:hover {
    background-color: rgba(202, 202, 202, 0.568);
  }
  .contactCard::after {
    width: 80%;
    height: 1px;
  }
  .contactImage {
    width: 40px;
    height: 40px;
  }

  .contactName {
    font-size: small;
  }

  .lastMessage {
    font-size: small;
  }

  .messageTime {
    font-size: small;
  }
  .statusDot {
    width: 8px;
    height: 8px;
  }
}
@media (max-width: 768px) {
  .contactCard {
    height: 14vh;
    width: 60vw;
  }
  .contactCard:hover {
    background-color: rgba(202, 202, 202, 0.568);
  }
  .contactCard::after {
    width: 80%;
    height: 1px;
  }
  .contactImage {
    width: 40px;
    height: 40px;
  }

  .contactName {
    font-size: small;
  }

  .lastMessage {
    font-size: small;
  }

  .messageTime {
    font-size: small;
  }
  .statusDot {
    width: 8px;
    height: 8px;
  }
}

/* Extra-small screens, typically small mobile devices */
@media (max-width: 576px) {
  .contactCard {
    height: 14vh;
    width: 60vw;
  }
  .contactCard:hover {
    background-color: rgba(202, 202, 202, 0.568);
  }
  .contactCard::after {
    width: 80%;
    height: 1px;
  }
  .contactImage {
    width: 40px;
    height: 40px;
  }

  .contactName {
    font-size: small;
  }

  .lastMessage {
    font-size: small;
  }

  .messageTime {
    font-size: small;
  }
  .statusDot {
    width: 8px;
    height: 8px;
  }
}

@media (max-width: 320px) {
  .contactCard {
    height: 14vh;
    width: 40vw;
  }
  .contactCard:hover {
    background-color: rgba(202, 202, 202, 0.568);
  }
  .contactCard::after {
    width: 80%;
    height: 1px;
  }
  .contactImage {
    width: 40px;
    height: 40px;
  }

  .contactName {
    font-size: small;
  }

  .lastMessage {
    font-size: small;
  }

  .messageTime {
    font-size: small;
  }
  .statusDot {
    width: 8px;
    height: 8px;
  }
}

/* Medium screens, typically tablets */

/* Small screens, typically large mobile devices */
</style>
