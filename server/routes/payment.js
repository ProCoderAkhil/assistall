const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// ---------------------------------------------------------
// 🔐 RAZORPAY CONFIGURATION
// ---------------------------------------------------------
const razorpay = new Razorpay({
    key_id: 'rzp_test_Rp78fSKZ69hMxt', 
    key_secret: 'G2VpSZXzQN7HGSu9zsgSKvAc',
});

// 1. CREATE ORDER API
router.post('/orders', async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100, // Convert Rupee to Paise (e.g., 50 -> 5000)
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).send("Error creating order");
    }
});

// 2. VERIFY PAYMENT API (Security Check)
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac('sha256', 'G2VpSZXzQN7HGSu9zsgSKvAc') // Must match the key_secret above
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            res.json({ status: "success" });
        } else {
            res.status(400).json({ status: "failure" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ status: "error" });
    }
});

module.exports = router;