let contents, main, converter, current, cItems;

function load() {
    contents = document.querySelector("contents")
    main = document.querySelector("main")
    converter = new showdown.Converter()
    current = {}
    cItems = contents.childNodes
    
    
    window.addEventListener('popstate', function() {
        var lHash = location.hash || "#home"
        var mHash = main ? main.getAttribute("hash") : ""
        if (lHash != mHash)
            readHash(location.hash)
    });

    readItems(toArray(cItems), true)
    readHash(location.hash || "#home")
}

function readFile(url) {
    let elem = url.srcElement
    url = elem.getAttribute("href");
    location.hash = "#" + elem.getAttribute("hash");
    document.title = elem.innerText + " - Modding Tree Docs";
    let client = new XMLHttpRequest();
    client.open('GET', url.replace("$", "https://raw.githubusercontent.com/Acamaeda/The-Modding-Tree/master/docs/"));
    client.onreadystatechange = function() {
        main.innerHTML = converter.makeHtml(client.responseText).replace(/<a\shref="(\S+\.md*?)">/g, (x, p1) => {
            let p = url.replace(/(.*[\\\/$]).+$/s, "$1")
            let u = p + p1.replace(/^[/\\]+/s, "")
            console.log(x + " " + p1 + " " + url + " " + p)
            let e = contents.querySelector("item[href='" + u + "']")
            if (!e) return `<a href="${p1}">`
            let l = location
            return `<a href="${l.origin}${l.pathname}#${e.getAttribute("hash")}">`
        }).replace(/<a\shref="\/(\S+\.js*?)">/g, (x, p1) => {
            return `<a href="https://github.com/Acamaeda/The-Modding-Tree/blob/master/${p1}" target="_blank">`
        })
        if (current && current.classList) current.classList.remove("current")
        current = elem
        current.classList.add("current")
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