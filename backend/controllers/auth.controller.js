import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

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
		await sendVerificationEmail(user.email, verificationToken);
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

export const verifyEmail = async (req, res) => {
	const { code } = req.body;

	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now()}
		});
		console.log("here 1")
		if (!user)
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" })
		console.log("here 2")
		user.isVerified = true;
		user.verificationToken = undefined
		user.verificationTokenExpiresAt = undefined
		console.log("here 3", user.name)
		await user.save()
		console.log("here 4")
		await sendWelcomeEmail(user.email, user.name)
		console.log("here 5")
		return (res.status(200).json({ success: true, message: "Email verified successfully", user: {
			...user._doc,
			password: undefined
		}}))
	} catch (e) {
		console.log("error in verify email", e)
		res.status(500).json({ success: false, message: "Server error" });
	}
}