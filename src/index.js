const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const URL = 'https://www.sealedenvelope.com/simple-randomiser/v1/lists';

const fillTheFormAndSend = async (page, seedNumber) => page.evaluate((seedNumber) => {
  const seed = document.querySelector('.form-group:nth-of-type(1) input:first-of-type');
  const treatmentGroups = document.querySelector('.form-group:nth-of-type(2) input:first-of-type');
  const blockSizes = document.querySelector('.form-group:nth-of-type(3) input:first-of-type');
  const listLength = document.querySelector('.form-group:nth-of-type(4) input:first-of-type');

  seed.value = seedNumber;
  treatmentGroups.value = '1, 2';
  blockSizes.value = 4;
  listLength.value = 4 * 14;

  const primaryButton = document.querySelector('.btn-primary');
  primaryButton.click();
}, seedNumber);


const isThisWhatYouWant = async (page) => {
  await page.waitForSelector('.pale');
  const $ = cheerio.load(await page.content());

  const shouldMatch = [2, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 2, 1, 1, 2, 1, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 2, 1, 1, 1];
  const arr = Array.from($('.randomisation-list:first-of-type').text().split('\n'));
  const result = [];
  shouldMatch.forEach((item, index) => {
    if (arr[index] !== undefined) {
      const lastNumber = arr[index].split(',')[3];
      if (item === parseInt(lastNumber)) {
        result.push(true);
      }
    }
  });
  return result.length === shouldMatch.length;
};

puppeteer.launch()
  .then(async (browser) => {
    let seedNumber = 3300;
    const page = await browser.newPage();
    await page.goto(URL);
    do {
      process.stdout.write('\n' + seedNumber);
      await fillTheFormAndSend(page, seedNumber++);
    } while (!(await isThisWhatYouWant(page)));
    process.stdout.write(' <- correct seed!!');
    browser.close();
  });
