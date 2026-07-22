const dns = require("node:dns");

dns.setServers(["103.199.160.80", "103.160.195.230"]);

dns.promises
    .resolveSrv("_mongodb._tcp.savio.gtoc9il.mongodb.net")
    .then(console.log)
    .catch(console.error);