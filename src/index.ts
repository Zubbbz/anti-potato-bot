import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

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
			.then(msg => log(`Deleted message from ${msg.author.username} | Content: ${content}\n`))
			.catch(err => log('MSGDELETE: ' + err + '\n'));

		if (naughtyCounter >= naughyThreshhold) {
			naughtyCounter = 0;
			message.guild!.members.fetch(author.id)
				.then(member => {
					member.timeout(
						timeoutLengthSeconds * 1000,
						'Timed out for being hopelessly annoying'
					)
						.then(() => log('Timed out ' + author.username + '\n'))
						.catch(err => log('USERTIMEOUT: ' + err + '\n'));
				})
				.catch(err => log('MEMBERFETCH: ' + err));
		}
	}
});

function log(content: string):void {
	let status: string;
	if (content.toLowerCase().match(/error/)) {
		status = 'ERROR';
	} else {
		status = 'INFO ';
	}
	try {
		fs.appendFileSync(
			'./log/' + new Date().toLocaleDateString().replace(/\//g, '-') + '.txt',
			'| ' + Date.now() + ' | ' + status + ' | ' + content
		);
	} catch {
		fs.mkdirSync('./log');
	}
}

client.login(process.env.TOKEN);
