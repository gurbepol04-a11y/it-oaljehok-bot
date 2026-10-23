import http from "http";
http.createServer((req,res)=>res.end("It Oaljehok bot is online")).listen(process.env.PORT||3000);
