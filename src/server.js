const http = require("http")
const fs = require("fs")
const path = require("path")
const { stringify } = require("querystring")
const port = 3000
const email_folder_cache = {}

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

function setupListCache() {
    console.log('\x1b[33m',"Setting up cache...")
    var DB = null
    DB = JSON.parse(fs.readFileSync("src/db.json"))
    if (DB !== null) {
        DB.forEach((element) => {
            const folder = rusToLat(element.folder)
            if (email_folder_cache[folder] == null) {
                email_folder_cache[folder] = []
            }
            email_folder_cache[folder].push(element)
        })
        console.log('\x1b[32m',"Cache ready to go!")
    } else {
        console.log('\x1b[31m',"Could not find db.json to set up mail cache")
    }
}

function sendRes(url, contentType, response){
    if (contentType === "API_REQUEST"){
        console.log('\x1b[35m',"Recieved API request: " + url)
        var ResponseArray = []
        var RequestType = url.split("/")[2]
        var Argument = url.split("/")[3]
        switch (RequestType){
            // Getting emails in certain folders with small data
            case "get_folder_emails": {
                var Amount = url.split("/")[4]
                var RemoveFirst = url.split("/")[5]
                var ResponseArray = []
                if (email_folder_cache[Argument]) {
                    ResponseArray = email_folder_cache[Argument].slice(parseInt(RemoveFirst), parseInt(RemoveFirst) + parseInt(Amount))
                }
                response.writeHead(200, {'Content-Type' : "application/json"})
                response.write(JSON.stringify(ResponseArray))
                response.end()
                return
            }
            // Getting full email file for opening
            case "get_email_by_date": {
                var folder = url.split("/")[4]
                var ResponseArray = []
                ResponseArray = email_folder_cache[folder]
                for (let i = 0; i < ResponseArray.length; i++) {
                    if (ResponseArray[i].date == Argument) {
                        ResponseArray = [ResponseArray[i]]
                        break
                    }
                }
                response.writeHead(200, {'Content-Type' : "application/json"})
                response.write(JSON.stringify(ResponseArray))
                response.end()
                return
            }
        }
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


setTimeout(() => {
    setupListCache()
    server.listen(port, function(error){
        if (error) {
            console.log('\x1b[31m',"Something went wrong!", error)
        } else{
            console.log('\x1b[32m',"Server is listening on port "+ port)
        }
    })
},100)