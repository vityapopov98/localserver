<template>
  
  <div>
    <select class="form-select circleButton" aria-label="Default select example" @change="changeSelectedCommunity($event)" :disabled="disabled">
      <!--   -->
        <option 
                :selected="device == selectedDevice"
                :value="device" v-for="(device) in devices" 
                :key="device"> 
                    {{device}}
        </option>

    </select>
  </div>
  
</template>

<script>

export default {
  name: 'ComboBox',
  props: {
    msg: String,
    currentDevice: null,
    disabled: Boolean,
    user: Object
  },
  data(){
    return {
      devices: [],
      selectedDevice: '',
    }
  },
  methods:{
    loadOptions(){
      console.log('get from component ', this.currentDevice)
      fetch(`/api/user-devices?id=${this.user.id}`, {'Content-Type': 'application/json',
      'Accept': 'application/json',}).then(data=>{
          console.log(data)
          return data.json()
      }).then(json=>{
        console.log(json)
          this.devices = json.devices
      }).catch(err=>{
          console.log(err)
      })
      
    },
    changeSelectedCommunity(event){
      console.log('communityId', event.target.options[event.target.options.selectedIndex].value)
      this.selectedDevice = event.target.options[event.target.options.selectedIndex].value
      this.$emit('deviceSelected', {device: this.selectedDevice})
    }
  },
  mounted(){
    console.log('get from component ', this.currentDevice)
    this.loadOptions()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
