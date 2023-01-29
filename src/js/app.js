const main = document.querySelector("main")
const pageTitle = document.querySelector("title")
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
const settings_button = document.querySelector("#settings_button")
const close_settings_button = document.querySelector("#close-settings")
const settings = document.querySelector("#settings")
const sidebar_buttons = document.querySelectorAll("#folders > button")
const settings_option_buttons = document.querySelectorAll("#settings .options > button")
const settings_content = document.querySelector("#settings .content")
const theme_buttons = document.querySelectorAll(".themes > div")
const language_labels = document.querySelectorAll(".languages > p")
const more_mail_btn = document.querySelector(".more-mail")
const all = document.querySelectorAll("*")

var lang_current = null
var last_folder = null
var ItemsRendered = 0
const Step = 15
var using_filters = []

function addClass(element,setClass){
    element.classList.add(setClass)
}

function setCookie(name, value, exdays) {
    var d, expires;
    exdays = exdays || 1;
    d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + "; " + expires;
}

function getCookie(name) {
    var cookie, c;
    cookies = document.cookie.split('; ');
    for (var i=0; i < cookies.length; i++) {
        c = cookies[i].split('=');
        if (c[0] == name) {
            return c[1];
        }
    }
    return "";
}

function setTitle(title) {
    pageTitle.innerHTML = title
}

function brightnessByColor(color) {
    var color = "" + color, isHEX = color.indexOf("#") == 0, isRGB = color.indexOf("rgb") == 0;
    if (isHEX) {
      var m = color.substr(1).match(color.length == 7 ? /(\S{2})/g : /(\S{1})/g);
      if (m) var r = parseInt(m[0], 16), g = parseInt(m[1], 16), b = parseInt(m[2], 16);
    }
    if (isRGB) {
      var m = color.match(/(\d+){3}/g);
      if (m) var r = m[0], g = m[1], b = m[2];
    }
    if (typeof r != "undefined") return ((r*299)+(g*587)+(b*114))/1000;
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

function apply_filters(animate) {
    const email_list = document.querySelectorAll("#list > div")
    const indicators = filter_button.querySelectorAll(".indicator")
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
        email_element.classList.add("hidden")
        if (hide !== true) {
            ShownCounter += 1
        }
        if (animate) {
            setTimeout(() => {
                if (hide == true) {
                    email_element.classList.add("hidden")
                } else {
                    email_element.classList.remove("hidden")
                }
            }, 10);
        } else {
            if (hide == true) {
                email_element.classList.add("hidden")
                email_element.classList.remove("checked")
            } else {
                email_element.classList.remove("hidden")
            }
        }
    })
    indicators.forEach((indicator) => {
        if (using_filters.find((e) => e == indicator.dataset.filter)) {
            indicator.classList.remove("hidden")
        } else {
            indicator.classList.add("hidden")
        }
    })
    if (ShownCounter > 0) {
        nomail.classList.add("hidden")
        //more_mail_btn.classList.remove("hidden")
    } else {
        nomail.classList.remove("hidden")
        more_mail_btn.classList.add("hidden")
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
    if (!settings.contains(event.target)&& !settings_button.contains(event.target)){
        settings.classList.remove("enabled")
        main.classList.remove("minimized")
    }
});

filter_options_all.forEach((button) => {
    button.addEventListener('click', () => {
        if (filter_button.classList.contains("enabled") == false) { return }
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
    const Logo = document.querySelector("#Logo_Full")
    const button = document.querySelector(".themes [theme='"+theme+"']")
    const root = document.querySelector(':root');
    var IsCustom = false
    if (theme !== "dark" && theme !== "light") {
        IsCustom = true
    }
    if (theme.substring(0,1) == "#") {
        const brightness = brightnessByColor(theme)
        root.style.setProperty('--background-content', theme);
        if (brightness > 150) {
            theme = "light"
        }
    }
    main.classList.add("image")
    switch (theme){
        case "geometry": {root.style.setProperty('--background-content', "url(../media/themes/Geometry.png)"); theme="light";};
        break;
        case "hills": {root.style.setProperty('--background-content', "url(../media/themes/Hills.png)"); theme="dark";};
        break;
        case "mountains": {root.style.setProperty('--background-content', "url(../media/themes/Mountains.png)"); theme="dark";};
        break;
        case "roses": {root.style.setProperty('--background-content', "url(../media/themes/Roses.png)"); theme="dark";};
        break;
        case "starwars": {root.style.setProperty('--background-content', "url(../media/themes/StarWars.png)"); theme="dark";};
        break;
        case "warface": {root.style.setProperty('--background-content', "url(../media/themes/Warface.png)"); theme="dark";};
        break;
        default: main.classList.remove("image");
    }
    if (button) {
        if (button.classList.contains("selected")) { return }
        theme_buttons.forEach((loop_button) => {
            if (button === loop_button) {
                loop_button.classList.add("selected")
            } else {
                loop_button.classList.remove("selected")
            }   
        });
    }
    document.documentElement.setAttribute('data-custom-theme', IsCustom)
    localStorage.setItem('custom-theme', IsCustom)
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    if (IsCustom == false) {
        root.style.setProperty('--background-content', null)
    }
    if (theme == "light") {
        Logo.setAttribute("src","Media/Mail_Full_Light.png")
    } else {
        Logo.setAttribute("src","Media/Mail_Full.png")
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
    main.addEventListener("click", () => renderEmail(data.date,data.folder))
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
        if (lang_current == "ru") {
            return "Сегодня, в " + compDate.getHours() + ":" + compDate.getMinutes();
        } else {
            return "Today, at " + compDate.getHours() + ":" + compDate.getMinutes();
        }
    } else if (diff <= (24 * 60 * 60 *1000)) {
        if (lang_current == "ru") {
            return "Вчера, в " + compDate.getHours() + ":" + compDate.getMinutes();
        } else {
            return "Yesterdat, at " + compDate.getHours() + ":" + compDate.getMinutes();
        }
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
        if (lang_current == "ru") {
            String = String.replace("Jan","января").replace("Feb","Февраля").replace("Mar","Марта").replace("Apr","Апреля").replace("May","Мая").replace("Jun","Июня").replace("Jul","Июля").replace("Aug","Августа").replace("Sep","Сентября").replace("Oct","Октября").replace("Nov","Ноября").replace("Dec","Декабря")
        }
        return String // or format it what ever way you want
    }
}

function renderEmail(email_date,email_folder){
    const Inner = viewer.innerHTML
    viewer.innerHTML = ""
    setBackButtonEnabled(true)
    viewer.classList.add("shimmer")
    let api_request = http.open("GET","/api/get_email_by_date/"+email_date+"/"+rusToLat(email_folder))
    http.send()
    http.onreadystatechange=function(){
        if (this.readyState==4 && this.status==200){
            viewer.innerHTML = Inner
            if (lang_current == "ru") {
                setTitle("Почта Mail.ru")
            } else {
                setTitle("Mail.ru")
            }
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
            let recipient_text = "получателей"
            if (lang_current !== "ru") {
                recipient_text = "recipients"
            }
            if (response.to.length > 4) {
                recipients.innerHTML = response.to.length + " "+recipient_text+": " + recipientsList.join(", ")
            } else if (response.to.length > 1) {
                recipient_text = "получателей"
                if (lang_current !== "ru") {
                    recipient_text = "recipients"
                }
                recipients.innerHTML = response.to.length + " "+recipient_text+": " + recipientsList.join(", ")
            } else {
                recipient_text = "получателей"
                if (lang_current !== "ru") {
                    recipient_text = "Recipient"
                }
                recipients.innerHTML = recipient_text+": "+recipientsList.join("")
            }
            media.innerHTML = ""
            if (response.doc){
                var image = response.doc.img
                if (image){
                    var files_prefix = "1 файл"
                    if (lang_current !== "ru") {
                        files_prefix = "1 file"
                    }
                    if (typeof(image) == "string") {
                        const downloadContainer = createElem("div",media)
                        downloadContainer.setAttribute("class","container")
                        const imageElement = createElem("img",downloadContainer)
                        imageElement.setAttribute("src",image)
                        imageElement.setAttribute("class","attachment")
                        const downloadOverlay = createElem("a",downloadContainer)
                        downloadOverlay.setAttribute("class","overlay")
                        downloadOverlay.setAttribute("href",image)
                        downloadOverlay.setAttribute("download","file.png")
                        const downloadIcon = createElem("img",downloadOverlay)
                        downloadIcon.setAttribute("src","media/Download_Icon.png")
                        const overlayGradient = createElem("img",downloadOverlay)
                        overlayGradient.setAttribute("src","media/LightOverlay.png")
                        overlayGradient.setAttribute("class","gradient")
                        const downloadText = createElem("p",downloadOverlay)
                        downloadText.innerHTML = "Скачать"
                        if (lang_current !== "ru") {
                            downloadText.innerHTML = "Download"
                        }
                    } else {
                        if (image.length > 4) {
                            files_prefix = image.length+" файлов"
                            if (lang_current !== "ru") {
                                files_prefix = image.length+" files"
                            }
                        } else {
                            files_prefix = image.length+" файла"
                            if (lang_current !== "ru") {
                                files_prefix = image.length+" files"
                            }
                        }
                        image.forEach((img_data) => {
                            const downloadContainer = createElem("div",media)
                            downloadContainer.setAttribute("class","container")
                            const imageElement = createElem("img",downloadContainer)
                            imageElement.setAttribute("src",img_data)
                            imageElement.setAttribute("class","attachment")
                            const downloadOverlay = createElem("a",downloadContainer)
                            downloadOverlay.setAttribute("class","overlay")
                            downloadOverlay.setAttribute("href",img_data)
                            downloadOverlay.setAttribute("download","image.png")
                            const downloadIcon = createElem("img",downloadOverlay)
                            downloadIcon.setAttribute("src","media/Download_Icon.png")
                            const overlayGradient = createElem("img",downloadOverlay)
                            overlayGradient.setAttribute("src","media/LightOverlay.png")
                            overlayGradient.setAttribute("class","gradient")
                            const downloadText = createElem("p",downloadOverlay)
                            downloadText.innerHTML = "Скачать"
                            if (lang_current !== "ru") {
                                downloadText.innerHTML = "Download"
                            }
                        })
                    }
                    download.innerHTML = files_prefix+"<a href='"+image+"'"+" download='файл.png'"+">Скачать все файлы</a>"
                    if (lang_current !== "ru") {
                        download.innerHTML = files_prefix+"<a href='"+image+"'"+" download='file.png'"+">Download all files</a>"
                    }
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
                flag_text.innerHTML = "Accounts"
                flag_icon.setAttribute("src","media/Cat_Registration.png")
            }
            if (response.flag == "Штрафы и налоги") {
                flag_text.innerHTML = "Fines and taxes"
                flag_icon.setAttribute("src","media/Cat_Pay.png")
            }
            if (response.flag == "Заказы") {
                flag_text.innerHTML = "Orders"
                flag_icon.setAttribute("src","media/Cat_Orders.png")
            }
            if (response.flag == "Финансы") {
                flag_text.innerHTML = "Finance"
                flag_icon.setAttribute("src","media/Cat_Finance.png")
            }
            if (response.flag == "Путешествия") {
                flag_text.innerHTML = "Travel"
                flag_icon.setAttribute("src","media/Cat_Travel.png")
            }
            if (response.flag == "Билеты") {
                flag_text.innerHTML = "Tickets"
                flag_icon.setAttribute("src","media/Cat_Tickets.png")
            }
            if (response.flag && lang_current == "ru") {
                flag_text.innerHTML = response.flag
            } else if (response.flag == null) {
                flag_text.innerHTML = ""
                flag_icon.setAttribute("src","")
            }
            viewer.classList.remove("shimmer")
        }
    }
}

var LastRequestTick = 0

function renderFolder (folder_name, first_scroll){
    if (first_scroll == true) {
        ItemsRendered = 0
        setBackButtonEnabled(false)
        last_folder = folder_name
        LastRequestTick = 0
        list.innerHTML = ""
    } else {
        more_mail_btn.disabled = true
        setTimeout(() => { more_mail_btn.disabled = false }, 800);
    }
    let api_request = "/api/get_folder_emails/"+folder_name+"/"+Step+"/"+ItemsRendered
    let request = http.open("GET",api_request)
    http.send()
    http.onreadystatechange=function(){
        if (this.readyState==4 && this.status==200){
            const response = JSON.parse(http.response)
            ItemsRendered += response.length
            response.forEach(element => renderListItem(element))
            apply_filters(first_scroll)
            if (response.length < Step) {
                window.removeEventListener("scroll", handleInfiniteScroll);
                //more_mail_btn.classList.add("hidden")
            }
            setupCheckboxes()
        }
    }
}

function setSettingsOption(option) {
    const selected = settings_content.querySelector("."+option)
    if (option == "theme") {
        settings.style.setProperty("height","75%")
    } else {
        settings.style.setProperty("height","45%")
    }
    settings.querySelectorAll("div").forEach((loop_section) => {
        if (selected === loop_section) {
            loop_section.classList.add("selected")
        } else {
            loop_section.classList.remove("selected")
        }
    });
}

var setupLanguages = false

var translations = {
    en: {
        options: '<img src="media/Settings.png">Options',
        unread: '<img class="check_mark" src="media/Check_mark.png"><img style="width: 0.45em;" src="media/Blue_Circle.png">Unread',
        flaged: '<img class="check_mark" src="media/Check_mark.png"><img style="width: 0.75em;" src="media/Bookmark.png">Flagged',
        has_attachment: '<img class="check_mark" src="media/Check_mark.png"><img src="media/Attachment.png">With attachments',
        compose: '<img src="media/Icon_0.png">Write a letter',
        inbox: '<img src="media/Icon_1.png">Inbox',
        important: '<img src="media/Icon_2.png">Important',
        sent: '<img src="media/Icon_3.png">Sent',
        draft: '<img src="media/Icon_4.png">Drafts',
        archive: '<img src="media/Icon_5.png">Archive',
        spam: '<img src="media/Icon_6.png">Spam',
        trash: '<img src="media/Icon_7.png">Trash',
        new_folder: '<img src="media/Plus.png">New folder',
    },
}

function setupLanguageInfo(){
    if (setupLanguages) { return }
    setupLanguages = true
    translations["ru"] = {}
    all.forEach(element => {
        const TID = element.getAttribute("tid")
        if (TID !== null) {
            if (TID.startsWith("_")){
                translations["en"][TID] = TID.substring(1)
            }
            translations["ru"][TID] = element.innerHTML
        }
    });
}

function setLanguage(language) {
    if (lang_current == language) { return }
    const lang_button = settings.querySelector("#lang_button")
    var text = "Язык: Русский"
    if (language == "en") {
        text = "Language: English"
    }
    lang_button.innerHTML = text+'<img src="media/flag_'+language+'.png">'
    language_labels.forEach((loop_label) => {
        if (loop_label.getAttribute("language") == language) {
            loop_label.classList.add("selected")
        } else {
            loop_label.classList.remove("selected")
        }   
    });
    lang_current = language
    setupLanguageInfo()
    const html = document.querySelector("html")
    // Setup done
    html.setAttribute("lang",language)
    const translationObject = translations[language]
    all.forEach(element => {
        const TID = element.getAttribute("tid")
        if (TID !== null) {
            element.innerHTML = translationObject[TID]
        }
    });
}

const handleInfiniteScroll = (nocheck) => {
    if (nocheck == true) {
        LastRequestTick = new Date().getTime()
        const api_request = "/api/get_folder_emails/"+last_folder+"/"+Step+"/"+ItemsRendered
        renderFolder(last_folder)
        return
    }
    const endOfPage = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)
    if (endOfPage) {
        const tick = new Date().getTime()
        if (tick - LastRequestTick > 1000) {
            LastRequestTick = new Date().getTime()
            const api_request = "/api/get_folder_emails/"+last_folder+"/"+Step+"/"+ItemsRendered
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
    if (button.classList.contains("new-folder") == false) {
        button.addEventListener('click', () => {
            if (button.classList.contains("selected")) { return }
            if (lang_current == "ru") {
                setTitle(button.getAttribute("folder") + " - Почта Mail.ru")
            } else {
                const folderInRus = button.getAttribute("folder")
                var tranlated = ""
                if (folderInRus == "Входящие") {
                    tranlated = "Inbox"
                } else if (folderInRus == "Важное") {
                    tranlated = "Important"
                } else if (folderInRus == "Отправленные") {
                    tranlated = "Sent"
                } else if (folderInRus == "Черновики") {
                    tranlated = "Drafts"
                } else if (folderInRus == "Архив") {
                    tranlated = "Archive"
                } else if (folderInRus == "Спам") {
                    tranlated = "Spam"
                } else if (folderInRus == "Корзина") {
                    tranlated = "Trash"
                }
                setTitle(tranlated + " - Mail.ru")
            }
            renderFolder(rusToLat(button.getAttribute("folder")),true)
            window.addEventListener("scroll", handleInfiniteScroll);
            sidebar_buttons.forEach((loop_button) => {
                if (button === loop_button) {
                    loop_button.classList.add("selected")
                } else if (button.className !== "white-button") {
                    loop_button.classList.remove("selected")
                }
            });
        });
    }
});

//more_mail_btn.addEventListener("click", () => { handleInfiniteScroll(true) });

settings_button.addEventListener("click", () => {
    if (settings.classList.contains("enabled")) {
        settings.classList.remove("enabled")
        main.classList.remove("minimized")
    } else {
        settings.classList.add("enabled")
        main.classList.add("minimized")
    }
})

close_settings_button.addEventListener("click", () => {
    if (settings.classList.contains("enabled")) {
        settings.classList.remove("enabled")
        main.classList.remove("minimized")
    }
})

settings_option_buttons.forEach((button) => {
    button.addEventListener('click', () => {
        if (button.classList.contains("selected")) { return }
        setSettingsOption(button.getAttribute("option"))
        settings_option_buttons.forEach((loop_button) => {
            if (button === loop_button) {
                loop_button.classList.add("selected")
            } else {
                loop_button.classList.remove("selected")
            }   
        });
    });
});

theme_buttons.forEach((button) => {
    button.addEventListener('click', () => {
        if (button.classList.contains("selected")) { return }
        let theme = button.getAttribute("theme")
        if (theme == null) {
            if (button.classList.contains("color-theme")) {
                theme = button.getAttribute("color")
            }
        }
        setCookie("theme",theme,2)
        setTheme(theme)
        theme_buttons.forEach((loop_button) => {
            if (button === loop_button) {
                loop_button.classList.add("selected")
            } else {
                loop_button.classList.remove("selected")
            }   
        });
    });
});

language_labels.forEach((label) => {
    const button = label.querySelector(".check")
    button.addEventListener('click', () => {
        if (label.classList.contains("selected")) { return }
        let language = label.getAttribute("language")
        setCookie("language",language,2)
        setLanguage(language)
        language_labels.forEach((loop_label) => {
            if (label === loop_label) {
                loop_label.classList.add("selected")
            } else {
                loop_label.classList.remove("selected")
            }   
        });
    });
});

document.addEventListener("DOMContentLoaded",() => {
    const last_used_theme = getCookie("theme")
    const last_used_lang = getCookie("language")
    if (last_used_theme) {
        setTheme(last_used_theme)
    } else {
        setTheme("dark")
    }
    if (last_used_lang) {
        setLanguage(last_used_lang)
    } else {
        setLanguage("ru")
    }
    renderFolder("Vhodyashchie")
})