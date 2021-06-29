const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const _ = require('lodash');

const INIT_SEED_NUMBER = 1;
const ASYNC_TASK_COUNT = 3; // 3개만 줘도 컴퓨터가 힘들었던 건 옛말이긴 한데... 컴퓨터를 아낀다면 20개 넘게는 주지 말아주세요.
const URL = 'https://www.sealedenvelope.com/simple-randomiser/v1/lists';
const SHOULD_MATCH_LIST = [
  [2,2,1,1,2,1,2,1,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,1],
  [2,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,1],
  [2,2,1,1,2,1,2,1,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,1,2,2,2,2,1,1,1],
  [2,2,1,1,2,1,2,1,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,2,1,2,2,2,1,1,1],
  [2,2,1,1,2,1,2,1,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,2,1,1,2,2,1,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,2,1,1,2,1,2,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,1,2,2,2,2,1,1,1],
  [2,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,2,1,2,2,2,1,1,1],
  [2,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,2,1,1,2,2,1,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,2,1,1,2,1,2,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,1,2,2,2,1,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,1,2,2,1,2,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,2,1,2,2,1,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,2,1,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,2,1,2,1,2,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,1,2,2,1,2,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,1,2,2,2,1,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,2,1,2,1,2,2,1,1],
  [2,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2,1,1,2,2,2,1,1,2,1,1,2,2,1,1,2,1,1,2,2,2,1,2,1,1,2,2,1,1,2,1,2,2,1,2,1,1]
];

const fillTheFormAndSend = (page, seedNumber) => page.evaluate((seedNumber) => {
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

  const arr = Array.from($('.randomisation-list:first-of-type').text().split('\n')).slice(1, -1);

  let result = [];
  for (let shouldMatch of SHOULD_MATCH_LIST) {
    for (let [index, shouldMatchNumber] of shouldMatch.entries()) {
      const lastNumber = arr[index].split(',')[3];
      if (shouldMatchNumber !== parseInt(lastNumber)) {
        continue;
      }
      result.push(true);
    }

    if (result.length === shouldMatch.length) {
      console.log('MATCHED ARRAY: ' + shouldMatch)
      return true
    }
    result = []
  }
  return false;
};

(async () => {
  let seedDelta = 0;

  const browserList = [];
  const seedNumberList = [];
  for (let seq = 0; seq < ASYNC_TASK_COUNT; seq++) {
    const browser = await puppeteer.launch();
    browserList.push(browser);
    seedNumberList.push(INIT_SEED_NUMBER + seq);
  }

  let shouldKeepGoing = true;
  while (shouldKeepGoing) {
    const resultList = await Promise.all(
        browserList.map(async (browser, seq) => {
          const seedNumber = seedNumberList[seq] + seedDelta;
          const page = await browser.newPage();
          await page.goto(URL);
          await fillTheFormAndSend(page, seedNumber);
          process.stdout.write(seedNumber + '\n');
          const isMatched = await isThisWhatYouWant(page);
          return { seedNumber, isMatched, page };
        })
    );
    process.stdout.write('---------------\n');
    for (result of resultList) {
      const { page, isMatched } = result;
      await page.close();
      if (isMatched) {
        console.log('MATCHED SEED: ' + result.seedNumber)
        shouldKeepGoing = false;
        break;
      }
    }
    seedDelta += ASYNC_TASK_COUNT;
  }
  browserList.forEach(browser => browser.close());
})();