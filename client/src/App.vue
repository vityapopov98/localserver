<template>
  <div id="app" >

  <h1>Lock/Unlock</h1>
  
  <div class="toolbar">
    <div class="user">
      <p>Здравствуйте, {{user.name}}</p>
    </div>
    <!-- <button class="btn btn-link">Добавить устройство</button> -->
  </div>
  <combo-box :user="user" @deviceSelected="setDevice"/>
    <div class="devicelist">
      <div class="device" v-for="(device, index) in filteredDevices" :key="index">
        {{device}}
        <button class="btn btn-secondary" @click="unlock(device)">Unlock</button>
        <button class="btn btn-primary" @click="lock(device)">Lock</button>
      </div>
    </div>
    
    <div class="logs">
      <p>{{logs}}</p>
    </div>
  </div>
</template>

<script>
import ComboBox from './components/ComboBox.vue'
import Paho from 'paho-mqtt'

export default {
  name: 'App',
  components: {
    ComboBox
  },
  data: function(){
    return{
      client: new Paho.Client("192.168.0.23", 8888, "myClientId" + new Date().getTime()),
      user: {
        id: 'petya@example.com',
        name: 'Петр'
      },
      devices: ["L0101", "L0123"],
      logs: [],
      selectedDevice: ''
    }
  },

  methods:{
    mqtt(){
      this.client.onConnectionLost = this.onConnectionLost;
      this.client.onMessageArrived = this.onMessageArrived;
      this.client.connect({ onSuccess: this.onConnect });
    },
    onConnect() {
      console.log("onConnect");

      this.devices.forEach(element => {
        this.client.subscribe(`${element}/deviceCurrentState`)
      });
  // petya@example.com/logs
      this.client.subscribe(`${this.user.id}/logs`)
    },
    onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
      }
      this.client.connect({ onSuccess: this.onConnect });
    },
    onMessageArrived(message) {
      console.log(message)
      this.logs.push(message.payloadString)
    },
    publish(dest, msg){
      let message = new Paho.Message(msg);
      message.destinationName = dest;
      this.client.send(message);
    },
    lock(device){
      this.publish(`${device}/deviceSetState`, '1')
    },
    unlock(device){
      this.publish(`${device}/deviceSetState`, '0')
    },
    setDevice(params){
      this.selectedDevice = params.device
      console.log('device selected', params)
    }

  },
  computed: {
    filteredDevices: function(){
      var devicesArray = this.devices;
      var searchString = this.selectedDevice;

      if (!searchString) {
        return devicesArray;
      }

      searchString = searchString.trim().toLowerCase();

      devicesArray = devicesArray.filter(function(item){
        if (item.toLowerCase().indexOf(searchString) !== -1) {
          return item;
        }
      })

      return devicesArray;
    }

  },
  mounted(){
    this.mqtt()

    fetch(`/api/user-devices?id=${this.user.id}`, {'Content-Type': 'application/json',
      'Accept': 'application/json',}).then(data=>{
          console.log(data)
          return data.json()
      }).then(json=>{
          this.devices = json.devices
          this.selectedDevice = this.devices[0]
      }).catch(err=>{
          console.log(err)
      })


  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* color: #e7e7e7; */
  padding-top: 5rem;
  width: 60%;
  margin: auto;
  height: 100vh;
  color: #111111;
}
.device{
  background-color: aliceblue;
  padding: 1rem;
  width: 100%;
  margin: 1rem 0;
}
.device>button{
  margin: 0 .5rem;
}
.toolbar{
  display: flex;

}
.user{
  flex-grow: 1;
}
.btn-link{
  text-decoration: none !important;
  justify-content: flex-end;
}
.logs{
  background-color: #e7e7e7;
  height: 300px;
  overflow-y: scroll;
}
</style>
