# sesnsibo-mqtt

Publish status/state of Sensibo devices, and allow setting state over MQTT

Copy `config.example.yml` to `config.yml`, edit the fields, start using `CONFIG_PATH=./config.yml node main`

Once started you will receive status updates on `sensibo/status/{device_id}`

You can change AC state sending to `sensibo/set/{device_id}/acState` [see post details](https://sensibo.github.io/#/paths/~1pods~1{device_id}~1acStates/post), or just single properties using `sensibo/set/{device_id}/acState/{property}` [see patch details](https://sensibo.github.io/#/paths/~1pods~1{device_id}~1acStates~1{property}/patch) or enable climate react using `sensibo/set/{device_id}/smartmode`
[see put details](https://sensibo.github.io/#/paths/~1pods~1{device_id}~1smartmode/put)

Eg, send to:

- topic = `sensibo/set/Abcd123/acState/on`
- value = `true`

or

- topic = `sensibo/set/Abcd123/smartmode`
- value = `true`

or

- topic = `sensibo/set/Abcd123/acState`
- value = `{"on"true,"mode":"cool","fanLevel":"auto","targetTemperature":22}`
