const proc = require('child_process');
const util = require('util');

module.exports = util.promisify(async function (doc, format, cb) {
	const isJwt = format.endsWith('-jwt');
	const type = format === 'vc' || format == 'vc-jwt' ? 'credential'
		: format === 'vp' || format == 'vp-jwt' ? 'presentation'
		: null;
	if (!type) throw new Error('Unknown format: ' + format);
	const data = JSON.stringify(isJwt ? {jwt: doc} : doc);
	const child = proc.spawn('docker-compose', [
		'run', 'spruce', type, 'verify',
		'--format', format
	], {
		stdio: ['pipe', 'pipe', 'inherit']
	});
	let bufs = [];
	child.stdout.on('data', (buf) => bufs.push(buf));
	child.on('close', (code) => {
		if (code !== 0) {
			return cb(null, {verified: false, code})
		}
		const data = Buffer.concat(bufs).toString('utf8');
		cb(null, JSON.parse(data));
	});
	child.stdin.end(data);
});
