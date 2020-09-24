const video = require('./getVideoUrl');
const fetch = require('node-fetch')
const getSearch = async(query, order) => {

    return new Promise(async(resolve, reject)=>{
        let channelId;
        if(query.startsWith("https://www.youtube.com/") ||  query.startsWith("youtube.com/") || query.startsWith("www.youtube.com/") || query.startsWith("https://youtu.be/") || query.startsWith("youtu.be/")) {
            return;
        }
        query = query.replace(" ", "+").replace(",", "+");

        fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q="+query+"&key="+process.env.YT_API_KEY).then(res => res.json()).then(rrr => {
            if(rrr.error) {
                reject({status:"no success", err: "No results"});
                return;
            }
            if(!rrr.items){
                reject({status:"no success", err: "No channel found"});
                return;
            }
            channelId = rrr.items[0].id.channelId;
            
            fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&channelId="+ channelId +"&order="+ order + "&q="+query+"&key=" + process.env.YT_API_KEY).then(res => res.json()).then(r => {
                let url = r;
                if(!url.items || url.items.length == 0) {
                    reject({
                        status: "no success",
                        err: "No videos found"
                    });
                    return;
                }

                Promise.all(url.items.map(item => {
                    return video.getInfo(item.id.videoId);
                })).then(promises => {
                    resolve({
                        songs: [...promises].filter(v => Object.keys(v).length !== 0),
                        status: "success"
                    })
                }).catch(err => console.log(err));
                
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    });

}

exports.getSearch = (video,order) => getSearch(video,order);