#!/usr/bin/env node
"use strict";

const mqttusvc = require("mqtt-usvc");
const got = require("got");

async function main() {
  const service = await mqttusvc.create();
  const { apiKey, pollInterval = 60000 } = service.config;
  if (!apiKey) {
    console.error("No API Key");
    process.exit(1);
  }
  if (apiKey === "changeme") {
    console.error("Check API configuration");
    process.exit(1);
  }

  const handlers = {
    acState: async (deviceId, property, data) => {
      console.info("Setting AC state", deviceId, property, data);

      let url = `https://home.sensibo.com/api/v2/pods/${deviceId}/acStates`;
      let method = "post";
      let body = { acState: data };
      if (property) {
        url += "/" + property;
        method = "patch";
        body = { newValue: data };
      }
      url += "?apiKey=" + apiKey;

      //await got(url, { json: true, body, method });
	  const body_response = await got(url, { json: body, method });
	  
	  console.log(body_response);
    },
    smartmode: async (deviceId, property, data) => {
      await got(
        `https://home.sensibo.com/api/v2/pods/${deviceId}/smartmode?apiKey=${apiKey}`,
        { method: "put", json: { enabled: data } }
      );
    }
  };

  service.on("message", async (topic, data) => {
    try {
      console.info("message", topic);
      if (!topic.startsWith("~/set/")) return;

      const [, , deviceId, action, property] = topic.split("/");
  
      const handler = handlers[action];
      if (!handler) {
        throw new Error(action + " is not supported");
      }

      await handler(deviceId, property, data);
      await poll();
    } catch (err) {
      console.error(String(err));
    }
  });
  
  async function poll() {
	//console.info("Polling...");
    try {
      const response = await got(
        "https://home.sensibo.com/api/v2/users/me/pods?fields=id,acState,connectionStatus,smartMode,measurements&apiKey=" +
          apiKey
      );

      JSON.parse(response.body).result.map(device => {
        const {
          id,
          acState,
          connectionStatus,
          smartMode,
          measurements = {}
        } = device;
        const flattened = {
          id,
          ...acState,
          ...connectionStatus,
          smartModeEnabled: (smartMode && smartMode.enabled) || false,
          temperature: measurements.temperature,
          humidity: measurements.humidity
        };
		//console.info("Received..."+response.body);
        service.send("~/status/" + id, flattened);
      });
    } catch (err) {
      console.error(String(err.stack));
    }
  }

  setInterval(poll, pollInterval);

  service.subscribe("~/set/#");
  
  poll();
}

main().catch(err => {
  //console.info("Error");
  console.error(err.stack);
  process.exit(1);
});
