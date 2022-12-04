import * as fs from 'fs';

export default function log(content: string):void {
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
