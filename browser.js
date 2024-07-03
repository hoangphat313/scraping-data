const puppeteer = require('puppeteer')

const startBrowser = async () =>{
    let browser
    try {
        browser = await puppeteer.launch({
            // hien ui cua trinh duyet khong, false la co
            headless: true,
            //chrome sd multiple layera cua sandbox tranh truong hop web kh dang tin cay
            //neu tin tuong content dung thi set nhu nay
            args: ["--disable-setuid-sandbox"],
            //truy cap website bo qua loi lien quan  http secure
            'ignoreHTTPSErrors': true
        })
    } catch (error) {
        console.log('Cannot create browser' + error);
    }
    return browser
}

module.exports = startBrowser