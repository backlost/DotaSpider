const cheerio = require('cheerio');
const {
  getData,
  output
} = require('./util');
let main = null;
entry();
async function entry() {
  let mainArr = await catchAllHeroInfo();
  let handleArr = []
  let teamateArr = []
  for (item in mainArr) {
    handleArr.push(await getDetailInfo(mainArr[item]))
    teamateArr.push(await getHappyWith(mainArr[item]))
  }
  await Promise.all(handleArr)
  await Promise.all(teamateArr)
  output(mainArr);
  console.log('文件输出完毕')
}

async function catchAllHeroInfo() {
  let resp = await getData('http://www.dotamax.com/hero/rate/')
  return generateAllHero(resp);
}

function generateAllHero(body) {
  let $ = cheerio.load(body);
  return $('.table-list tbody tr')
    .map((index, item) => {
      let name = $(item).find('.hero-name-list').text()
      let href = $(item).attr('onclick')

      let pattern = /'.+'/;
      let result = href.match(pattern);
      href = result[0].slice(1, -1); // = abas

      let enName = href.split('/')[3];

      let winRate = $(item).find('td').eq(1).text()
      return {
        id: index,
        name: name,
        enName: enName,
        href: href,
        winRate: winRate
      }
    }).get();
}

async function getDetailInfo(main) {
  let enName = main.enName;
  let url = `http://www.dotamax.com/hero/detail/match_up_anti/${enName}`
  let resp =await getData(url);
  handleDetailPage(resp, main);
}

function handleDetailPage(body, saveObj,order) {
  let $ = cheerio.load(body);
  let trList = $('.table-list tbody tr')

  // 遍历行，得到优劣势
  let mapRtn = trList.map((index, item) => {
    let href = $(item).find('a').eq(0)
    let enName = $(href).attr('href').split('/')[3];
    let antiVal = $(item).find('div').eq(0).text().slice(0, -1);
    let rtn = {
      antiVal: antiVal,
      enName: enName
    }
    return rtn
  }).get()

  // 根据优势排序
  let antiArray = mapRtn.sort((a, b) => {
    if (parseFloat(a.antiVal) > parseFloat(b.antiVal)) return 1;
    if (parseFloat(a.antiVal) < parseFloat(b.antiVal)) return -1;
    return 0;
  })
  let handledArray =null;
  if(!order){
    handledArray = antiArray.slice(0, 14).map((item, index) => {
      return `${item.enName}|${item.name}`
    })
    saveObj.opponent = handledArray
    console.log('已经处理完成',saveObj.enName,'opponent');
    
  }else{
    handledArray = antiArray.slice(-14).map((item, index) => {
      return `${item.enName}|${item.name}`
    })
    saveObj.teamate = handledArray
    console.log('已经处理完成',saveObj.enName,'teamate');
  }
}

async function getHappyWith(main){
  let enName = main.enName;
  let url = `http://www.dotamax.com/hero/detail/match_up_comb/${enName}`
  let resp =await getData(url);
  handleDetailPage(resp, main,true);
}