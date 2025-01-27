const axios = require('axios');

// Initiate Payment
const initiatePayment = async (req, res) => {
    const { amount, timerDuration, phoneNumber } = req.body;

    // Retrieve credentials from environment variables
    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;
    const shortcode = process.env.LIPA_NA_MPESA_SHORTCODE;
    const passkey = process.env.LIPA_NA_MPESA_ONLINE_SHORTCODE_KEY;
    const callbackURL = process.env.CALLBACK_URL; // Callback URL loaded from .env

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    try {
        // Authenticate with Safaricom API
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const tokenResponse = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { 'Authorization': `Basic ${auth}` }
        });

        const accessToken = tokenResponse.data.access_token;

        // Prepare the STK Push payload
        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: shortcode,
            PhoneNumber: phoneNumber,
            CallBackURL: callbackURL,
            AccountReference: "SANGPOINT",
            TransactionDesc: `Payment for quiz section (${timerDuration} seconds timer)`
        };

        // Send the STK Push request to the Safaricom API
        const stkPushResponse = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Process the response
        if (stkPushResponse.status === 200) {
            res.json({ success: true, message: 'Payment request initiated. Please check your phone for payment confirmation.' });
        } else {
            res.json({ success: false, message: 'Payment initiation failed, please try again later.' });
        }
    } catch (error) {
        console.error('Error initiating payment:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Payment failed, please try again.' });
    }
};

// Callback function to handle payment status updates
const handleCallback = (req, res) => {
    const { Body } = req.body;

    if (Body.stkCallback) {
        const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

        if (ResultCode === 0) {
            // Payment successful
            console.log("Payment Successful:", CallbackMetadata);
            // Save transaction details in the database or perform further operations
        } else {
            console.log("Payment Failed:", ResultDesc);
        }
    }

    res.status(200).json({ message: "Callback received and processed." });
};

module.exports = { initiatePayment, handleCallback };
