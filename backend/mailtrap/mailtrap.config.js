import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv"

dotenv.config()

const TOKEN = "408ac1e13371edbc4d35e4649b1f0db5";

const client = new MailtrapClient({
  	token: TOKEN,
});

const sender = {
	email: "hello@moadboujamaa.me",
name: "Test User",
};
const recipients = [
	{
		email: "moadboujmaa@gmail.com",
	}
];

client.send({
	from: sender,
	to: recipients,
	subject: "You are awesome!",
	text: "Congrats for sending test email with Mailtrap!",
	category: "Integration Test",
})
.then(console.log, console.error);