import { MailtrapClient } from "mailtrap";

import dotenv from "dotenv";

dotenv.config()

const client = new MailtrapClient({
	token: process.env.MAILTRAP_TOKEN,
	endpoint: process.env.MAILTRAP_ENDPOINT
});


const sender = {

	email: "moad@moadboujamaa.me",
	name: "Moad Boujamaa",

};

const recipients = [
	{
		email: "moadboujmaa@gmail.com",
	}
];


client
	.send({
		from: sender,
		to: recipients,
		subject: "You are awesome!",
		text: "Congrats for sending test email with Mailtrap!",
		category: "Integration Test",
	})
	.then(console.log, console.error);