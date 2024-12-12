const io = require("socket.io-client");
const axios = require("axios"); 

const socket = io("http://localhost:5000");

async function fetchLoggedInUserIds() {
  try {
    const response = await axios.get("http://localhost:5000/admin/users"); 
    return response.data.map(user => user._id); 
  } catch (error) {
    console.error("Error fetching logged-in user IDs:", error);
    return [];
  }
}

function generateRandomLocation() {
  const latitude = (Math.random() * 180 - 90).toFixed(6);
  const longitude = (Math.random() * 360 - 180).toFixed(6); 0
  return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
}

async function sendLocationPings() {
  const userIds = await fetchLoggedInUserIds();

  if (userIds.length === 0) {
    console.warn("No logged-in users found to send location pings.");
    return;
  }

  setInterval(() => {
    userIds.forEach((userId) => {
      const { latitude, longitude } = generateRandomLocation();
      const locationPingData = {
        userId: userId,
        latitude: latitude,
        longitude: longitude,
      };

      console.log("Sending locationPing for user:", userId, locationPingData);
      socket.emit("locationPing", locationPingData);
    });
  }, 4000);
}

sendLocationPings();

socket.on("pingAcknowledged", (data) => {
  console.log("Server acknowledged ping:", data);
});