const http = require('http')

http.createServer(function(req,res) {
    res.writeHead 200, {`"Content-Type : text/plain`}
    res.end "saya belajar web"

}).listen(3000)
