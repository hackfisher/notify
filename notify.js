const axios = require('axios');
const notificationapi = require('notificationapi-node-server-sdk').default;
const config = require('./config.json');

// JSON RPC endpoint
const jsonRpcUrl = 'https://darwinia.api.subscan.io/api/v2/scan/search';

// Email configuration
notificationapi.init(
  config.notificationApi.clientId, // clientId
  config.notificationApi.clientSecret// clientSecret
);

// Function to send email
function sendEmail(lastValue, newValue) {
  notificationapi.send({
    notificationId: 'helix_relayer',
    user: {
      id: config.user.id,
      email: config.user.email,
      number: config.user.number // Replace with your phone number
    },
    mergeTags: {
      address: config.ethereum.key,
      prev_balance: lastValue,
      curr_balance: newValue,
      TxId: "Unknown",
    }
  }) 
}

// Function to check the value
let lastValue = null; // Adjust based on your initial condition
let key = config.ethereum.key;

async function checkValue() {
  try {
    var data = JSON.stringify({
        "key": key
    });

    var config = {
        method: 'post',
        url: 'https://darwinia.api.subscan.io/api/v2/scan/search',
        headers: { 
          'User-Agent': 'Apidog/1.0.0 (https://apidog.com)', 
          'Content-Type': 'application/json'
        },
        data : data
    };

    const response = await axios(config);
    console.log('Response:', response.data.data.account.balance);
    const newValue = response.data.data.account.balance;

    if (lastValue !== null && newValue !== lastValue) {
      console.log('Value changed:', newValue);
      sendEmail(lastValue, newValue); // Send email notification
    }

    lastValue = newValue;
  } catch (error) {
    console.error('Error checking value:', error.message);
  }
}

// Interval to check the value every 5 minutes (300000 milliseconds)
setInterval(checkValue, 600000);

// Initial check
checkValue();

