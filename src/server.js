const http = require("http")
const fs = require("fs")
const path = require("path")
const port = 3000

function rusToLat(str) {
    if (str) {
        let ru = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 
            'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z', 'и': 'i', 
            'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 
            'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 
            'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya',
            'ъ': 'ie', 'ь': '', 'й': 'i'
        };
        let newString = [];
        
        return [...str].map(l => {
            let latL = ru[l.toLocaleLowerCase()];
            
            if (l !== l.toLocaleLowerCase()) {
              latL = latL.charAt(0).toLocaleUpperCase() + latL.slice(1);
            } else if (latL === undefined) {
              latL = l;
            }
            
            return latL;
        }).join('');
    } else {
        return "_"
    }
}

function sendRes(url, contentType, response){
    if (contentType === "API_REQUEST"){
        let file = __dirname + "/db.json"
        var DB = null
        fs.readFile(file,(error,content) => {
            if (error) {
                response.writeHead(404)
                console.log('\x1b[31m',"Could not find db.json...")
                response.end()
            } else {
                DB = JSON.parse(content)
                var ResponseArray = DB
                var RequestType = url.split("/")[2]
                var Argument = url.split("/")[3]
                var Amount = url.split("/")[4]
                var RemoveFirst = url.split("/")[5]
                console.log('\x1b[35m',"Recieved API request: " + url)
                if (RemoveFirst == null || Amount == null) {RemoveFirst = 0; Amount = 20}
                switch (RequestType){
                    // Getting emails in certain folders with small data
                    case "get_folder_emails": {
                        ResponseArray = []
                        var Done = false
                        DB.forEach(element => {
                            if (Done) {return}
                            if (rusToLat(element.folder) == Argument) {
                                if (RemoveFirst <= 0) {
                                    ResponseArray.push(element)
                                } else {
                                    RemoveFirst -= 1
                                }
                            }
                            if (ResponseArray.length >= Amount) {Done = true}
                        });
                        response.writeHead(200, {'Content-Type' : "application/json"})
                        response.write(JSON.stringify(ResponseArray))
                        response.end()
                        return
                    }
                    // Getting full email file for opening
                    case "get_email_by_date": {
                        ResponseArray = []
                        DB.forEach(element => {
                            if (element.date === Argument) {
                                ResponseArray.push(element)
                            }
                        });
                        response.writeHead(200, {'Content-Type' : "application/json"})
                        response.write(JSON.stringify(ResponseArray))
                        response.end()
                        return
                    }
                }
            }
        })
    } else {
        let file = path.join(__dirname+"/",url)
        fs.readFile(file,(error,content) => {
            if (error){
                response.writeHead(404)
                response.write("File not found | 404")
                response.end()
                console.log('\x1b[31m',"Could not find file: "+file)
            } else {
                response.writeHead(200, {'Content-Type' : contentType})
                response.write(content)
                response.end()
                console.log('\x1b[0m',"Got file: " + file)
            }
        })
    }
}

function getContentType(url){
    switch (path.extname(url)){
        case ".html": return "text/html"
        case ".css": return "text/css"
        case ".js": return "text/javascript"
        case ".json": return "application/json"
        case ".svg": return "image/svg"
        case ".png": return "image/png"
        default: return "application/octate-stream"
    }
}

const server = http.createServer(function(request,response){
    if (request.url === "/"){
        sendRes("index.html","text/html",response)
    } else if (request.url.substring(1,4) === "api") {
        sendRes(request.url, "API_REQUEST", response)
    } else {
        sendRes(request.url, getContentType(request.url), response)
    }
})

server.listen(port, function(error){
    if (error) {
        console.log('\x1b[31m',"Something went wrong!", error)
    } else{
        console.log('\x1b[0m',"Server is listening on port "+ port)
    }
})