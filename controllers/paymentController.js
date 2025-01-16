const axios = require('axios');

const initiatePayment = async (req, res) => {
    const { amount, timerDuration, phoneNumber } = req.body;

    // Validate phone number format: must start with +254 followed by 9 digits
    const phonePattern = /^\+254\d{9}$/;
    if (!phonePattern.test(phoneNumber)) {
        return res.json({ success: false, message: 'Invalid phone number. It must start with +254 followed by 9 digits.' });
    }

    // Safaricom credentials and API URL
    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;
    const shortcode = process.env.LIPA_NA_MPESA_SHORTCODE;
    const lipaNaMpesaOnlineShortcode = process.env.LIPA_NA_MPESA_SHORTCODE;
    const lipaNaMpesaOnlineShortcodeKey = process.env.LIPA_NA_MPESA_ONLINE_SHORTCODE_KEY;

    // Authenticate with Safaricom API
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const tokenResponse = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { 'Authorization': `Basic ${auth}` }
        });

        const accessToken = tokenResponse.data.access_token;

        // STK Push parameters
        const payload = {
            BusinessShortcode: lipaNaMpesaOnlineShortcode,
            LipaNaMpesaOnlineShortcodeKey: lipaNaMpesaOnlineShortcodeKey,
            PhoneNumber: phoneNumber,  // User's phone number (validated)
            AccountReference: "PERON-TIPS",
            TransactionDesc: `Payment for quiz section with ${timerDuration} seconds timer`,
            Amount: amount,
            PartyA: phoneNumber,  // User's phone number (validated)
            PartyB: lipaNaMpesaOnlineShortcode,
            Shortcode: lipaNaMpesaOnlineShortcode,
        };

        // Send STK Push Request
        const stkPushResponse = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Process the response
        if (stkPushResponse.status === 200) {
            res.json({ success: true, message: 'Payment request initiated' });
        } else {
            res.json({ success: false, message: 'Payment failed, please try again' });
        }
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.json({ success: false, message: 'Payment failed, please try again' });
    }
};

module.exports = { initiatePayment };
