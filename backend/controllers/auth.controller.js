import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	try {
		if (!email || !password || !name)
			throw new Error("All fields are required");
		const userAlreadyExists = await User.findOne({ email })
		if (userAlreadyExists)
			return res.status(400).json({ success: false, message: "User already exist" })
		const hashedPass = await bcrypt.hash(password, 10);
		const verificationToken = generateVerificationCode();
		const user = new User({
			email,
			password: hashedPass,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
		})
		await user.save();
		generateTokenAndSetCookie(res, user._id);
		return res.status(201).json({ 
			success: true, 
			message: "User created",
			user: {
				...user,
				password: undefined
			}
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message})
	}
}

export const login = async (req, res) => {
	res.send("login")
}

export const logout = async (req, res) => {
	res.send("logout")
}