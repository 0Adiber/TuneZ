const fetch = require('node-fetch');
const ytdl = require('ytdl-core');

function get_error(err) {
    let error = {};
    error.error = true;
    err = err.substring(err.indexOf('reason'), err.indexOf('&', err.indexOf('reason'))).replace("+"," ");
    error.msg = err;
    return error;
}

async function get_url(id) {
    return new Promise((resolve, reject) => {
    
        ytdl.getInfo(id, (err, info) => {
            if(err) reject("sorry mate, I can't play that");
            let stream = {};
            let audio = ytdl.filterFormats(info.formats, 'audioonly');
            if(audio.length > 0)
                stream = audio[0];
            else stream = info.formats[0];
            resolve(stream);
        });

    });
}

/*
async function test(){
	console.log(await get_url('zf2VYAtqRe0'))
}
test();
*/

exports.getUrl = (id) => get_url(id);