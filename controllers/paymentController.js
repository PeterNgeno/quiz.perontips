const axios = require('axios');

const initiatePayment = async (req, res) => {
    const { amount, timerDuration } = req.body;
    
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
            PhoneNumber: "254701234567",  // User's phone number
            AccountReference: "PERON-TIPS",
            TransactionDesc: `Payment for quiz section with ${timerDuration} seconds timer`,
            Amount: amount,
            PartyA: "254701234567",  // User's phone number
            PartyB: lipaNaMpesaOnlineShortcode,
            Shortcode: lipaNaMpesaOnlineShortcode,
            PhoneNumber: "254701234567",
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