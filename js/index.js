let tmt, icon, contents, commands, main, converter, current, cItems;
let target = "";

function load() {
    tmt = document.querySelector("tmt")
    icon = document.querySelector("tmt div")
    contents = document.querySelector("contents")
    commands = document.querySelector("commands")
    main = document.querySelector("main")
    converter = new showdown.Converter({extensions: [
        {
            type: 'output',
            regex: /<a\shref="(\S+\.md*?)">/g,
            replace(x, p1) {
                let p = target.replace(/(.*[\\\/$]).+$/s, "$1")
                let u = p + p1.replace(/^[/\\]+/s, "")
                // console.log(x + " " + p1 + " " + url + " " + p)
                let e = contents.querySelector("item[href='" + u + "']")
                if (!e) return `<a href="${p1}">`
                let l = location
                return `<a href="${l.origin}${l.pathname}#${e.getAttribute("hash")}">`
            }
        },
        {
            type: 'output',
            regex: /<a\shref="\/(\S+\.(js|css|html)*?)">/g,
            replace(x, p1) {
                return `<a href="https://github.com/Acamaeda/The-Modding-Tree/blob/master/${p1}" target="_blank">`
            }
        },
    ]})
    current = {}
    cItems = contents.childNodes
    
    tmt.addEventListener('click', function() {
        if (document.body.classList.contains("compact")) {
            commands.classList.remove("active")
            contents.classList.toggle("active")
        }
    });
    document.querySelector("button.menu-button").addEventListener('click', function() {
        if (document.body.classList.contains("compact2")) {
            contents.classList.remove("active")
            commands.classList.toggle("active")
        }
    });
    
    window.addEventListener('popstate', function() {
        var lHash = location.hash || "#home"
        var mHash = main ? main.getAttribute("hash") : ""
        if (lHash != mHash)
            readHash(location.hash)
    });
    window.addEventListener('resize', computeStyle);

    readItems(toArray(cItems), true)
    readHash(location.hash || "#home")
    computeStyle()
}

function readFile(url) {
    let elem = url.srcElement
    target = url = elem.getAttribute("href");
    location.hash = "#" + elem.getAttribute("hash");
    document.title = elem.innerText + " - The Modding Tree Docs";
    let client = new XMLHttpRequest();
    client.open('GET', url.replace("$", "https://raw.githubusercontent.com/Acamaeda/The-Modding-Tree/master/docs/"));
    client.onreadystatechange = function() {
        main.innerHTML = converter.makeHtml(client.responseText)
        if (current && current.classList) current.classList.remove("current")
        current = elem
        current.classList.add("current")
        contents.classList.remove("active")
        contents.scrollTo(0,0)
        main.querySelectorAll('pre code').forEach(el => {
            console.log(el.innerHTML)
            el.innerHTML = hljs.highlight(el.classList[0], el.innerText).value
        })
    }
    client.send();
}
function readHash(hash) {
    let elem = contents.querySelector(`item[hash="${hash.slice(1, hash.length)}"]`)
    if (elem) readFile({ srcElement: elem })
}
function readHref(href) {
    let elem = contents.querySelector(`item[href="${href}"]`)
    if (elem) readFile({ srcElement: elem })
}

function toArray(items) {
    return Array.prototype.slice.call(items)
}
function readItems(items, first = false) {
    for (let item of items) if (item.classList) {
        contents.appendChild(item)
        if (item.tagName == "ITEM") {
            item.addEventListener("click", readFile)
            if (first) item.classList.add("first")
            if (item.childNodes.length > 0) {
                let text = item.childNodes[0].nodeValue
                item.setAttribute("hash", text.toLowerCase().trim().replaceAll(" ", "-"))
            }
            if (item.childNodes.length > 1) {
                readItems(toArray(item.childNodes))
            }
        }
    }
}

function computeStyle() {
    let cs = window.getComputedStyle(icon)
    let width = window.innerWidth / parseInt(cs.width)
    document.body.classList.toggle("compact", width < 18)
    document.body.classList.toggle("compact2", width < 24)
}