import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

// MQTT Configuration       

const MQTT_HOST = process.env.MQTT_BROKER;
const MQTT_PORT = process.env.MQTT_PORT || 8883;
const MQTT_USER = process.env.MQTT_USERNAME;
const MQTT_PASS = process.env.MQTT_PASSWORD;
const MQTT_TOPIC_SENSOR = process.env.MQTT_TOPIC_SENSOR || "waterquality/sensor"; 
const MQTT_TOPIC_CONTROL = process.env.MQTT_TOPIC_CONTROL || "waterquality/control";  


const client = mqtt.connect(`${MQTT_HOST}:${MQTT_PORT}`, {
  username: MQTT_USER,
  password: MQTT_PASS,
  rejectUnauthorized: true
});

client.on("connect", () => {
  console.log("✅ Connected to HiveMQ");

  const sensorPayload = {
    deviceId: "ESP32-001",
    turbidity: 4.5,
    pH: 7.2,
    tds: 310,
    waterQualityIndex: 85,  
    electricalConductivity: 1200,
    location: {
      district: "Lilongwe",
      treatmentPlantId: "TP-01"
    }
  };

  client.publish(
    MQTT_TOPIC_SENSOR,
    JSON.stringify(sensorPayload),
    { qos: 1 },
    (err) => {
      if (err) {
        console.error("❌ Publish error:", err);
      } else {
        console.log("📤 Sensor data published successfully");
      }
      client.end();
    }
  );
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});