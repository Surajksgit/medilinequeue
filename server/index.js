const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediline';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Model
const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true },
    name: String,
    age: Number,
    gender: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// OTP Model (simple storage for verification)
const otpSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires in 5 mins
});

const OTP = mongoose.model('OTP', otpSchema);

// Specialist Model
const specialistSchema = new mongoose.Schema({
    name: String,
    specialty: String,
    fee: Number,
    availability: String,
    icon: String, // lucide icon name
});

const Specialist = mongoose.model('Specialist', specialistSchema);

// Routes
app.post('/api/auth/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });

    // Sanitize: Keep only digits
    const formattedPhone = phoneNumber.toString().replace(/\D/g, '');

    if (formattedPhone.length < 10) {
        return res.status(400).json({ message: 'Invalid phone number format. Please provide at least 10 digits.' });
    }

    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await OTP.findOneAndUpdate(
        { phoneNumber: formattedPhone },
        { otp: otpCode, createdAt: new Date() },
        { upsert: true, new: true }
    );

    console.log(`[Send-OTP] OTP for ${formattedPhone}: ${otpCode}`);

    res.status(200).json({
        message: 'OTP sent successfully',
        phoneNumber: formattedPhone,
        otp: otpCode // Including OTP in response for testing/development
    });
});

app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: 'Phone number and OTP are required' });
        }

        // Sanitize: Keep only digits
        const formattedPhone = phoneNumber.toString().replace(/\D/g, '');
        const formattedOtp = otp.toString().trim();

        console.log(`[Verify-OTP] Attempting to verify ${formattedPhone} with OTP: ${formattedOtp}`);

        // Demo OTP verification (with bypass for 123456)
        let isValid = false;

        // 1. Check for bypass
        if (formattedOtp === '123456') {
            console.log(`[Verify-OTP] Using demo bypass (123456) for ${formattedPhone}`);
            isValid = true;
        } else {
            // 2. Check DB
            const otpEntry = await OTP.findOne({ phoneNumber: formattedPhone, otp: formattedOtp });
            if (otpEntry) {
                console.log(`[Verify-OTP] Found valid OTP entry in DB for ${formattedPhone}`);
                isValid = true;
                // Delete OTP after successful verification
                await OTP.deleteOne({ _id: otpEntry._id });
            } else {
                // Debugging: see what's in the DB for this phone
                const existing = await OTP.findOne({ phoneNumber: formattedPhone });
                if (existing) {
                    console.log(`[Verify-OTP] Found mismatched OTP in DB for ${formattedPhone}. Expected: ${existing.otp}, Got: ${formattedOtp}`);
                } else {
                    console.log(`[Verify-OTP] No OTP entry found in DB for ${formattedPhone}`);
                }
            }
        }

        if (!isValid) {
            console.log(`[Verify-OTP] Failed verification for ${formattedPhone}: Invalid or expired OTP`);
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Find or create user
        let user = await User.findOne({ phoneNumber: formattedPhone });
        if (!user) {
            console.log(`Creating new user for ${formattedPhone}`);
            user = await User.create({ phoneNumber: formattedPhone });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });



        console.log(`Successfully verified ${formattedPhone}`);

        res.status(200).json({
            message: 'Verification successful',
            token,
            user: {
                id: user._id,
                phoneNumber: user.phoneNumber,
                name: user.name,
                isProfileComplete: !!user.name
            }
        });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
});

app.post('/api/user/profile', async (req, res) => {
    const { token, name, age, gender } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        const user = await User.findByIdAndUpdate(decoded.userId, { name, age, gender }, { new: true });
        res.status(200).json({ user });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.get('/api/specialists', async (req, res) => {
    const specialists = [
        { id: 'ent', name: 'ENT Specialist', specialty: 'Otolaryngology', fee: 350, icon: 'Stethoscope' },
        { id: 'gastro', name: 'Gastroenterologist', specialty: 'Digestive System', fee: 500, icon: 'Heart' },
        { id: 'ortho', name: 'Orthopedic Surgeon', specialty: 'Bones & Joints', fee: 450, icon: 'ShieldCheck' },
        { id: 'physician', name: 'General Physician', specialty: 'Primary Care', fee: 150, icon: 'Users' },
        { id: 'cardio', name: 'Cardiologist', specialty: 'Heart Health', fee: 500, icon: 'Heart' }
    ];
    res.json(specialists);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
