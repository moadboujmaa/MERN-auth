import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from './emailTemplates.js'
import { mailtrapClient, sender } from './mailtrap.config.js'

export const sendVerificationEmail = async (email, verificationToken) => {
	const recipient = [{ email }]

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationToken),
			category: "Email Verification"
		})
		console.log("Email sent successfully", response);
	} catch (e) {
		console.error("Error sending verification ", error)
		throw new Error(`Error sending verification email ${e}`)
	}
}

export const sendWelcomeEmail = async (email, name) => {
	const recipient = [{ email }]

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			template_uuid: "3a7e4b72-a420-4214-8e3c-aa7de7e92dda",
			template_variables: {
				name
			}
		})
		console.log("Welcome email sent successfully", response);
	} catch (e) {
		console.error("Error sending welcome ", error)
		throw new Error(`Error sending welcome email ${e}`)
	}
}

export const sendPasswordResetEmail = async (email, resetUrl) => {
	const recipient = [{ email }]

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Reset Your Password",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
			category: "Reset Password"
		})


	} catch (err) {
		throw new Error(`Error sending Reset Email ${err}`)
	}
}

export const sendResetSuccessEmail = async (email) => {
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Password Reset Successful", 
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
			category: "Password Reset"
		})
		// console.log("Mail Trap Response: ", response);
	} catch (err) {
		console.log("Error in sending reset password success");
		throw new Error("Error in sending reset password success: ", err);
	}
}