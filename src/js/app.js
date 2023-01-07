const main = document.querySelector("main")
const sidebar = document.querySelector("#sidebar")
const primary = document.querySelector(".primary")
const list = document.querySelector("#list")
const viewer = document.querySelector("#viewer")
const http = new XMLHttpRequest()
const nomail = document.querySelector(".no-mail")
const filters = document.querySelector(".filters")
const filter_options = document.querySelector(".filter-options")
const filter_button = document.querySelector(".filter-button")
const filter_options_all = document.querySelectorAll(".filter-options > h3")

var using_filters = []

const sidebar_buttons = document.querySelectorAll("#folders > button")
var last_folder = null
var ItemsRendered = 0
const Step = 20

function addClass(element,setClass){
    element.classList.add(setClass)
}

// Cyrilic to Latin alphabet converter
function rusToLat(str) {
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
}

function apply_filters() {
    const email_list = document.querySelectorAll("#list > div")
    var ShownCounter = 0
    email_list.forEach((email_element) => {
        var hide = false
        if (email_element.classList.contains("unread") == false && using_filters.find((e) => e == "Unread")) {
            hide = true
        }
        const attachment_icon = email_element.querySelector(".attachment")
        if (attachment_icon == null && using_filters.find((e) => e == "Attachment")) {
            hide = true
        }
        const bookmark_icon = email_element.querySelector(".bookmark_icon")
        if (bookmark_icon.classList.contains("enabled") == false && using_filters.find((e) => e == "Bookmark")) {
            hide = true
        }
        if (hide == true) {
            email_element.classList.add("hidden")
        } else {
            email_element.classList.remove("hidden")
            ShownCounter += 1
        }
    })
    if (ShownCounter > 0) {
        nomail.setAttribute("style","display: none;")
    } else {
        nomail.setAttribute("style","")
    }
}

filter_button.addEventListener('click', () => {
    if (filter_options.classList.contains("enabled")) {
        filter_options.classList.remove("enabled")
        filter_button.classList.remove("enabled")
    } else {
        filter_options.classList.add("enabled")
        filter_button.classList.add("enabled")
    }
})

document.addEventListener('click', function(event) {
    if (!filter_options.contains(event.target) && !filter_button.contains(event.target)){
        filter_options.classList.remove("enabled")
        filter_button.classList.remove("enabled")
    }
  });

filter_options_all.forEach((button) => {
    button.addEventListener('click', () => {
        const Check = button.querySelector(".check_mark")
        const FilterName = button.dataset.filter
        if (Check) {
            if (Check.classList.contains("enabled")) {
                Check.classList.remove("enabled")
                using_filters = using_filters.filter(function(e) { return e !== FilterName})
            } else {
                Check.classList.add("enabled")
                using_filters.push(FilterName)
            }
            apply_filters()
        } else {
            filter_options_all.forEach((button) => {
                const Check = button.querySelector(".check_mark")
                const FilterName = button.dataset.filter
                if (Check) {
                    Check.classList.remove("enabled")
                    using_filters = using_filters.filter(function(e) { return e !== FilterName})
                    apply_filters()
                }
            })
        }
    });
})

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    if (theme == "light") {
        const Logo = document.querySelector("#Logo_Full")
        Logo.setAttribute("src","Media/Mail_Full_Light.png")

    }
}

function createElem(tag,parent,setClass){
    const element = document.createElement(tag)
    parent.appendChild(element)
    if (setClass) {
        addClass(element,setClass)
    }
    return element
}

const backButton = document.querySelector("#corner-content_2")
backButton.addEventListener("click",() => {
    renderFolder(last_folder,true)
})

function setBackButtonEnabled(value){
    const logo = document.querySelector("#corner-content_1")
    const button = document.querySelector("#corner-content_2")
    const list = document.querySelector("#list")
    const viewer = document.querySelector("#viewer")
    if (value){
        button.classList.remove("disabled")
        logo.classList.add("disabled")
        list.setAttribute("style","display: none")
        viewer.setAttribute("style","display: block")
        filters.setAttribute("style","display: none;")

    } else {
        button.classList.add("disabled")
        logo.classList.remove("disabled")
        list.setAttribute("style","display: block")
        viewer.setAttribute("style","display: none")
        filters.setAttribute("style","")
    }
}

function renderListItem(data){
    // Default stuff
    var base = createElem("div",list)
    if (data.read == false) {
        addClass(base,"unread")
    }
    var dot = createElem("div",base,"unread-dot")
    // Checkbox and avatar
    var person = data.author
    var avatar = createElem("img",base,"avatar")
    if (person.avatar){
        avatar.setAttribute("src",person.avatar)
    } else {
        avatar.setAttribute("src","media/user.png")
    }
    var checkbox = createElem("div",base,"checkbox")
    var checkbox_image = createElem("img",checkbox)
    checkbox_image.setAttribute("src","media/Check_mark.png")
    // Main content
    var main = createElem("div",base,"main-part")
    var section = createElem("div",main,"name-and-special")
    var name = createElem("h3",section)
    name.innerHTML = person.name+" "+person.surname
    var special = createElem("div",section,"special")
    var bookmark = createElem("img",special,"bookmark_icon")
    bookmark.setAttribute("src","media/Bookmark.png")
    if (data.bookmark == true) {
        addClass(bookmark,"enabled")
    } else {
        bookmark.setAttribute("src","media/Bookmark_Empty.png")
    }
    var important = createElem("img",special,"important_icon")
    important.setAttribute("src","media/Important.png")
    if (data.important == true) {
        addClass(important,"enabled")
    }
    var contents = createElem("div",main,"compressed-contents")
    var title = createElem("h3",contents,"listed-title")
    title.innerHTML = data.title
    var content = createElem("h3",contents,"listed-content")
    content.innerHTML = data.text
    // Categories
    var categories = createElem("div",base,"categories")
    if (data.doc) {
        var Icon = createElem("img",categories,"doc")
        Icon.setAttribute("src","media/Attachment.png")
        Icon.setAttribute("class","attachment")
    }
    if (data.flag) {
        var Icon = createElem("img",categories)
        if (data.flag == "Регистрации") {
            Icon.setAttribute("src","media/Cat_Registration.png")
        }
        if (data.flag == "Штрафы и налоги") {
            Icon.setAttribute("src","media/Cat_Pay.png")
        }
        if (data.flag == "Заказы") {
            Icon.setAttribute("src","media/Cat_Orders.png")
        }
        if (data.flag == "Финансы") {
            Icon.setAttribute("src","media/Cat_Finance.png")
        }
        if (data.flag == "Путешествия") {
            Icon.setAttribute("src","media/Cat_Travel.png")
        }
        if (data.flag == "Билеты") {
            Icon.setAttribute("src","media/Cat_Tickets.png")
        }
    }
    // Date
    var date = createElem("h4",base,"listed-date")
    date.innerHTML = getDisplayDate(data.date).replace("/^0+/", '');
    main.addEventListener("click", () => renderEmail(data.date))
}

function getDisplayDate(Value) {
    var today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)
    compDate = new Date(Value) // month - 1 because January == 0
    diff = today.getTime() - compDate.getTime() // get the difference between today(at 00:00:00) and the date
    if (compDate.getTime() == today.getTime()) {
        return "Сегодня, в " + compDate.getHours() + ":" + compDate.getMinutes();
    } else if (diff <= (24 * 60 * 60 *1000)) {
        return "Вчера, в " + compDate.getHours() + ":" + compDate.getMinutes();
    } else { 
        var formated = compDate.toDateString().split(" ")
        var Weekday = formated[0]
        var Month = formated[1]
        var Day = formated[2]
        var Year = formated[3]
        var Extra = ""
        var Now = new Date().getFullYear
        if (Now !== Year) {
            Extra = ", " + Year
        }
        var String = Day+" "+Month+Extra
        String = String.replace("Jan","января").replace("Feb","Февраля").replace("Mar","Марта").replace("Apr","Апреля").replace("May","Мая").replace("Jun","Июня").replace("Jul","Июля").replace("Aug","Августа").replace("Sep","Сентября").replace("Oct","Октября").replace("Nov","Ноября").replace("Dec","Декабря")
        return String // or format it what ever way you want
    }
}

function renderEmail(email_date){
    const Inner = viewer.innerHTML
    viewer.innerHTML = ""
    setBackButtonEnabled(true)
    viewer.classList.add("shimmer")
    let api_request = http.open("GET","/api/get_email_by_date/"+email_date)
    http.send()
    http.onreadystatechange=function(){
        if (this.readyState==4 && this.status==200){
            viewer.innerHTML = Inner
            const response = JSON.parse(http.response)[0]
            const title = document.querySelector(".title")
            const flag_text = document.querySelector(".flag")
            const flag_icon = document.querySelector(".flag_icon")
            const dot = document.querySelector(".dot")
            const avatar = document.querySelector(".extra > .avatar")
            const name = document.querySelector(".name")
            const date = document.querySelector(".date")
            const recipients = document.querySelector(".recipients")
            const media = document.querySelector(".media")
            const download = document.querySelector(".download")
            const content = document.querySelector(".content")
            const flaged = document.querySelector(".flaged_viewer")
            const important = document.querySelector(".important_viewer")
            title.innerHTML = response.title
            if (response.author.avatar){
                avatar.setAttribute("src",response.author.avatar)
            } else {
                avatar.setAttribute("src","media/user.png")
            }
            avatar.setAttribute("style","")
            if (response.bookmark == true) {
                flaged.setAttribute("style", "")
            } else {
                flaged.setAttribute("style", "display: none;")
            }
            if (response.important == true) {
                important.setAttribute("style", "")
            } else {
                important.setAttribute("style", "display: none;")
            }
            name.innerHTML = response.author.name+" "+response.author.surname
            date.innerHTML = getDisplayDate(response.date)
            var recipientsList = []
            response.to.forEach((person) => {
                recipientsList.push(person.name+" "+person.surname)
            })
            if (response.to.length > 4) {
                recipients.innerHTML = response.to.length + " получателей: " + recipientsList.join(", ")
            } else if (response.to.length > 1) {
                recipients.innerHTML = response.to.length + " получателя: " + recipientsList.join(", ")
            } else {
                recipients.innerHTML = "Получатель: "+recipientsList.join("")
            }
            media.innerHTML = ""
            if (response.doc){
                var image = response.doc.img
                if (image){
                    var files_prefix = "1 файл"
                    if (typeof(image) == "string") {
                        const imageElement = createElem("img",media)
                        imageElement.setAttribute("src",image)
                    } else {
                        if (image.length > 4) {
                            files_prefix = image.length+" файлов"
                        } else {
                            files_prefix = image.length+" файла"
                        }
                        image.forEach((img_data) => {
                            const imageElement = createElem("img",media)
                            imageElement.setAttribute("src",img_data)
                        })
                    }
                    download.innerHTML = files_prefix+"<a href='"+image+"'"+" download='file.png'"+">Скачать все файлы</a>"
                }
            } else {
                download.innerHTML = ""
            }
            content.innerHTML = response.text
            if (response.read) {
                dot.setAttribute("style","opacity: 0")
            } else {
                dot.setAttribute("style","opacity: 1")
            }
            if (response.flag == "Регистрации") {
                flag_icon.setAttribute("src","media/Cat_Registration.png")
            }
            if (response.flag == "Штрафы и налоги") {
                flag_icon.setAttribute("src","media/Cat_Pay.png")
            }
            if (response.flag == "Заказы") {
                flag_icon.setAttribute("src","media/Cat_Orders.png")
            }
            if (response.flag == "Финансы") {
                flag_icon.setAttribute("src","media/Cat_Finance.png")
            }
            if (response.flag == "Путешествия") {
                flag_icon.setAttribute("src","media/Cat_Travel.png")
            }
            if (response.flag == "Билеты") {
                flag_icon.setAttribute("src","media/Cat_Tickets.png")
            }
            if (response.flag) {
                flag_text.innerHTML = response.flag
            } else {
                flag_text.innerHTML = ""
                flag_icon.setAttribute("src","")
            }
            viewer.classList.remove("shimmer")
        }
    }
}

var RequestsMade = []

function renderFolder (folder_name, first_scroll){
    if (first_scroll == true) {
        ItemsRendered = 0
        setBackButtonEnabled(false)
        last_folder = folder_name
        RequestsMade = []
        list.innerHTML = ""
    }
    let api_request = "/api/get_folder_emails/"+folder_name+"/"+Step+"/"+ItemsRendered
    let request = http.open("GET",api_request)
    RequestsMade[api_request] = true
    http.send()
    http.onreadystatechange=function(){
        if (this.readyState==4 && this.status==200){
            const response = JSON.parse(http.response)
            if (response.length < Step) {
                console.log("Out of mail!")
                window.removeEventListener("scroll", handleInfiniteScroll);
            }
            ItemsRendered += response.length
            response.forEach(element => renderListItem(element))
            apply_filters()
            setupCheckboxes()
        }
    }
}

const handleInfiniteScroll = () => {
    const endOfPage = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 120)
    if (endOfPage) {
        const api_request = "/api/get_folder_emails/"+last_folder+"/"+Step+"/"+ItemsRendered
        if (RequestsMade[api_request]) {return} else {
            renderFolder(last_folder)
        }
    }
}

function setupCheckboxes(){
    const checkboxes = document.querySelectorAll(".checkbox")
    checkboxes.forEach((element) => {
        element.addEventListener("click",() => {
            if (element.parentElement.classList.contains("checked")){
                element.parentElement.classList.remove("checked");
            } else {
                element.parentElement.classList.add("checked");
            }
        })
    })
}

sidebar_buttons.forEach((button) => {
    button.addEventListener('click', () => {
        renderFolder(rusToLat(button.getAttribute("folder")),true)
        window.addEventListener("scroll", handleInfiniteScroll);
        sidebar_buttons.forEach((loop_button) => {
            if (button === loop_button) {
                loop_button.setAttribute("class","selected")
            } else if (button.className !== "white-button") {
                loop_button.setAttribute("class","")
            }
        });
    });
});


renderFolder("Vhodyashchie")