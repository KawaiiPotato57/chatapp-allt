import { createStore } from 'vuex';
import axios from 'axios';
interface UserList {
  userId: number;
  userMobileNo: string;
  userName: string;
  isOnlineUser: boolean;
  newMsgCount: number;
  averageResponseTime: number;
}
interface chatMessage {
  chatId: number;
  senderId: number;
  receiverId: number;
  dateTime: String;
  isNew: boolean;
  isReveiveMsg: boolean;
  isSendMsg: boolean;
  msg: String;
}
type ChatState = {
  userList: UserList[];
  contactsCheck: boolean;
  messageList: any[];
  selectedUser: UserList;
  chats: chatMessage[];
  getRecords: number;
  offset: number;
  isSent: boolean;
};

const state: ChatState = {
  userList: [],
  messageList: [],
  contactsCheck: false,
  selectedUser: {} as UserList,
  chats: [],
  getRecords: 10,
  offset: 0,
  isSent: false
};
export default createStore({
  state,
  mutations: {
    setUserList(state, payload) {
      state.userList = payload;
    },
    setActiveUser(state, payload) {
      state.chats = [];
      state.selectedUser = payload;
      state.offset = 0;
      state.getRecords = 10;
      console.log('state.selectedUser', state.selectedUser);
    },
    setUserChats(state, payload) {
      state.contactsCheck = payload.contactsCheck;

      if (payload.bool === false) {
        state.chats = payload.chatMessages;
        console.log('Commiting chats', state.chats);
      } else {
        state.chats = [...payload.chatMessages, ...state.chats];
        console.log('Adding new  chats', state.chats);
      }
    },
    sentMessage(state, payload) {
      console.log('send message', payload);
      state.chats.push(payload);
      console.log('state.chats', state.chats);
      state.isSent = !state.isSent;
    }
  },
  actions: {
    async getUserList({ commit }) {
      {
        try {
          const { data } = await axios.get('http://localhost:3000/users');
          const randomContacts = data.map((user: UserList) => ({
            ...user
          }));
          const contactsCheck = data.length > 0;
          console.log('randomContacts', randomContacts);
          commit('setUserList', randomContacts);
        } catch (error) {
          console.error('Error fetching data:', error);
          commit('setUserList', []);
        }
      }
    },
    // async fetchChats({ commit }, payload) {
    //   try {
    //     const { data } = await axios.get('http://localhost:3000/messages');
    //     const filteredData = data
    //       .filter(
    //         (message: chatMessage) =>
    //           message.senderId === 0 && message.receiverId === payload.userId
    //       )
    //       .slice(0, payload.getRecords);
    //     const chatMessages = filteredData;
    //     console.log('chatMessages', chatMessages);
    //     commit('setUserChats', { chatMessages: [], contactsCheck: false });
    //     commit('setUserChats', { chatMessages, contactsCheck: true });
    //   } catch (error) {
    //     console.error('Error fetching chats:', error);
    //   }
    // },
    async fetchChats({ commit, state }, bool) {
      try {
        const { data } = await axios.get('http://localhost:3000/messages');
        const userId = state.selectedUser.userId;
        console.log('DATA', data);

        // Note: Use state.offset and state.getRecords as-is for slicing
        const filteredData = data
          .filter((message: chatMessage) => message.senderId === 0 && message.receiverId === userId)
          .slice(-state.getRecords - state.offset, -state.offset || undefined);

        console.log('filteredData', filteredData);

        if (bool) {
          commit('setUserChats', { chatMessages: filteredData, contactsCheck: true, bool: true });
        } else {
          commit('setUserChats', { chatMessages: filteredData, contactsCheck: true });
        }

        // Update state.offset and state.getRecords after slicing
        state.offset += state.getRecords;
        // state.getRecords += 10;
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    },
    async sendMessage({ commit }, payload) {
      try {
        console.log('Message payload', payload);
        await axios.post('http://localhost:3000/messages', payload);
        // After successful POST request, you can then update your local chatMessages array
        commit('sentMessage', payload);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  }
});
