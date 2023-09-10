<template>
  <div class="inputArea">
    <input
      type="text"
      v-model="newMessage"
      @keyup.enter="sendMessage"
      placeholder="Type a message"
    />
    <button @click="sendMessage" class="sendButton">
      <el-icon><Promotion /></el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Promotion } from '@element-plus/icons-vue';
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
const store = useStore();
const newMessage = ref('');

const sendMessage = () => {
  if (newMessage.value == '') {
    newMessage.value = '';
    return;
  } else {
    console.log('THE ID in search:');
    const payload = {
      id: Math.random() * 1000,
      chatId: 31,
      senderId: 0,
      receiverId: 1,
      dateTime: new Date().toISOString(),
      isNew: false,
      isReveiveMsg: false,
      isSendMsg: true,
      msg: newMessage.value
    };
    store.dispatch('sendMessage', payload);
  }

  newMessage.value = '';
};
</script>

<style scoped>
.inputArea {
  display: flex;
  padding: 10px;
  height: 70px;
}
.sendButton {
  background-color: blue;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  outline: none;
  color: white;
  font-size: 1.5em;
  height: unset;
}
input[type='text'] {
  flex-grow: 1;
  padding: 10px;
  margin-right: 5px;
  border-radius: 5px;
  border: 1px solid gray;
}
</style>
