const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

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

    const formattedPhone = phoneNumber.toString().trim();

    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await OTP.findOneAndUpdate(
        { phoneNumber: formattedPhone },
        { otp: otpCode, createdAt: new Date() },
        { upsert: true, new: true }
    );

    console.log(`OTP for ${formattedPhone}: ${otpCode}`);

    res.status(200).json({
        message: 'OTP sent successfully',
        phoneNumber: formattedPhone
    });
});

app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: 'Phone number and OTP are required' });
        }

        const formattedPhone = phoneNumber.toString().trim();
        const formattedOtp = otp.toString().trim();

        console.log(`Verifying OTP for ${formattedPhone}: ${formattedOtp}`);

        // Demo OTP verification
        let isValid = false;
        const otpEntry = await OTP.findOne({ phoneNumber: formattedPhone, otp: formattedOtp });
        if (otpEntry) {
            isValid = true;
        }

        if (!isValid) {
            console.log(`Failed verification for ${formattedPhone}: Invalid or expired OTP`);
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

        // Delete OTP after verification if it was a real one
        if (otpEntry) {
            await OTP.deleteOne({ _id: otpEntry._id });
        }

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
