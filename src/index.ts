import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const regex = RegExp(process.env.REGEXP!);
const naughyThreshhold: number = parseInt(process.env.NAUGHTY_THRESHHOLD!);
const timeoutLengthSeconds: number = parseInt(process.env.TIMEOUT_LENGTH_SECONDS!);
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
	],
});

client.on('ready', () => {
	console.log('The bot is ready.');
});

let naughtyCounter = 0;

client.on('messageCreate', (message) => {

	const author = message.author;
	const content = message.content;

	if (message.author.id == process.env.TARGET_ID && content.toLowerCase().match(regex)) {

		naughtyCounter++;

		message.delete()
			.then(msg => console.log(`Deleted message from ${msg.author.username}\nContent: ${content}`))
			.catch(err => console.error(err));

		// author.send(`<@${process.env.TARGET_ID}> shut the fuck up`);

		if (naughtyCounter >= naughyThreshhold) {
			naughtyCounter = 0;
			message.guild!.members.fetch(author.id)
				.then(member => member.timeout(
					timeoutLengthSeconds * 1000,
					'Timed out for being hopelessly annoying'
				))
				.catch(err => console.error({ err }));
		}
	}
});

client.login(process.env.TOKEN);
