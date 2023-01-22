function addClass(e,t){e.classList.add(t)}function setCookie(e,t,s){var r,n;s=s||1,r=new Date,r.setTime(r.getTime()+24*s*60*60*1e3),n="expires="+r.toUTCString(),document.cookie=e+"="+t+"; "+n}function getCookie(e){var t;cookies=document.cookie.split("; ");for(var s=0;s<cookies.length;s++)if(t=cookies[s].split("="),t[0]==e)return t[1];return""}function setTitle(e){pageTitle.innerHTML=e}function brightnessByColor(e){e=""+e;var t=0==e.indexOf("#"),s=0==e.indexOf("rgb");if(t){var r=e.substr(1).match(7==e.length?/(\S{2})/g:/(\S{1})/g);if(r)var n=parseInt(r[0],16),a=parseInt(r[1],16),i=parseInt(r[2],16)}if(s){r=e.match(/(\d+){3}/g);if(r)n=r[0],a=r[1],i=r[2]}if(void 0!==n)return(299*n+587*a+114*i)/1e3}function rusToLat(e){let t={"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"j","з":"z","и":"i","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"shch","ы":"y","э":"e","ю":"u","я":"ya","ъ":"ie","ь":"","й":"i"};return[...e].map(e=>{let s=t[e.toLocaleLowerCase()];return e!==e.toLocaleLowerCase()?s=s.charAt(0).toLocaleUpperCase()+s.slice(1):void 0===s&&(s=e),s}).join("")}function apply_filters(e){const t=document.querySelectorAll("#list > div"),s=filter_button.querySelectorAll(".indicator");var r=0;t.forEach(e=>{var t=!1;0==e.classList.contains("unread")&&using_filters.find(e=>"Unread"==e)&&(t=!0);const s=e.querySelector(".attachment");null==s&&using_filters.find(e=>"Attachment"==e)&&(t=!0);const n=e.querySelector(".bookmark_icon");0==n.classList.contains("enabled")&&using_filters.find(e=>"Bookmark"==e)&&(t=!0),e.classList.add("hidden"),!0!==t&&(r+=1),setTimeout(()=>{1==t?e.classList.add("hidden"):e.classList.remove("hidden")},10)}),s.forEach(e=>{using_filters.find(t=>t==e.dataset.filter)?e.classList.remove("hidden"):e.classList.add("hidden")}),r>0?nomail.classList.add("hidden"):nomail.classList.remove("hidden")}function setTheme(e){const t=document.querySelector("#Logo_Full"),s=document.querySelector(".themes [theme='"+e+"']"),r=document.querySelector(":root");var n=!1;if("dark"!==e&&"light"!==e&&(n=!0),"#"==e.substring(0,1)){const t=brightnessByColor(e);r.style.setProperty("--background-content",e),t>150&&(e="light")}switch(main.classList.add("image"),e){case"geometry":r.style.setProperty("--background-content","url(../media/themes/Geometry.png)"),e="dark";break;case"hills":r.style.setProperty("--background-content","url(../media/themes/Hills.png)"),e="dark";break;case"mountains":r.style.setProperty("--background-content","url(../media/themes/Mountains.png)"),e="dark";break;case"roses":r.style.setProperty("--background-content","url(../media/themes/Roses.png)"),e="dark";break;case"starwars":r.style.setProperty("--background-content","url(../media/themes/StarWars.png)"),e="dark";break;case"warface":r.style.setProperty("--background-content","url(../media/themes/Warface.png)"),e="dark";break;default:main.classList.remove("image")}if(s){if(s.classList.contains("selected"))return;theme_buttons.forEach(e=>{s===e?e.classList.add("selected"):e.classList.remove("selected")})}document.documentElement.setAttribute("data-custom-theme",n),localStorage.setItem("custom-theme",n),document.documentElement.setAttribute("data-theme",e),localStorage.setItem("theme",e),0==n&&r.style.setProperty("--background-content",null),"light"==e?t.setAttribute("src","Media/Mail_Full_Light.png"):t.setAttribute("src","Media/Mail_Full.png")}function createElem(e,t,s){const r=document.createElement(e);return t.appendChild(r),s&&addClass(r,s),r}function setBackButtonEnabled(e){const t=document.querySelector("#corner-content_1"),s=document.querySelector("#corner-content_2"),r=document.querySelector("#list"),n=document.querySelector("#viewer");e?(s.classList.remove("disabled"),t.classList.add("disabled"),r.setAttribute("style","display: none"),n.setAttribute("style","display: block"),filters.setAttribute("style","display: none;")):(s.classList.add("disabled"),t.classList.remove("disabled"),r.setAttribute("style","display: block"),n.setAttribute("style","display: none"),filters.setAttribute("style",""))}function renderListItem(e){var t=createElem("div",list);0==e.read&&addClass(t,"unread");createElem("div",t,"unread-dot");var s=e.author,r=createElem("img",t,"avatar");s.avatar?r.setAttribute("src",s.avatar):r.setAttribute("src","media/user.png");var n=createElem("div",t,"checkbox"),a=createElem("img",n);a.setAttribute("src","media/Check_mark.png");var i=createElem("div",t,"main-part"),c=createElem("div",i,"name-and-special"),l=createElem("h3",c);l.innerHTML=s.name+" "+s.surname;var o=createElem("div",c,"special"),d=createElem("img",o,"bookmark_icon");d.setAttribute("src","media/Bookmark.png"),1==e.bookmark?addClass(d,"enabled"):d.setAttribute("src","media/Bookmark_Empty.png");var u=createElem("img",o,"important_icon");u.setAttribute("src","media/Important.png"),1==e.important&&addClass(u,"enabled");var m=createElem("div",i,"compressed-contents"),g=createElem("h3",m,"listed-title");g.innerHTML=e.title;var p=createElem("h3",m,"listed-content");p.innerHTML=e.text;var f=createElem("div",t,"categories");if(e.doc){var b=createElem("img",f,"doc");b.setAttribute("src","media/Attachment.png"),b.setAttribute("class","attachment")}if(e.flag){b=createElem("img",f);"Регистрации"==e.flag&&b.setAttribute("src","media/Cat_Registration.png"),"Штрафы и налоги"==e.flag&&b.setAttribute("src","media/Cat_Pay.png"),"Заказы"==e.flag&&b.setAttribute("src","media/Cat_Orders.png"),"Финансы"==e.flag&&b.setAttribute("src","media/Cat_Finance.png"),"Путешествия"==e.flag&&b.setAttribute("src","media/Cat_Travel.png"),"Билеты"==e.flag&&b.setAttribute("src","media/Cat_Tickets.png")}var h=createElem("h4",t,"listed-date");h.innerHTML=getDisplayDate(e.date).replace("/^0+/",""),i.addEventListener("click",()=>renderEmail(e.date))}function getDisplayDate(e){var t=new Date;if(t.setHours(0),t.setMinutes(0),t.setSeconds(0),t.setMilliseconds(0),compDate=new Date(e),diff=t.getTime()-compDate.getTime(),compDate.getTime()==t.getTime())return"ru"==lang_current?"Сегодня, в "+compDate.getHours()+":"+compDate.getMinutes():"Today, at "+compDate.getHours()+":"+compDate.getMinutes();if(diff<=864e5)return"ru"==lang_current?"Вчера, в "+compDate.getHours()+":"+compDate.getMinutes():"Yesterdat, at "+compDate.getHours()+":"+compDate.getMinutes();var s=compDate.toDateString().split(" "),r=(s[0],s[1]),n=s[2],a=s[3],i="",c=(new Date).getFullYear;c!==a&&(i=", "+a);var l=n+" "+r+i;return"ru"==lang_current&&(l=l.replace("Jan","января").replace("Feb","Февраля").replace("Mar","Марта").replace("Apr","Апреля").replace("May","Мая").replace("Jun","Июня").replace("Jul","Июля").replace("Aug","Августа").replace("Sep","Сентября").replace("Oct","Октября").replace("Nov","Ноября").replace("Dec","Декабря")),l}function renderEmail(e){const t=viewer.innerHTML;viewer.innerHTML="",setBackButtonEnabled(!0),viewer.classList.add("shimmer");http.open("GET","/api/get_email_by_date/"+e);http.send(),http.onreadystatechange=function(){if(4==this.readyState&&200==this.status){viewer.innerHTML=t,setTitle("ru"==lang_current?"Почта Mail.ru":"Mail.ru");const n=JSON.parse(http.response)[0],a=document.querySelector(".title"),i=document.querySelector(".flag"),c=document.querySelector(".flag_icon"),l=document.querySelector(".dot"),o=document.querySelector(".extra > .avatar"),d=document.querySelector(".name"),u=document.querySelector(".date"),m=document.querySelector(".recipients"),g=document.querySelector(".media"),p=document.querySelector(".download"),f=document.querySelector(".content"),b=document.querySelector(".flaged_viewer"),h=document.querySelector(".important_viewer");a.innerHTML=n.title,n.author.avatar?o.setAttribute("src",n.author.avatar):o.setAttribute("src","media/user.png"),o.setAttribute("style",""),1==n.bookmark?b.setAttribute("style",""):b.setAttribute("style","display: none;"),1==n.important?h.setAttribute("style",""):h.setAttribute("style","display: none;"),d.innerHTML=n.author.name+" "+n.author.surname,u.innerHTML=getDisplayDate(n.date);var e=[];n.to.forEach(t=>{e.push(t.name+" "+t.surname)});let _="получателей";if("ru"!==lang_current&&(_="recipients"),n.to.length>4?m.innerHTML=n.to.length+" "+_+": "+e.join(", "):n.to.length>1?(_="получателей","ru"!==lang_current&&(_="recipients"),m.innerHTML=n.to.length+" "+_+": "+e.join(", ")):(_="получателей","ru"!==lang_current&&(_="Recipient"),m.innerHTML=_+": "+e.join("")),g.innerHTML="",n.doc){var s=n.doc.img;if(s){var r="1 файл";if("ru"!==lang_current&&(r="1 file"),"string"==typeof s){const e=createElem("div",g);e.setAttribute("class","container");const t=createElem("img",e);t.setAttribute("src",s),t.setAttribute("class","attachment");const r=createElem("a",e);r.setAttribute("class","overlay"),r.setAttribute("href",s),r.setAttribute("download","file.png");const n=createElem("img",r);n.setAttribute("src","media/Download_Icon.png");const a=createElem("img",r);a.setAttribute("src","media/LightOverlay.png"),a.setAttribute("class","gradient");const i=createElem("p",r);i.innerHTML="Скачать","ru"!==lang_current&&(i.innerHTML="Download")}else s.length>4?(r=s.length+" файлов","ru"!==lang_current&&(r=s.length+" files")):(r=s.length+" файла","ru"!==lang_current&&(r=s.length+" files")),s.forEach(e=>{const t=createElem("div",g);t.setAttribute("class","container");const s=createElem("img",t);s.setAttribute("src",e),s.setAttribute("class","attachment");const r=createElem("a",t);r.setAttribute("class","overlay"),r.setAttribute("href",e),r.setAttribute("download","image.png");const n=createElem("img",r);n.setAttribute("src","media/Download_Icon.png");const a=createElem("img",r);a.setAttribute("src","media/LightOverlay.png"),a.setAttribute("class","gradient");const i=createElem("p",r);i.innerHTML="Скачать","ru"!==lang_current&&(i.innerHTML="Download")});p.innerHTML=r+"<a href='"+s+"' download='файл.png'>Скачать все файлы</a>","ru"!==lang_current&&(p.innerHTML=r+"<a href='"+s+"' download='file.png'>Download all files</a>")}}else p.innerHTML="";f.innerHTML=n.text,n.read?l.setAttribute("style","opacity: 0"):l.setAttribute("style","opacity: 1"),"Регистрации"==n.flag&&(i.innerHTML="Accounts",c.setAttribute("src","media/Cat_Registration.png")),"Штрафы и налоги"==n.flag&&(i.innerHTML="Fines and taxes",c.setAttribute("src","media/Cat_Pay.png")),"Заказы"==n.flag&&(i.innerHTML="Orders",c.setAttribute("src","media/Cat_Orders.png")),"Финансы"==n.flag&&(i.innerHTML="Finance",c.setAttribute("src","media/Cat_Finance.png")),"Путешествия"==n.flag&&(i.innerHTML="Travel",c.setAttribute("src","media/Cat_Travel.png")),"Билеты"==n.flag&&(i.innerHTML="Tickets",c.setAttribute("src","media/Cat_Tickets.png")),n.flag&&"ru"==lang_current?i.innerHTML=n.flag:null==n.flag&&(i.innerHTML="",c.setAttribute("src","")),viewer.classList.remove("shimmer")}}}function renderFolder(e,t){1==t&&(ItemsRendered=0,setBackButtonEnabled(!1),last_folder=e,RequestsMade=[],list.innerHTML="");let s="/api/get_folder_emails/"+e+"/"+Step+"/"+ItemsRendered;http.open("GET",s);RequestsMade[s]=!0,http.send(),http.onreadystatechange=function(){if(4==this.readyState&&200==this.status){const e=JSON.parse(http.response);e.length<Step&&window.removeEventListener("scroll",handleInfiniteScroll),ItemsRendered+=e.length,e.forEach(e=>renderListItem(e)),apply_filters(!0),setupCheckboxes()}}}function setSettingsOption(e){const t=settings_content.querySelector("."+e);"theme"==e?settings.style.setProperty("height","75%"):settings.style.setProperty("height","45%"),settings.querySelectorAll("div").forEach(e=>{t===e?e.classList.add("selected"):e.classList.remove("selected")})}function setupLanguageInfo(){setupLanguages||(setupLanguages=!0,translations.ru={},all.forEach(e=>{const t=e.getAttribute("tid");null!==t&&(t.startsWith("_")&&(translations.en[t]=t.substring(1)),translations.ru[t]=e.innerHTML)}))}function setLanguage(e){if(lang_current==e)return;const t=settings.querySelector("#lang_button");var s="Язык: Русский";"en"==e&&(s="Language: English"),t.innerHTML=s+'<img src="media/flag_'+e+'.png">',language_labels.forEach(t=>{t.getAttribute("language")==e?t.classList.add("selected"):t.classList.remove("selected")}),lang_current=e,setupLanguageInfo();const r=document.querySelector("html");r.setAttribute("lang",e);const n=translations[e];all.forEach(e=>{const t=e.getAttribute("tid");null!==t&&(e.innerHTML=n[t])})}function setupCheckboxes(){const e=document.querySelectorAll(".checkbox");e.forEach(e=>{e.addEventListener("click",()=>{e.parentElement.classList.contains("checked")?e.parentElement.classList.remove("checked"):e.parentElement.classList.add("checked")})})}const main=document.querySelector("main"),pageTitle=document.querySelector("title"),sidebar=document.querySelector("#sidebar"),primary=document.querySelector(".primary"),list=document.querySelector("#list"),viewer=document.querySelector("#viewer"),http=new XMLHttpRequest,nomail=document.querySelector(".no-mail"),filters=document.querySelector(".filters"),filter_options=document.querySelector(".filter-options"),filter_button=document.querySelector(".filter-button"),filter_options_all=document.querySelectorAll(".filter-options > h3"),settings_button=document.querySelector("#settings_button"),close_settings_button=document.querySelector("#close-settings"),settings=document.querySelector("#settings"),sidebar_buttons=document.querySelectorAll("#folders > button"),settings_option_buttons=document.querySelectorAll("#settings .options > button"),settings_content=document.querySelector("#settings .content"),theme_buttons=document.querySelectorAll(".themes > div"),language_labels=document.querySelectorAll(".languages > p"),all=document.querySelectorAll("*");var lang_current=null,last_folder=null,ItemsRendered=0;const Step=20;var using_filters=[];filter_button.addEventListener("click",()=>{filter_options.classList.contains("enabled")?(filter_options.classList.remove("enabled"),filter_button.classList.remove("enabled")):(filter_options.classList.add("enabled"),filter_button.classList.add("enabled"))}),document.addEventListener("click",function(e){filter_options.contains(e.target)||filter_button.contains(e.target)||(filter_options.classList.remove("enabled"),filter_button.classList.remove("enabled")),settings.contains(e.target)||settings_button.contains(e.target)||(settings.classList.remove("enabled"),main.classList.remove("minimized"))}),filter_options_all.forEach(e=>{e.addEventListener("click",()=>{const t=e.querySelector(".check_mark"),s=e.dataset.filter;t?(t.classList.contains("enabled")?(t.classList.remove("enabled"),using_filters=using_filters.filter(function(e){return e!==s})):(t.classList.add("enabled"),using_filters.push(s)),apply_filters()):filter_options_all.forEach(e=>{const t=e.querySelector(".check_mark"),s=e.dataset.filter;t&&(t.classList.remove("enabled"),using_filters=using_filters.filter(function(e){return e!==s}),apply_filters())})})});const backButton=document.querySelector("#corner-content_2");backButton.addEventListener("click",()=>{renderFolder(last_folder,!0)});var RequestsMade=[],setupLanguages=!1,translations={en:{options:'<img src="media/Settings.png">Options',unread:'<img class="check_mark" src="media/Check_mark.png"><img style="width: 0.45em;" src="media/Blue_Circle.png">Unread',flaged:'<img class="check_mark" src="media/Check_mark.png"><img style="width: 0.75em;" src="media/Bookmark.png">Flagged',has_attachment:'<img class="check_mark" src="media/Check_mark.png"><img src="media/Attachment.png">With attachments',compose:'<img src="media/Icon_0.png">Write a letter',inbox:'<img src="media/Icon_1.png">Inbox',important:'<img src="media/Icon_2.png">Important',sent:'<img src="media/Icon_3.png">Sent',draft:'<img src="media/Icon_4.png">Drafts',archive:'<img src="media/Icon_5.png">Archive',spam:'<img src="media/Icon_6.png">Spam',trash:'<img src="media/Icon_7.png">Trash',new_folder:'<img src="media/Plus.png">New folder'}};const handleInfiniteScroll=()=>{const e=window.innerHeight+window.scrollY>=document.body.offsetHeight-120;if(e){const e="/api/get_folder_emails/"+last_folder+"/"+Step+"/"+ItemsRendered;if(RequestsMade[e])return;renderFolder(last_folder)}};sidebar_buttons.forEach(e=>{0==e.classList.contains("new-folder")&&e.addEventListener("click",()=>{if(!e.classList.contains("selected")){if("ru"==lang_current)setTitle(e.getAttribute("folder")+" - Почта Mail.ru");else{const s=e.getAttribute("folder");var t="";"Входящие"==s?t="Inbox":"Важное"==s?t="Important":"Отправленные"==s?t="Sent":"Черновики"==s?t="Drafts":"Архив"==s?t="Archive":"Спам"==s?t="Spam":"Корзина"==s&&(t="Trash"),setTitle(t+" - Mail.ru")}renderFolder(rusToLat(e.getAttribute("folder")),!0),window.addEventListener("scroll",handleInfiniteScroll),sidebar_buttons.forEach(t=>{e===t?t.classList.add("selected"):"white-button"!==e.className&&t.classList.remove("selected")})}})}),settings_button.addEventListener("click",()=>{settings.classList.contains("enabled")?(settings.classList.remove("enabled"),main.classList.remove("minimized")):(settings.classList.add("enabled"),main.classList.add("minimized"))}),close_settings_button.addEventListener("click",()=>{settings.classList.contains("enabled")&&(settings.classList.remove("enabled"),main.classList.remove("minimized"))}),settings_option_buttons.forEach(e=>{e.addEventListener("click",()=>{e.classList.contains("selected")||(setSettingsOption(e.getAttribute("option")),settings_option_buttons.forEach(t=>{e===t?t.classList.add("selected"):t.classList.remove("selected")}))})}),theme_buttons.forEach(e=>{e.addEventListener("click",()=>{if(e.classList.contains("selected"))return;let t=e.getAttribute("theme");null==t&&e.classList.contains("color-theme")&&(t=e.getAttribute("color")),setCookie("theme",t,2),setTheme(t),theme_buttons.forEach(t=>{e===t?t.classList.add("selected"):t.classList.remove("selected")})})}),language_labels.forEach(e=>{const t=e.querySelector(".check");t.addEventListener("click",()=>{if(e.classList.contains("selected"))return;let t=e.getAttribute("language");setCookie("language",t,2),setLanguage(t),language_labels.forEach(t=>{e===t?t.classList.add("selected"):t.classList.remove("selected")})})}),document.addEventListener("DOMContentLoaded",()=>{const e=getCookie("theme"),t=getCookie("language");setTheme(e||"dark"),setLanguage(t||"ru"),renderFolder("Vhodyashchie")});