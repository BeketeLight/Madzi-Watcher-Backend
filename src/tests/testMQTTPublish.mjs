import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

// MQTT Configuration       

const MQTT_BROKER = process.env.MQTT_BROKER;
const MQTT_PORT = process.env.MQTT_PORT || 8883;
const MQTT_USER = process.env.MQTT_USERNAME;
const MQTT_PASS = process.env.MQTT_PASSWORD;
const MQTT_TOPIC_SENSOR = process.env.MQTT_TOPIC_SENSOR || "waterquality/sensor"; 
const MQTT_TOPIC_CONTROL = process.env.MQTT_TOPIC_CONTROL || "waterquality/control";  


const client = mqtt.connect(`${MQTT_BROKER}:${MQTT_PORT}`,{
  username: process.env.MQTT_USERNAME, // Optional: for authenticated brokers
  password: process.env.MQTT_PASSWORD, //Optional: for authenticated brokers
  clientId: "CLIENT-TEST-PUBLISHER",
  clean: true,
  protocol: 'mqtts', // Use 'mqtts' for secure connection, 'mqtt' for unencrypted
  reconnectPeriod: 1000,
  rejectUnauthorized: false,   // Allow HiveMQ's certificate
  connectTimeout: 4000,       // Increase to 20 seconds for the cloud hop
  keepalive: 60,
});

client.on("connect", () => {
  console.log("✅ Connected to MQTT MQTT_BROKER");

  const sensorPayload = {
    deviceId: "ESP32-001", 
    turbidity: Number((Math.random() * 7.5 + 0.5).toFixed(1)),     // 0.5 – 8.0 NTU
    pH: Number((Math.random() * 1.4 + 6.8).toFixed(1)),           // 6.8 – 8.2
    tds: Math.floor(Math.random() * 251 + 200),                   // 200 – 450 ppm
    waterQualityIndex: Math.floor(Math.random() * 26 + 70),       // 70 – 95 (simulated WQI)
    electricalConductivity: Math.floor(Math.random() * 601 + 800), // 800 – 1400 µS/cm
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