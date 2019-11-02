# sesnsibo-mqtt

Publish status/state of Sensibo devices, and allow setting state over MQTT

Copy `config.example.yml` to `config.yml`, edit the fields, start using `CONFIG_PATH=./config.yml node main`

Once started you will receive status updates on `sensibo/status/{device_id}`

You can change AC state sending to `sensibo/set/{device_id}/acState` [see post details](https://sensibo.github.io/#/paths/~1pods~1{device_id}~1acStates/post), or just single properties using `sensibo/set/{device_id}/acState/{property}` [see patch details](https://sensibo.github.io/#/paths/~1pods~1{device_id}~1acStates~1{property}/patch)

Eg, send to:

- topic = `sensibo/set/Abcd123/acState/on`
- value = `{"newValue": true}`
