"use strict";

const mqttusvc = require("mqtt-usvc");
const got = require("got");

const service = mqttusvc.create();
const { apiKey, pollInterval = 60000 } = service.config;
if (!apiKey) {
  console.error("No API Key");
  process.exit(1);
}
if (apiKey === "changeme") {
  console.error("Check API configuration");
  process.exit(1);
}

service.on("message", async (topic, data) => {
  try {
    console.log("message", topic);
    if (!topic.startsWith("set/")) return;

    const [_, deviceId, action, property] = topic.split("/");
    if (action !== "acState") {
      throw new Error("Only acState is supported");
    }

    console.info("SET DEVICE", deviceId, action, property, data);

    let url = `https://home.sensibo.com/api/v2/pods/${deviceId}/acStates`;
    let method = "post";
    if (property) {
      url += "/" + property;
      method = "patch";
    }
    url += "?apiKey=" + apiKey;

    got(url, { json: true, body: data, method });
  } catch (err) {
    console.error(String(err));
  }
});

setInterval(async () => {
  try {
    const response = await got(
      "https://home.sensibo.com/api/v2/users/me/pods?fields=id,acState,connectionStatus&apiKey=" +
        apiKey,
      { json: true }
    );

    response.body.result.map(device => {
      const { id, acState, connectionStatus } = device;
      const flattened = { id, ...acState, ...connectionStatus };

      service.send("status/" + id, flattened);
    });
  } catch (err) {
    console.error(String(err));
  }
}, pollInterval);

service.subscribe("set/#");
