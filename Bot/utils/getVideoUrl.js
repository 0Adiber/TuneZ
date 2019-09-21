
const fetch = require('node-fetch');
const yt = require('youtube-dl');
require('dotenv').config()

const getUrl = async(video) => {

    return new Promise(async(resolve, reject)=>{

        const temp = video;
        video = video[0];

        if(video.startsWith("https://www.youtube.com/") ||  video.startsWith("youtube.com/") || video.startsWith("www.youtube.com/") || video.startsWith("https://youtu.be/") || video.startsWith("youtu.be/")) {

            if(video.includes("list=")) {
                video = video.split("/");
                video = video.pop();

                let startI = video.indexOf("list=");
                let endI = video.indexOf("&", startI);
                    endI = endI===-1?video.length:endI;
                video = video.slice(startI+5, endI);

                /*
                getPlaylist(video, "")
                .then(songs => {
                    resolve({
                        stauts: "success",
                        songs: songs.songs
                    })
                });
                */

                let songs = await getList(video, "");
                resolve({
                    status: "success",
                    songs: songs
                })

                return;
            }

            video = video.split("/");
            video = video.pop().replace("watch?v=", "");

            resolve(getInfo(video));

        } else {
            video = temp.join("+");
            video = video.replace(" ", "+")
            fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q="+video+"&key=" + process.env.YT_API_KEY).then(res => res.json()).then(r => {
                let url = r;
                if(!url.items) {
                    reject({
                        status: "no success",
                        err: "No videos found"
                    });
                    return;
                }
                url = url.items[0].id.videoId;
                
                yt.getInfo("https://www.youtube.com/watch?v=" + url, ['--format=worst'], function(err, info) {
                    if(err) {
                        reject({
                            status: "no success",
                            err: err
                        });
                        return;
                    }
                    resolve({
                        status: "success",
                        title: info.title,
                        url: info.url,
                        officialUrl: "https://www.youtube.com/watch?v=" + info.id,
                        vid: info.id
                    });
                });

            }).catch(err => console.log(err));
        }
    });

}

const getList = async(playlistId, pageToken) => {
    const songInfo = await getPlaylist(playlistId, pageToken);
    if(songInfo.songs) {
        if(songInfo.nextPage) {
            let ss = await getList(songInfo.playlistId, songInfo.nextPage);
            return [...songInfo.songs, ...ss];
        } else {
            return [...songInfo.songs];
        }
    }
    return [];
}

const getPlaylist = (video, pageToken) => {
    return new Promise((resolve, reject) => {
        fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + video + "&key=" + process.env.YT_API_KEY + "&pageToken="+pageToken)
        .then(res => res.json())
        .then(res => {
            if(res.error) {
                reject({
                    status: "no success in fetching youtube playlist",
                    err: res
                });
                return;
            }

            Promise.all(res.items.map(item => {
                return getInfo(item.snippet.resourceId.videoId);
            })).then(promises => {
                resolve({
                    songs: [...promises].filter(v => Object.keys(v).length !== 0),
                    nextPage: res.nextPageToken,
                    playlistId: video
                })
            });
            
        }).catch(err => console.log(err)); 
    });
}

const getCharts = (code) => {
    return new Promise((resolve, reject) => {

        fetch("https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&maxResults=10&videoCategoryId=10&regionCode=" + code + "&key="+process.env.YT_API_KEY)
        .then(res => res.json())
        .then(res => {
            if(res.error) {
                resolve({
                    status: "no success in fetching the charts",
                    err: res
                })
                return;
            }

            Promise.all(res.items.map(item => {
                return getInfo(item.id);
            })).then(promises => {
                resolve({
                    songs: [...promises].filter(v => Object.keys(v).length !== 0)
                });
            });

        }).catch(err => console.log(err));

    });
}

const getInfo = (video) => {
    return new Promise((resolve, reject) => {

        yt.getInfo("https://www.youtube.com/watch?v=" + video, ['--format=worst'], function(err, info) {
                //sometimes: ERROR: This video contains content from SME, who has blocked it on copyright grounds.
                //thats why I resolve an empty object :)
                if(err) {
                    console.log("Probably a copyright error.");
                    resolve({});
                    return;
                }

                resolve({
                    status: "success",
                    title: info.title,
                    url: info.url,
                    officialUrl: "https://www.youtube.com/watch?v=" + video,
                    vid: info.id
                });
            });

    });
}

exports.getUrl = (video) => getUrl(video);
exports.getCharts = (code) => getCharts(code);