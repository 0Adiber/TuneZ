
const fetch = require('node-fetch');
const config = require('../config.json');
const yt = require('youtube-dl');

const getUrl = async(video) => {

    return new Promise((resolve, reject)=>{

        if(video.startsWith("https://www.youtube.com/") ||  video.startsWith("youtube.com/") || video.startsWith("www.youtube.com/") || video.startsWith("https://youtu.be/") || video.startsWith("youtu.be/")) {
            video = video.split("/");
            video = video.pop().replace("watch?v=", "");

            yt.getInfo("https://www.youtube.com/watch?v=" + video, ['--format=worst'], function(err, info) {
                if(err) {
                    throw err;
                }
                let url = info.url;

                fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + video + "&key=" + config.apiKey).then(res => res.json()).then(r => {
                    let title = r.items[0].snippet.title;
                    resolve({
                        status: "success",
                        title: title,
                        url: url
                    });
                }).catch(err => console.log(err));
            });

        } else {
            video = video.replace(" ", "+")
            fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q="+video+"&key=" + config.apiKey).then(res => res.json()).then(r => {
                let url = r;
                if(url.items.length == 0) {
                    resolve({
                        status: "success",
                        title: title,
                        url: url 
                    });
                }
                let title = url.items[0].snippet.title;
                url = url.items[0].id.videoId;
                fetch("http://youlink.epizy.com/?url=https://youtube.com/watch?v=" + url).then(res => res.json()).then(r => {
                    url = r;
                    url = url[url.length-1].url;
                    resolve({
                        status: "success",
                        title: title,
                        url: url 
                    });
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }


    });

}

exports.getUrl = (video) => getUrl(video);