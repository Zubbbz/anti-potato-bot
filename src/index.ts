import { Client, GatewayIntentBits } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import log from './logging';

const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'));

const TOKEN = CONFIG.TOKEN;
const TARGET = CONFIG.TARGET_ID;
const REGEX = RegExp(CONFIG.REGEXP);
const naughyThreshhold: number = parseInt(CONFIG.NAUGHTY_THRESHHOLD);
const timeoutLengthSeconds: number = parseInt(CONFIG.TIMEOUT_LENGTH_SECONDS);

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

	if (message.author.id == TARGET && content.toLowerCase().match(REGEX)) {

		message.delete()
			.then(msg => log(`Deleted message from ${msg.author.username} | Content: ${content}\n`))
			.catch(err => log('MSGDELETE: ' + err + '\n'));

		// timeout the target after they surpass the configurable number of infractions
		naughtyCounter++;
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



client.login(TOKEN)
	.catch(err => log('LOGIN ' + err));
