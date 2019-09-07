
const fetch = require('node-fetch');
const config = require('../../config.json');
const yt = require('youtube-dl');

const getUrl = async(video) => {

    return new Promise((resolve, reject)=>{

        if(video.startsWith("https://www.youtube.com/") ||  video.startsWith("youtube.com/") || video.startsWith("www.youtube.com/") || video.startsWith("https://youtu.be/") || video.startsWith("youtu.be/")) {
            video = video.split("/");
            video = video.pop().replace("watch?v=", "");

            yt.getInfo("https://www.youtube.com/watch?v=" + video, ['--format=best'], function(err, info) {
                if(err) {
                    reject({
                        stauts: "no success",
                        err: err
                    });
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
                
                yt.getInfo("https://www.youtube.com/watch?v=" + video, ['--format=best'], function(err, info) {
                    if(err) {
                        reject({
                            stauts: "no success",
                            err: err
                        });
                    }
                    url = info.url;
                    resolve({
                        status: "success",
                        title: title,
                        url: url
                    });
                });

            }).catch(err => console.log(err));
        }


    });

}

exports.getUrl = (video) => getUrl(video);