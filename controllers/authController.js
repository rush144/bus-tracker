const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Driver = require('../models/drivers');
const Passenger = require('../models/passengers');

const register = async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        if (!['driver', 'passenger'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // Check if email already exists in either collection
        const emailTaken = await Driver.findOne({ email }) || await Passenger.findOne({ email });
        if (emailTaken) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Check if username already exists in either collection
        const usernameTaken = await Driver.findOne({ username }) || await Passenger.findOne({ username });
        if (usernameTaken) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare data without role because schema sets it automatically
        const newUserData = {
            name,
            username,
            email,
            password: hashedPassword,
            // no role here
        };

        // Create user based on role
        const user = role === 'driver'
            ? new Driver(newUserData)
            : new Passenger(newUserData);

        await user.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Identifier and password are required' });
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        const user = isEmail
            ? await Driver.findOne({ email: identifier }) || await Passenger.findOne({ email: identifier })
            : await Driver.findOne({ username: identifier }) || await Passenger.findOne({ username: identifier });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login };
