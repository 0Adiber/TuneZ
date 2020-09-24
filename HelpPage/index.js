var express = require('express');
var app = express();

var help = require('./help.json');

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send(json2table(help));
});

function json2table(json) {
    let res = "";

    for(let key in json) {
        res+='<tr style="border:1px solid black;border-collapse:collapse;padding:15px;border-spacing: 5px;text-align:left;">' + '<td style="border:1px solid black;border-collapse:collapse;padding:15px;border-spacing: 5px;text-align:left;">' + key + '</td>' +'<td style="border:1px solid black;border-collapse:collapse;padding:15px;border-spacing: 5px;text-align:left;">' + json[key] + '</td>' + '</tr>'
    }

    return `<table style="width:70%;border: 1px solid black;border-collapse: collapse;position: relative;left:50%;transform:translate(-50%);"> ${res}</table><div style="width: 100%;position:relative;bottom: 0;"><br><h3>Info</h3><p>The country code is an ISO 3166-1 alpha-2 country code. <a href="https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements" target="_blank">HERE</a></p><p>The 'default' commands may not work all the time, and may be slow</p></div>`;
  }

app.listen(7043, () => console.log('Listening on Port 7043'));