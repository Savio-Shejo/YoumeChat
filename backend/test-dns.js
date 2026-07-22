const dns = require("node:dns");

dns.setDefaultResultOrder("ipv4first");

dns.promises
    .resolveSrv("_mongodb._tcp.savio.gtoc9il.mongodb.net")
    .then(console.log)
    .catch(console.error);