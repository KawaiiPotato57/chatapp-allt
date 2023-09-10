<template>
  <div class="chatContainer">
    <!-- Chat Header -->
    <ChatHeader />

    <!-- Chat Area -->
    <div class="chatArea" v-if="contactsCheck">
      <div
        v-for="message in chatMessages"
        :key="message.id"
        :class="['chatMessage', message.sender]"
      >
        <div class="messageContent">{{ message.content }}</div>
        <div class="messageTime">{{ message.time }}</div>
      </div>
    </div>

    <div class="chatAreaNull" v-else>
      <h2>Select Or Search contacts to start chatting</h2>
      <img class="tempImg" :src="ChatA" />
    </div>

    <!-- Input Area -->
    <ChatTextField />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  computed,
  nextTick,
  watchEffect,
  ComputedRef
} from 'vue';
import ChatA from '@/assets/chatA.png';
import ChatTextField from './ChatTextField.vue';
import ChatHeader from './ChatHeader.vue';
import { useStore } from 'vuex';
const store = useStore();
interface UserList {
  userId: number;
  userMobileNo: string;
  userName: string;
  isOnlineUser: boolean;
  newMsgCount: number;
  averageResponseTime: number;
}
interface ApiMessage {
  chatId: number;
  senderId: number;
  receiverId: number;
  dateTime: string;
  isNew: boolean;
  isReveiveMsg: boolean;
  isSendMsg: boolean;
  msg: string;
}
interface Message {
  id: number;
  sender: 'me' | 'them';
  content: string;
  time: string;
}
let contacts = ref<UserList>();
let contactsCheck = ref(false);
const chatArea = ref<HTMLElement | null>(null);
const chatMessages = ref<Message[]>([]);
const computedChats: ComputedRef<ApiMessage[]> = computed(() => store.state.chats);
const contactsCheckBool: ComputedRef<boolean> = computed(() => store.state.contactsCheck);

const generateRandomApiMessages = (num: number): ApiMessage[] => {
  const messages: ApiMessage[] = [];

  for (let i = 0; i < num; i++) {
    const chatId = i + 1;
    const senderId = Math.floor(Math.random() * 10) + 1; // Random senderId between 1 and 10
    const receiverId = Math.floor(Math.random() * 10) + 1; // Random receiverId between 1 and 10
    const msg = `Random message content ${Math.floor(Math.random() * 1000)}`;
    const dateTime = new Date().toLocaleTimeString();
    const isReceiveMsg = Math.random() > 0.5;
    const isSendMsg = !isReceiveMsg;
    const isNew = Math.random() > 0.5;
    const selectedUser: ComputedRef<number> = computed(() => store.state.selectedUser);
    messages.push({
      chatId,
      senderId,
      receiverId,
      msg,
      dateTime,
      isReveiveMsg: isReceiveMsg,
      isSendMsg,
      isNew
    });
  }

  return messages;
};
// const newApiMessages: ApiMessage[] = generateRandomApiMessages(15);
// console.log('The newApiMessages : ', newApiMessages);
let currentScrollPosition = 0;

const updateChatMessages = (newApiMessages: any, bool = false) => {
  console.log('before chat area', chatArea.value);

  if (chatArea.value) {
    console.log('in chat area', chatArea.value);
    currentScrollPosition = chatArea.value.scrollHeight - chatArea.value.scrollTop;
  }
  if (bool) {
    console.log('IN UPDATE bool', newApiMessages);
    const newMsg: Message = {
      id: newApiMessages.chatId,
      sender: newApiMessages.isSendMsg ? 'me' : 'them',
      content: newApiMessages.msg,
      time: newApiMessages.dateTime
    };
    chatMessages.value = [...chatMessages.value, newMsg];
    console.log('After sending the message : ', chatMessages.value);
  } else {
    console.log('IN UPDATE CHAT MESSAGES');

    console.log('newApiMessages : ', newApiMessages);
    const randomChats = newApiMessages.map((apiMsg: ApiMessage) => ({
      id: apiMsg.chatId,
      sender: apiMsg.isSendMsg ? 'me' : 'them',
      content: apiMsg.msg,
      time: apiMsg.dateTime
    }));

    chatMessages.value = randomChats;
    console.log('The chat messages : ', chatMessages.value);
  }
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTop = chatArea.value.scrollHeight - currentScrollPosition;
    }
  });
};

// updateChatMessages(newApiMessages);
console.log('User connection id saved:', localStorage.getItem('userToken'));

const dummyMessage: ApiMessage[] = [
  {
    chatId: 39,
    senderId: 2,
    receiverId: 1,
    msg: '(System: There are no chats with this user, Start chatting now.😀)',
    dateTime: '2023-08-29T21:24:02.3400791',
    isReveiveMsg: false,
    isSendMsg: true,
    isNew: false
  }
];

const loadMoreMessages = () => {
  // Capture previous scroll position and height
  const previousScrollHeight = chatArea.value?.scrollHeight;
  const previousScrollTop = chatArea.value?.scrollTop;

  // Your existing logic to load more messages.

  console.log('IN LOAD MORE MESSAGES', store.state.chats);
  // updateChatMessages(store.state.chats);
  store.dispatch('fetchChats', true);

  // Adjust scroll position after messages have been updated
  if (previousScrollHeight && previousScrollTop && chatArea.value) {
    chatArea.value.scrollTop =
      chatArea.value.scrollHeight - previousScrollHeight + previousScrollTop;
  }
};

const handleScroll = (e: Event) => {
  console.log('IN HANDLE SCROLL');
  const target = e.target as HTMLElement;
  // Change 500000 to the scroll position at which you want to trigger the function
  // console.log('The target : ', target.scrollTop, 'CHAT AREA', chatArea.value?.scrollHeight);
  if (target.scrollTop == 0) {
    // console.log('IN LOAD BEFORE');
    loadMoreMessages();
  }
};
const msgs = computed(() => store.state.chats);
const checkBool = computed(() => store.state.contactsCheck);

const getMessages = () => {
  contactsCheck.value = checkBool.value;
  updateChatMessages(msgs.value[0], false);
};
// watch(
//   () => store.state.chats,
//   (newVal) => {
//     console.log('IN WATCH MSGS', newVal[newVal.length]);
//     updateChatMessages(newVal[newVal.length], true);
//   }
// );

watch(
  () => store.state.selectedUser,
  (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      chatMessages.value = [];
      getMessages();
    }
  }
);
// watch(
//   () => store.state.isSent,
//   (newUserId) => {
//     updateChatMessages(store.state.chats[store.state.chats.length - 1], true);
//   }
// );

watch(
  () => store.state.contactsCheck,
  (bool) => {
    contactsCheck.value = bool;
  }
);
const computedLength = ref(0);
watch(
  () => store.state.chats,
  (newVal, oldVal) => {
    console.log(`new val : ${newVal.length}  old val ${oldVal.length}`);
    if (newVal.length != 0 && oldVal.length == 0) {
      console.log('The else if', newVal);
      updateChatMessages(newVal, false);
      computedLength.value = newVal.length;
    } else if (newVal.length > computedLength.value) {
      if (newVal.length > 0) {
        console.log('THe greater : ', newVal);
        // updateChatMessages(newVal[newVal.length - 1], true);
        updateChatMessages(newVal);
        computedLength.value = newVal.length;
      }
    } else {
      console.log('ERROR');
    }
  },
  { deep: true }
);

watch(
  () => store.state.contactsCheck,
  (bool) => {
    console.log('CHAT AREA WATCH');
    if (bool) {
      chatArea.value = document.querySelector('.chatArea') as HTMLElement | null;
    } else {
      chatArea.value = null;
    }

    if (chatArea.value) {
      console.log('IN WATCH EFFECT');
      chatArea.value.addEventListener('scroll', handleScroll);
      chatArea.value.scrollTop = chatArea.value.scrollHeight;
      // chatArea.value.scrollTop = 540;
    }
  }
);

onUnmounted(() => {
  if (chatArea.value) {
    console.log('Removing scroll');
    chatArea.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.chatContainer {
  width: 80%;
  min-height: 100vh;
  background-color: rgb(255, 255, 255);
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
}
.chatAreaNull {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}
.chatAreaNull > h2 {
  margin: 20px;
  text-align: center;
}
.tempImg {
  width: 30%;
  height: 70%;
}
.chatHeader {
  display: flex;
  align-items: center;
  padding: 10px;
}

.chatArea {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 20px;
  overflow-y: scroll;
}

.chatMessage {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.chatMessage.them {
  justify-content: flex-start;
}

.chatMessage.them > .messageContent {
  background: rgb(0, 72, 90);
  padding: 10px;
  border-radius: 5px;
}

.messageContent {
  background: rgb(135, 132, 132);
  padding: 10px;
  border-radius: 5px;
  color: white;
  max-width: 40%;
}

.messageTime {
  margin-left: 10px;
  font-size: 0.8em;
  align-self: flex-end;
}
@media (max-width: 768px) {
  .messageContent {
    background: rgb(135, 132, 132);
    padding: 10px;
    border-radius: 5px;
    color: white;
    max-width: 70%;
  }
  .chatAreaNull > h2 {
    margin: 20px;
    text-align: center;
  }
  .tempImg {
    width: 20%;
    height: 70%;
  }
}

/* Extra-small screens, typically small mobile devices */
@media (max-width: 576px) {
  .messageContent {
    background: rgb(135, 132, 132);
    padding: 10px;
    border-radius: 5px;
    color: white;
    max-width: 70%;
  }
  .chatAreaNull > h2 {
    margin: 20px;
    text-align: center;
    font-size: 16px;
  }
  .tempImg {
    width: 55%;
    height: 60%;
  }
}
</style>

<!-- @media (max-width: 1200px) {
    .messageContent {
      background: rgb(135, 132, 132);
      padding: 10px;
      border-radius: 5px;
      color: white;
      max-width: 40%;
    }
  }

  /* Medium screens, typically tablets */
  @media (max-width: 992px) {
    .messageContent {
      background: rgb(135, 132, 132);
      padding: 10px;
      border-radius: 5px;
      color: white;
      max-width: 60%;
    }
  }

  /* Small screens, typically large mobile devices */
  @media (max-width: 768px) {
    .messageContent {
      background: rgb(135, 132, 132);
      padding: 10px;
      border-radius: 5px;
      color: white;
      max-width: 70%;
    }
  }

  /* Extra-small screens, typically small mobile devices */
  @media (max-width: 576px) {
    .messageContent {
      background: rgb(135, 132, 132);
      padding: 10px;
      border-radius: 5px;
      color: white;
      max-width: 70%;
    }
  }

  @media (max-width: 320px) {
  } -->
