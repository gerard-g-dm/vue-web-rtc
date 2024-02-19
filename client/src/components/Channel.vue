<template>
  <div class="video-list">
    <div
      v-for="item in videoList"
      :video="item"
      :key="item.id"
      class="video-item"
      :class="{ 'my-video': item.isLocal }"
    >
      <video
        controls
        autoplay
        playsinline
        ref="videos"
        :muted="item.muted"
        :id="item.id"
      ></video>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
const SimpleSignalClient = require("simple-signal-client");

export default {
  name: "Channel",
  data() {
    return {
      socket: undefined,
      signalClient: undefined,
      videoList: [],
      channelId: undefined,
    };
  },
  methods: {
    async join(channelId) {
      this.channelId = channelId;
      const currentContext = this;
      this.socket = io("http://localhost:3000");
      this.signalClient = new SimpleSignalClient(this.socket);

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.joinedChannel(this.localStream, true);

      this.signalClient.once("discover", (discoveryData) => {
        discoveryData.forEach((peerID) => currentContext.connectToPeer(peerID));
      });
      this.signalClient.on("request", async (request) => {
        const { peer } = await request.accept({}, currentContext.peerOptions);
        currentContext.videoList.forEach((v) => {
          if (v.isLocal) {
            currentContext.onPeer(peer, v.stream);
          }
        });
      });
      this.signalClient.discover(currentContext.channelId);
    },
    joinedChannel(stream, isLocal) {
      const currentContext = this;

      // create video on videoList if not exist
      const found = currentContext.videoList.some((video) => {
        return video.id === stream.id;
      });
      if (!found) {
        const video = {
          id: stream.id,
          muted: isLocal,
          stream: stream,
          isLocal: isLocal,
        };

        currentContext.videoList.push(video);
      }

      // set stream to video srcObject property
      setTimeout(function () {
        const { videos } = currentContext.$refs;
        for (let i = 0, len = videos.length; i < len; i++) {
          if (videos[i].id === stream.id) {
            videos[i].srcObject = stream;
            break;
          }
        }
      }, 500);
    },
    onPeer(peer, localStream) {
      const currentContext = this;
      // add our local stream to the peer
      peer.addStream(localStream);
      // receive remote stream
      peer.on("stream", (remoteStream) => {
        // add new user stream to the videos list
        currentContext.joinedChannel(remoteStream, false);
        // listen on stream closure
        peer.on("close", () => {
          // remove remote user video from videos list
          const newList = [];
          currentContext.videoList.forEach(function (item) {
            if (item.id !== remoteStream.id) {
              newList.push(item);
            }
          });
          currentContext.videoList = newList;
        });
      });
    },
    async connectToPeer(peerID) {
      if (peerID == this.socket.id) return;
      try {
        // peer connexion
        const { peer } = await this.signalClient.connect(
          peerID,
          this.channelId
        );
        this.videoList.forEach((v) => {
          if (v.isLocal) {
            // add our stream to the peer and listen to event
            this.onPeer(peer, v.stream);
          }
        });
      } catch (e) {
        console.error(e);
      }
    },
    leave() {
      this.videoList.forEach((v) =>
        v.stream.getTracks().forEach((t) => t.stop())
      );
      this.videoList = [];
      if (this.signalClient) {
        this.signalClient.peers().forEach((peer) => peer.removeAllListeners());
        this.signalClient.destroy();
        this.signalClient = null;
      }
      if (this.socket) {
        this.socket.destroy();
        this.socket = null;
      }
    },
  },
};
</script>

<style scoped>
.video-list {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.video-item {
  width: 150px;
  height: 150px;
  margin: 20px;
  border-radius: 50%;
  border: 5px solid #2c3e50;
  position: relative;
  overflow: hidden;
}
.video-item.my-video {
  border-color: #fc766a;
}
video {
  position: absolute;
  left: -20%;
  top: -20%;
  width: 140%;
  height: 140%;
}
</style>
