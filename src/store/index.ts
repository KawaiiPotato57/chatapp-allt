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
interface recent {
  userId: number;
  dateTime: string;
  lastMessage: string;
  count: number;
}
interface chatMessage {
  chatId: number;
  senderId: number;
  receiverId: number;
  dateTime: string;
  isNew: boolean;
  isReveiveMsg: boolean;
  isSendMsg: boolean;
  msg: string;
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
  recentMessage: recent[];
  allChats: chatMessage[];
};

const state: ChatState = {
  userList: [],
  messageList: [],
  contactsCheck: false,
  selectedUser: {} as UserList,
  chats: [],
  getRecords: 10,
  offset: 0,
  isSent: false,
  recentMessage: [],
  allChats: []
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
      const matchingRecentMessageIndex = state.recentMessage.findIndex(
        (message) => message.userId === payload.userId
      );

      if (matchingRecentMessageIndex !== -1) {
        state.recentMessage[matchingRecentMessageIndex].count = 0;
      } else {
        console.log('No matching recent message found for userId', payload.userId);
      }
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
    },
    setRecentChats(state) {
      state.recentMessage = state.userList.map((user) => {
        // Find the last message for this user
        console.log('user', user);
        console.log('chats', state.allChats);
        const userMessages = state.allChats.filter(
          (message) =>
            (message.senderId === user.userId && message.receiverId === 0) ||
            (message.senderId === 0 && message.receiverId === user.userId)
        );
        console.log('userMessages', userMessages);
        // Sort the messages by dateTime in descending order (most recent first)
        userMessages.sort((a, b) => (a.dateTime > b.dateTime ? -1 : 1));
        // Get the content of the last message if it exists
        // Get the dateTime and msg of the last message if it exists
        const lastMessage = userMessages.length > 0 ? userMessages[0] : null;
        if (lastMessage) {
          // Assuming dateTime is in ISO 8601 format, convert it to local time
          const dateTime = new Date(lastMessage.dateTime);
          const localDateTime = dateTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });
          lastMessage.dateTime = localDateTime;
        }
        // Return an object with user info, dateTime, and msg of the last message
        return {
          userId: user.userId,
          dateTime: lastMessage.dateTime,
          lastMessage: lastMessage ? lastMessage.msg : '',
          count: 0
        };
      });
      console.log('THE RECENTS: ', state.recentMessage);
    },
    updateRecentMessage(state, message) {
      const sendId = message.senderId; // Assuming the senderId is the user's ID
      const receiveId = message.receiverId; // Assuming the receiverId is the
      const recentMessageIndex = state.recentMessage.findIndex(
        (user) => user.userId === sendId || user.userId === receiveId
      );
      console.log('selected?', state.selectedUser);
      if (Object.keys(state.selectedUser).length !== 0 && state.selectedUser.userId === receiveId) {
        console.log('selected?in');
        if (recentMessageIndex !== -1) {
          if (message) {
            const dateTime = new Date(message.dateTime);
            const localDateTime = dateTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            message.dateTime = localDateTime;
          }
          state.recentMessage[recentMessageIndex].lastMessage = message.msg;
          state.recentMessage[recentMessageIndex].dateTime = message.dateTime;
        } else {
          console.log('Messagess', message);
          if (message) {
            const dateTime = new Date(message.dateTime);
            const localDateTime = dateTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            message.dateTime = localDateTime;
          }
          state.recentMessage.push({
            userId: sendId,
            dateTime: message.dateTime,
            lastMessage: message.msg,
            count: 0
          });
        }
      } else {
        if (recentMessageIndex !== -1) {
          if (message) {
            const dateTime = new Date(message.dateTime);
            const localDateTime = dateTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            message.dateTime = localDateTime;
          }
          state.recentMessage[recentMessageIndex].lastMessage = message.msg;
          state.recentMessage[recentMessageIndex].dateTime = message.dateTime;
          state.recentMessage[recentMessageIndex].count =
            state.recentMessage[recentMessageIndex].count + 1;
          console.log('COUNT????', state.recentMessage[recentMessageIndex].count);
        } else {
          console.log('Messagess', message);
          if (message) {
            const dateTime = new Date(message.dateTime);
            const localDateTime = dateTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            message.dateTime = localDateTime;
          }
          state.recentMessage.push({
            userId: sendId,
            dateTime: message.dateTime,
            lastMessage: message.msg,
            count: 1
          });
        }
      }

      console.log('After update', state.recentMessage);
    }
  },
  actions: {
    async getUserList({ commit, dispatch }) {
      {
        try {
          const { data } = await axios.get('http://localhost:3000/users');

          const randomContacts = data.map((user: UserList) => ({
            ...user
          }));
          console.log('randomContacts', randomContacts);
          commit('setUserList', randomContacts);
          dispatch('getMessages');
        } catch (error) {
          console.error('Error fetching data:', error);
          commit('setUserList', []);
        }
      }
    },
    async getMessages({ commit, state }, payload) {
      try {
        const { data } = await axios.get('http://localhost:3000/messages');
        state.allChats = data;
        console.log('DATA', data);
        // Note: Use state.offset and state.getRecords as-is for slicing
        commit('setRecentChats');
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    },
    async fetchChats({ commit, state }, bool) {
      try {
        const { data } = await axios.get('http://localhost:3000/messages');
        const userId = state.selectedUser.userId;
        state.allChats = data;
        console.log('DATA', data);
        // Note: Use state.offset and state.getRecords as-is for slicing

        const filteredData = data
          .filter(
            (message: chatMessage) =>
              (message.senderId === 0 && message.receiverId === userId) ||
              (message.senderId === userId && message.receiverId === 0)
          )
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
        commit('updateRecentMessage', payload);
        commit('sentMessage', payload);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    async recieveMessage({ commit }, payload) {
      try {
        console.log('Message payload', payload);
        await axios.post('http://localhost:3000/messages', payload);
        commit('updateRecentMessage', payload);

        // After successful POST request, you can then update your local chatMessages array
        commit('sentMessage', payload);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  }
});
