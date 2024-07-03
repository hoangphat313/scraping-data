const srcapeCategory = async (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let page = await browser.newPage()
        console.log('>> mo tab moi..');
        await page.goto(url)
        console.log('>> truy cap vao ' + url);
        await page.waitForSelector('#webpage')
        console.log('website da load xong');

        const dataCategory = await page.$$eval('#navbar-menu > ul > li', elements => {
            dataCategory = elements.map(el => {
                return {
                    category: el.querySelector('a').innerText,
                    link: el.querySelector('a').href
                }
            })
            return dataCategory
        })
        await page.close()
        console.log('tab da dong');
        resolve(dataCategory)
    } catch (error) {
        console.log('loi o srcape category' + error);
        reject(error)
    }
})

const scraper = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let newPage = await browser.newPage()
        console.log('>> da mo tab moi');
        await newPage.goto(url)
        console.log('>> da truy cap vao trang ' + url);
        await newPage.waitForSelector('#main')
        console.log('>> da load xong tag main');

        const scrapeData = {}
        //lay header
        const headerData = await newPage.$eval('header', (el) => {
            return {
                title: el.querySelector('h1').innerText,
                description: el.querySelector('p').innerText
            }
        })
        scrapeData.header = headerData

        // lay link detail item
        const detailLinks = await newPage.$$eval('#left-col > section.section-post-listing > ul > li', (els) => {
            detailLinks = els.map(el => {
                return el.querySelector('.post-meta h3 > a').href
            })
            return detailLinks
        })
        //
        const scraperDetail = async (link) => new Promise(async (resolve, reject) => {
            try {
                let pageDetail = await browser.newPage()
                await pageDetail.goto(link)
                console.log('>> truy cap ' + link);
                await pageDetail.waitForSelector('#main')

                const detailData = {}
                // bat dau cao du lieu
                //img
                const images = await pageDetail.$$eval('#left-col > article > div.post-images > div > div.swiper-wrapper > div.swiper-slide', (els) => {
                    images = els.map(el => {
                        return el.querySelector('img')?.src
                    })
                    return images.filter(i => !i === false)
                })
                detailData.images = images

                //lay header page detail
                const header = await pageDetail.$eval('header.page-header', (el) => {
                    return {
                        title: el.querySelector('h1 > a').innerText,
                        start: el.querySelector('h1 > span')?.className?.replace(/^\D+/g, ''),
                        class: {
                            content: el.querySelector('p').innerText,
                            classType: el.querySelector('p > a > strong').innerText
                        },
                        address: el.querySelector('address').innerText,
                        attributes: {
                            price: el.querySelector('div.post-attributes > .price > span').innerText,
                            acreage: el.querySelector('div.post-attributes> .acreage > span').innerText,
                            published: el.querySelector('div.post-attributes> .published > span').innerText,
                            hashtag: el.querySelector('div.post-attributes> .hashtag > span').innerText
                        }
                    }
                })
                detailData.header = header;

                //thong tin mo ta
                const sectionHeader = await pageDetail
                    .$eval('#left-col > article.the-post > section.post-main-content', (el) => el.querySelector('div.section-header > h2').innerText)

                const sectionContent = await pageDetail
                    .$$eval('#left-col > article.the-post > section.post-main-content > .section-content > p', (els) => els.map(el => el.innerText))

                detailData.mainContent = {
                    header: sectionHeader,
                    content: sectionContent
                }
                //dac diem tin dang
                const overviewHeader = await pageDetail
                    .$eval('#left-col > article.the-post > section.post-overview', (el) => el.querySelector('div.section-header > h3').innerText)

                const overviewContent = await pageDetail
                    .$$eval('#left-col > article.the-post > section.post-overview > .section-content > table.table > tbody > tr', (els) => els.map(el => ({
                        name: el.querySelector('td:first-child').innerText,
                        content: el.querySelector('td:last-child').innerText
                    })))
                detailData.overView = {
                    header: overviewHeader,
                    content: overviewContent
                }
                //thong tin lien he
                const contactHeader = await pageDetail
                    .$eval('#left-col > article.the-post > section.post-contact', (el) => el.querySelector('div.section-header > h3').innerText)

                const contactContent = await pageDetail
                    .$$eval('#left-col > article.the-post > section.post-contact > .section-content > table.table > tbody > tr', (els) => els.map(el => ({
                        name: el.querySelector('td:first-child').innerText,
                        content: el.querySelector('td:last-child').innerText
                    })))
                detailData.contact = {
                    header: contactHeader,
                    content: contactContent
                }


                await pageDetail.close()
                console.log('da dong tab' + link);
                resolve(detailData)

            } catch (error) {
                console.log('lay data detail loi ' + error);
                reject(error)
            }
        })
        // vao detail tung trang
        const details = []
        for (let link of detailLinks) {
            const detail = await scraperDetail(link)
            details.push(detail)
        }
        scrapeData.body = details
        resolve(scrapeData)
        console.log('tirnh duyet da dong');
    } catch (error) {
        reject(error)
    }
})


module.exports = {
    srcapeCategory,
    scraper
}