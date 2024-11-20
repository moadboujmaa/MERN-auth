import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto"
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../mailtrap/emails.js";


export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	console.log("signup body: ", req.body)
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
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email })

		if (!user)
			return res.status(400).json({ success: false, message: "Invalid credentials" })
		const isValidPass = await bcrypt.compare(password, user.password)
		if (!isValidPass)
			return res.status(400).json({ success: false, message: "Invalid credentials" })
		generateTokenAndSetCookie(res, user._id);
		user.lastLogin = Date.now();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined
			}
		})
	} catch (err) {
		console.log("Error in login")
		res.status(400).json({ 
			success: false,
			message: err.message
		})
	}
}

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" })
}

export const verifyEmail = async (req, res) => {
	const { code } = req.body;

	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now()}
		});
		if (!user)
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" })
		user.isVerified = true;
		user.verificationToken = undefined
		user.verificationTokenExpiresAt = undefined
		await user.save()
		await sendWelcomeEmail(user.email, user.name)
		return (res.status(200).json({ success: true, message: "Email verified successfully", user: {
			...user._doc,
			password: undefined
		}}))
	} catch (e) {
		console.log("error in verify email", e)
		res.status(500).json({ success: false, message: "Server error" });
	}
}

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	
	try {
		const user = await User.findOne({ email })
		if (!user)
			return res.status(400).json({ success: false, message: "User not Found" })
		const resetToken = await crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt
		
		await user.save()
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)
		res.status(200).json({ success: true, message: "Password reset link sent to your email" })
	} catch (err) {
		res.status(400).json({ success: false, message: "Couldn't send reset email" })
	}
}

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		console.log("password: ", password)
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() }
		})
		if (!user)
			res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		const hashedPass = await bcrypt.hash(password, 10);
		user.password = hashedPass;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;

		await user.save();
		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successfully" })
	} catch (err) {
		console.log("Error in reset password endpoint: ", err)
		res.status(400).json({ success: false, message: err.message });
	}
}

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user)
			return res.status(400).json({ success: false, message: "User not found" })
		res.status(200).json({ success: true, user})
	} catch (err) {

	}
}