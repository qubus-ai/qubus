const fs = require('fs');
const { exec } = require('child_process');

if(fs.existsSync('.git'))
{
	exec('git rev-parse HEAD > ./dist/git.info');
}
