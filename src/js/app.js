const main = document.querySelector("main")
const pageTitle = document.querySelector("title")
const sidebar = document.getElementById("sidebar")
const primary = document.querySelector(".primary")
const list = document.getElementById("list")
const viewer = document.getElementById("viewer")
const http = new XMLHttpRequest()
const nomail = document.querySelector(".no-mail")
const compose = document.querySelector(".compose")
const compose_button = document.querySelector(".white-button")
const filters = document.querySelector(".filters")
const filter_options = document.querySelector(".filter-options")
const filter_button = document.querySelector(".filter-button")
const filter_options_all = document.querySelectorAll(".filter-options > h3")
const settings_button = document.getElementById("settings_button")
const close_settings_button = document.getElementById("close-settings")
const settings = document.getElementById("settings")
const sidebar_buttons = document.querySelectorAll("#folders > button")
const settings_option_buttons = document.querySelectorAll("#settings .options > button")
const settings_content = document.querySelector("#settings .content")
const theme_buttons = document.querySelectorAll(".themes > div")
const language_labels = document.querySelectorAll(".languages > p")
const upload_element = document.getElementById("uploadElement")
const upload_button = document.getElementById("uploadButton")
const upload_file_preview = document.getElementById("file-preview")
const textarea = document.getElementById("textarea")
const input_preview = document.getElementById("input_preview")
const compose_buttons = document.querySelectorAll("#composition-buttons > button")
const all = document.querySelectorAll("*")

var last_exception_tick = 0
var lang_current = null
var last_folder = null
var ItemsRendered = 0
const Step = 15
var using_filters = []

function markdown(src) {

    var rx_lt = /</g;
    var rx_gt = />/g;
    var rx_space = /\t|\r|\uf8ff/g;
    var rx_escape = /\\([\\\|`*_{}\[\]()#+\-~])/g;
    var rx_hr = /^([*\-=_] *){3,}$/gm;
    var rx_blockquote = /\n *&gt; *([^]*?)(?=(\n|$){2})/g;
    var rx_list = /\n( *)(?:[*\-+]|((\d+)|([a-z])|[A-Z])[.)]) +([^]*?)(?=(\n|$){2})/g;
    var rx_listjoin = /<\/(ol|ul)>\n\n<\1>/g;
    var rx_highlight = /(^|[^A-Za-z\d\\])(([*_])|(~)|(\^)|(--)|(\+\+)|`)(\2?)([^<]*?)\2\8(?!\2)(?=\W|_|$)/g;
    var rx_code = /\n((```|~~~).*\n?([^]*?)\n?\2|((    .*?\n)+))/g;
    var rx_link = /((!?)\[(.*?)\]\((.*?)( ".*")?\)|\\([\\`*_{}\[\]()#+\-.!~]))/g;
    var rx_table = /\n(( *\|.*?\| *\n)+)/g;
    var rx_thead = /^.*\n( *\|( *\:?-+\:?-+\:? *\|)* *\n|)/;
    var rx_row = /.*\n/g;
    var rx_cell = /\||(.*?[^\\])\|/g;
    var rx_heading = /(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g;
    var rx_para = /(?=^|>|\n)\s*\n+([^<]+?)\n+\s*(?=\n|<|$)/g;
    var rx_stash = /-\d+\uf8ff/g;

    function replace(rex, fn) {
        src = src.replace(rex, fn);
    }

    function element(tag, content) {
        return '<' + tag + '>' + content + '</' + tag + '>';
    }

    function blockquote(src) {
        return src.replace(rx_blockquote, function(all, content) {
            return element('blockquote', blockquote(highlight(content.replace(/^ *&gt; */gm, ''))));
        });
    }

    function list(src) {
        return src.replace(rx_list, function(all, ind, ol, num, low, content) {
            var entry = element('li', highlight(content.split(
                RegExp('\n ?' + ind + '(?:(?:\\d+|[a-zA-Z])[.)]|[*\\-+]) +', 'g')).map(list).join('</li><li>')));

            return '\n' + (ol
                ? '<ol start="' + (num
                    ? ol + '">'
                    : parseInt(ol,36) - 9 + '" style="list-style-type:' + (low ? 'low' : 'upp') + 'er-alpha">') + entry + '</ol>'
                : element('ul', entry));
        });
    }

    function highlight(src) {
        return src.replace(rx_highlight, function(all, _, p1, emp, sub, sup, small, big, p2, content) {
            return _ + element(
                  emp ? (p2 ? 'strong' : 'em')
                : sub ? (p2 ? 's' : 'sub')
                : sup ? 'sup'
                : small ? 'small'
                : big ? 'big'
                : 'code',
                highlight(content));
        });
    }

    function unesc(str) {
        return str.replace(rx_escape, '$1');
    }

    var stash = [];
    var si = 0;

    src = '\n' + src + '\n';

    replace(rx_lt, '&lt;');
    replace(rx_gt, '&gt;');
    replace(rx_space, '  ');

    // blockquote
    src = blockquote(src);

    // horizontal rule
    replace(rx_hr, '<hr/>');

    // list
    src = list(src);
    replace(rx_listjoin, '');

    // code
    replace(rx_code, function(all, p1, p2, p3, p4) {
        stash[--si] = element('pre', element('code', p3||p4.replace(/^    /gm, '')));
        return si + '\uf8ff';
    });

    // link or image
    replace(rx_link, function(all, p1, p2, p3, p4, p5, p6) {
        stash[--si] = p4
            ? p2
                ? '<img src="' + p4 + '" alt="' + p3 + '"/>'
                : '<a href="' + p4 + '">' + unesc(highlight(p3)) + '</a>'
            : p6;
        return si + '\uf8ff';
    });

    // table
    replace(rx_table, function(all, table) {
        var sep = table.match(rx_thead)[1];
        return '\n' + element('table',
            table.replace(rx_row, function(row, ri) {
                return row == sep ? '' : element('tr', row.replace(rx_cell, function(all, cell, ci) {
                    return ci ? element(sep && !ri ? 'th' : 'td', unesc(highlight(cell || ''))) : ''
                }))
            })
        )
    });

    // heading
    replace(rx_heading, function(all, _, p1, p2) { return _ + element('h' + p1.length, unesc(highlight(p2))) });

    // paragraph
    replace(rx_para, function(all, content) { return element('p', unesc(highlight(content))) });

    // stash
    replace(rx_stash, function(all) { return stash[parseInt(all)] });

    return src.trim();
};

function addClass(element,setClass){
    element.classList.add(setClass)
}

function tick() { return new Date().getTime() }

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

function latToRus(str) {
    const possibilities = ["Входящие","Важное","Отправленные","Черновики","Архив","Спам","Корзина"]
    for (let i = 0; i < possibilities.length; i++) {
        const value = possibilities[i]
        if (rusToLat(value) == str) { return value }
    }
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
        list.setAttribute("style",null)
    } else {
        nomail.classList.remove("hidden")
        list.setAttribute("style","none")
    }
    checkboxUpdate()
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
    if (tick() - last_exception_tick < 100) { return }
    if (!filter_options.contains(event.target) && !filter_button.contains(event.target)){
        filter_options.classList.remove("enabled")
        filter_button.classList.remove("enabled")
    }
    if (!settings.contains(event.target) && !settings_button.contains(event.target)){
        settings.classList.remove("enabled")
        main.classList.remove("minimized")
    }
    if (!compose.contains(event.target) && !compose_button.contains(event.target) && !upload_file_preview.contains(event.target)){
        compose.classList.add("hidden")
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

function checkboxUpdate() {
    const listed_mail = list.childNodes
    var last_value_selected = false
    var last_valid_value = null
    for (let i = 0; i < listed_mail.length; i++) {
        const value = listed_mail[i]
        if (value && value.classList !== undefined) {
            if (last_value_selected == true) {
                if (value.classList.contains("checked") == true) {
                    value.classList.add("top-connection")
                    if (last_valid_value) {last_valid_value.classList.add("bottom-connection")}
                } else {
                    value.classList.remove("top-connection")
                    if (last_valid_value) {last_valid_value.classList.remove("bottom-connection")}
                }
            } else {
                value.classList.remove("top-connection")
                if (last_valid_value) {last_valid_value.classList.remove("bottom-connection")}
            }
            if (value.classList.contains("hidden") == false) {last_valid_value = value}
            if (value.classList.contains("hidden") == false) {last_value_selected = value.classList.contains("checked")}
        }
    }
}

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
        case "geometry": {root.style.setProperty('--background-content', "url(../media/themes/Geometry.webp)"); theme="light";};
        break;
        case "hills": {root.style.setProperty('--background-content', "url(../media/themes/Hills.webp)"); theme="dark";};
        break;
        case "mountains": {root.style.setProperty('--background-content', "url(../media/themes/Mountains.webp)"); theme="dark";};
        break;
        case "roses": {root.style.setProperty('--background-content', "url(../media/themes/Roses.webp)"); theme="dark";};
        break;
        case "starwars": {root.style.setProperty('--background-content', "url(../media/themes/StarWars.webp)"); theme="dark";};
        break;
        case "warface": {root.style.setProperty('--background-content', "url(../media/themes/Warface.webp)"); theme="dark";};
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
        list.setAttribute("style",null)
        viewer.setAttribute("style","display: none")
        filters.setAttribute("style","")
    }
}

function renderListItem(data){
    var base = createElem("div",list)
    if (data.read == false) {
        addClass(base,"unread")
    }
    var dot = createElem("div",base,"unread-dot")
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
    compDate = new Date(Value)
    diff = today.getTime() - compDate.getTime()
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
        return String
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
            const title = document.querySelector("title")
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
    if (first_scroll !== false) {
        first_scroll = true
        ItemsRendered = 0
        setBackButtonEnabled(false)
        last_folder = folder_name
        LastRequestTick = 0
        list.innerHTML = ""
    } else {
        if (list.getAttribute("style") == "display: none") { return }
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
            }
            if (first_scroll == true) { setupCheckboxes() }
            const folderInRus = latToRus(folder_name)
            if (lang_current == "ru") {
                setTitle(folderInRus + " - Почта Mail.ru")
            } else {
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
        renderFolder(last_folder,false)
        return
    }
    const endOfPage = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)
    if (endOfPage) {
        const tick = new Date().getTime()
        if (tick - LastRequestTick > 1000) {
            LastRequestTick = new Date().getTime()
            const api_request = "/api/get_folder_emails/"+last_folder+"/"+Step+"/"+ItemsRendered
            renderFolder(last_folder,false)
        }
    }
}

function setupCheckboxes(){
    const checkboxes = document.querySelectorAll(".checkbox")
    checkboxes.forEach((element) => {
        element.addEventListener("click",() => {
            console.log("Click")
            if (element.parentElement.classList.contains("checked") == true){
                console.log("Removing")
                element.parentElement.classList.remove("checked","top-connection","bottom-conection");
            } else {
                console.log("Adding")
                element.parentElement.classList.add("checked");
            }
            checkboxUpdate()
        })
    })
}

sidebar_buttons.forEach((button) => {
    if (button.classList.contains("new-folder") == false) {
        button.addEventListener('click', () => {
            if (button.classList.contains("selected")) { return }
            renderFolder(rusToLat(button.getAttribute("folder")))
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

compose_button.addEventListener("click", () => {
    if (compose.classList.contains("hidden")) {
        compose.classList.remove("hidden")
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

function formatSizeUnits(bytes){
    if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " GB"; }
    else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + " MB"; }
    else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + " KB"; }
    else if (bytes > 1) { bytes = bytes + " bytes"; }
    else if (bytes == 1) { bytes = bytes + " byte"; }
    else { bytes = "0 bytes"; }
    return bytes;
}

function createFilePreview(imgSource,sizeInBytes,extention) {
    const valid_file_extentions = [
        "css",
        "doc",
        "docx",
        "html",
        "js",
        "mp3",
        "pdf",
        "svg",
        "txt",
        "zip",
        "mp4"
    ]
    const img_file_extentions = [
        "png",
        "jpeg",
        "gif",
        "jpg",
        "webm"
    ]
    const preview_root = createElem("div",upload_file_preview)
    if (valid_file_extentions.includes(extention)) {
        preview_root.style = "background-image: url(media/file_extentions/"+extention+".png)"
    } else if (img_file_extentions.includes(extention)) {
        preview_root.style = "background-image: url("+imgSource+")"
    } else {
        preview_root.style = "background-image: url(media/file_extentions/unknown.png)"
    }
    const darken_element = createElem("div",preview_root)
    const size_text = createElem("p",darken_element)
    size_text.innerHTML = sizeInBytes
    const close_button = createElem("button",preview_root,"close-button")
    close_button.innerHTML = "&#10006;"
    close_button.addEventListener("click", () => {
        preview_root.remove()
        last_exception_tick = tick()
        compose.classList.remove("hidden")
    })
}

function handleFiles() {
    const fileList = this.files;
    for (let i = 0; i < fileList.length; i++) {
        const element = fileList[i]
        const source = URL.createObjectURL(element);
        const fileName = element.name
        const extention = fileName.split('.').pop()
        createFilePreview(source,formatSizeUnits(element.size),extention)
    }
}

function updateOutputPreview() {
    const output = markdown(textarea.value)
    input_preview.innerHTML = output
}

function setupTutorial() {
    if (lang_current == "ru") {
        textarea.value = ""
    } else {
        textarea.value = ""
    }
    updateOutputPreview()
}

textarea.addEventListener("input",updateOutputPreview)

compose_buttons.forEach((element) => {
    element.addEventListener("click",() => {
        compose.classList.add("hidden")
    })
})

upload_element.addEventListener("change", handleFiles, false);
upload_button.addEventListener("click",() => { upload_element.click() })

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