# localserver

Topic: “lock1” payload: 1
Отправляем на сервер: 
{
Log: { 
        deviceId: "lock1",
        state: "1"
    }
}

Устройство подключается к брокеру (сервер node.js)
В обработчике:
    aedes.on('client', function (client) { //когда к брокеру подключается новый клиент
        console.log('new client', client.id)
    })

Web клиент подписывается:
- запросить список устройств пользователя
- получить состояние замков Topic: 0001/deviceCurrentState

Web клиент публикует:
Topic: 0001/deviceSetState
    
Устройство публикует в Topic: 0001/deviceCurrentState
Устройство подписывается на Topic: 0001/deviceSetState# mqtt-logs
