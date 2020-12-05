'use strict'
const express = require('express')
const app = express()

const aedes = require('aedes')() //для MQTT
const server = require('net').createServer(aedes.handle)
const httpServer = require('http').createServer()
const WebSocket = require('ws') //веб сокеты для связи с сервером в интернете
const ws = require('websocket-stream') // нужно для работы aedes с MQTT
const { Console } = require('console')
// const { trace } = require('console')
const port = 1883
const wsPort = 8888

// bodyParser = require('body-parser');

// support parsing of application/json type post data
// app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('client/dist'));


//----------- Связь с интернет сервером --------------
//----------------------------------------------------

  // 'ws://localhost:3000'
// const toServerScoket = new WebSocket('ws://greenzoneweb.herokuapp.com/') //Формирование сокета к серверу в интернете

// toServerScoket.on("error", (err) =>{
//   console.log("Caught flash policy server socket error: ")
//   console.log(err)
// })

// toServerScoket.on('open', function open(){
//   toServerScoket.send('something')
//   console.log('send something')
// })

// toServerScoket.on('message', function incoming(data){ // когда пришло сообщение от интернет сервера
//   console.log('server socket data ', data);
  
//   try {
//     var parsedData = JSON.parse(data) // парсим json в обычный объект
//     // В объекте хранится топик (destinationName) и данные (payload)
//     console.log(parsedData)
//     aedes.publish({
//             cmd: 'publish',
//             qos: 2,
//             topic: parsedData.destinationName,
//             payload: parsedData.payload.toString(),
//             retain: false
//           });
//   } catch (error) {
//     console.log('can t parse data')
//   }
// })




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

aedes.on('publish', function (packet, client) { //Когда кто-то публикует данные в какой-то топик
  if (client) {
    // console.log(packet)


    //-------- по сути не нужно --------
    if (packet.payload.toString() != '') { //если поле данных не пустое
      console.log(packet.payload.toString())
    }
    //-------- конец не нужного ------


    var dataBuffer = { // формируем объект для отправки данных в интернет
        destinationName: packet.topic, 
        payload: packet.payload.toString()
    }
    // toServerScoket.send(JSON.stringify(dataBuffer)) //данные отправляем через веб сокет на сервер в интернете
    
    // console.log('message from client', client.id)

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