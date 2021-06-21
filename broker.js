'use strict'
const express = require('express')
const app = express()
const aedes = require('aedes')() //для MQTT
const server = require('net').createServer(aedes.handle)
const httpServer = require('http').createServer()
const ws = require('websocket-stream') // нужно для работы aedes с MQTT

const port = 1883
const wsPort = 8888

app.use(express.static('client/dist'));


server.listen(port, function () {
  console.log('server listening on port', port)
}) 

app.listen(3000, ()=>{
  console.log('express on 3000')
})

app.get('/', (req, res)=>{
  res.sendFile(__dirname + "/index.html")
  // res.send('hello my dear')
})

app.get('/api/user-devices', (req, res)=>{
  //вытаскиваем с бд список айдишников устройств, передаем на клиент
  
  var obj = {
    devices: [
      "L234",
      "L323",
      "L004"
    ]
  }

  res.json(obj)
})

app.get('/user', (req, res)=>{
  //отправляем инфу о юзере
  
})

//----------MQTT------------
ws.createServer({
  server: httpServer
}, aedes.handle) //запуск брокера

httpServer.listen(wsPort, '0.0.0.0', function () {
  console.log('websocket server listening on port', wsPort)
})

aedes.on('clientError', function (client, err) {
  console.log('client error', client.id, err.message, err.stack)
})

aedes.on('connectionError', function (client, err) {
  console.log('client error', client, err.message, err.stack)
})

//--- Когда кто-то публикует данные в какой-то топик ---
aedes.on('publish', function (packet, client) { 
  if (client) {
    console.log(packet.topic)
    console.log(packet.payload.toString())
    // if (packet.topic != '') { //если поле данных не пустое
      
    //   console.log(packet.payload.toString())
    // }
    
    
  }
})

aedes.on('subscribe', function (subscriptions, client) { //когда кто-то подписывается на какой-то топик
  if (client) {
    console.log('subscribe from client', subscriptions, client.id)
  }
})

aedes.on('client', function (client) { //когда к брокеру подключается новый клиент
  console.log('new client', client.id)
  
})

setInterval(() => {
  aedes.publish({
    cmd: 'publish',
    qos: 2,
    topic: 'petya@example.com/logs',
    payload: new Buffer(`L004 Unlock: ${new Date()}`),
    retain: false
  });
  console.log('interval')
}, 2000);

// function getUser(){

// }

// function getDevices(){

// }


// aedes.subscribe('outTopic', function(packet, cb) {
//   console.log('Published', packet.payload.toString());

//   // aedes.publish({
//   //   cmd: 'publish',
//   //   qos: 2,
//   //   topic: 'inTopic',
//   //   payload: new Buffer('Thank you!'),
//   //   retain: false
//   // });
// });