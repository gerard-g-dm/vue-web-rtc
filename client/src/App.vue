<template>
  <div class="page-container">
    <div class="header"></div>
    <div class="content">
      <div class="channels-list">
        <template v-for="channel in channelList" :key="channel.id">
          <div
            v-if="!selectedChannelId"
            class="channel"
            :class="{ active: channel.id === selectedChannelId }"
            @click="selectChannel(channel.id)"
          >
            {{ channel.title }}
          </div>
        </template>
        <div v-if="selectedChannelId" class="channel" @click="leave">Leave</div>
      </div>
      <div class="channel-container">
        <Channel ref="channel" />
      </div>
    </div>
  </div>
</template>

<script>
import Channel from "./components/Channel.vue";

export default {
  name: "App",
  components: {
    Channel,
  },
  data() {
    return {
      selectedChannelId: undefined,
      channelList: [
        { title: "Channel 1", id: "1" },
        { title: "Channel 2", id: "2" },
        { title: "Channel 3", id: "3" },
        { title: "Channel 4", id: "4" },
        { title: "Channel 5", id: "5" },
      ],
    };
  },
  methods: {
    selectChannel(channelId) {
      this.selectedChannelId = channelId;
      this.$refs.channel.join(channelId);
    },
    leave() {
      this.$refs.channel.leave();
      this.selectedChannelId = null;
    },
  },
};
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
.page-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  height: 60px;
  background-color: #243252;
  color: white;
}

.content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}
.channels-list {
  height: 100%;
  width: 250px;
  border-right: 5px solid #fc766a;
}
.channel {
  width: 100%;
  padding: 20px;
  color: #fc766a;
  cursor: pointer;
  box-sizing: border-box;
  font-weight: bold;
}
.channel:hover,
.channel.active {
  background-color: #fc766a;
  color: white;
}
.channel-container {
  width: 100%;
  height: 100%;
}
</style>
