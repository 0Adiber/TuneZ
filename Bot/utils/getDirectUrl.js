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

    fetch(`https://www.youtube.com/get_video_info?video_id=${id}&el=embedded&ps=default&eurl=&gl=US&hl=en"`)
        .then(res => res.text())
        .then(body => {
            if(body.includes('status=fail')) {
                reject(get_error(body));
            }
            
            let x = body.split('&');
            let t = [],g = [],h = [];

            x.forEach(r => {
                let c = r.split('=');
                let n = c[0];let v = c[1];
                t[n]=v;
            });

            let streams = decodeURIComponent(t['url_encoded_fmt_stream_map']).split(',');//url_encoded_fmt_stream_map
            if(streams =='') {
                ytdl.getInfo(id, (err, info) => {
                    if(err) reject("sorry mate, I can't play that");
                    let stream = {};
                    let audio = ytdl.filterFormats(info.formats, 'audioonly');
                    if(audio.length > 0)
                        stream = audio[0];
                    else stream = info.formats[0];
                    console.log('2');
                    resolve(stream);
                });
            } else {
                streams.forEach(dt =>{
                    x = dt.split('&');
                    x.forEach(r =>{
                        c = r.split('=');
                        let n=c[0]; let v = c[1];
                        h[n]=decodeURIComponent(v);
                    });
                    g.push(h);
                });

                let max = 1000;
                let mE;

                g.forEach(e => {
                    if(e['itag']<max) {
                        max = e['itag'];
                        mE = e;
                    }
                });

                //console.log(mE);
                console.log('1');
                resolve(mE);
            }
        })
        .catch(err => console.log(err));

    });
}
/*
async function test(){
	console.log(await get_url('zf2VYAtqRe0'))
}
test();
*/

exports.getUrl = (id) => get_url(id);