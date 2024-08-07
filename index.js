
const { chromium } = require("playwright");

(async () => {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

 let articleTimes = [];
 let articlesCount = 0;

 while (articlesCount < 100) {
     try {
         // Wait for articles to load
         await page.waitForSelector('.athing', { timeout: 60000 });
     } catch (error) {
         console.error('Timeout exceeded while waiting for .athing selector:', error);
         await page.screenshot({ path: 'error_screenshot.png' }); // Take a screenshot for debugging
         await browser.close();
         return;
     }

     // Get the times of the articles on the current page
     let newArticles;
     try {
         newArticles = await page.$$eval('.athing', articles => {
             return articles.map(article => {
                 const timeElement = article.nextElementSibling.querySelector('.age');
                 return {
                     id: article.id,
                     time: new Date(timeElement.getAttribute('title'))
                 };
             });
         });
     } catch (error) {
         console.error('Error extracting article times:', error);
         await page.screenshot({ path: 'error_screenshot1.png' }); // Take a screenshot for debugging
         await browser.close();
         return;
     }

     // Add new articles to the list
     articleTimes.push(...newArticles);
     articlesCount = articleTimes.length;

     // If we have collected enough articles, break the loop
     if (articlesCount >= 100) {
         break;
     }
     
     // Click the "More" button to load more articles
     const moreButton = await page.$('a.morelink');
     if (moreButton) {
         await moreButton.click();
         await page.waitForTimeout(2000); // Wait for new articles to load
     } else {
         console.error('No more "More" button found');
         break;
     }
  }

 // Trim the list to the first 100 articles
 articleTimes = articleTimes.slice(0, 100);
 console.log(articleTimes);
 // Validate that articles are sorted from newest to oldest
 let sorted = true;
 for (let i = 1; i < articleTimes.length; i++) {
     if (articleTimes[i].time > articleTimes[i - 1].time) {
         sorted = false;
         break;
     }
 }

 if (sorted) {
     console.log('The first 100 articles are sorted from newest to oldest.');
 } else {
     console.log('The first 100 articles are NOT sorted from newest to oldest.');
 }

 // Close browser
 await browser.close();
})();

