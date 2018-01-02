
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
let main  = null;

entry();
function entry(){
  getData('http://www.dotamax.com/hero/rate/',(error, response, body)=> {
    dataHandle(body)
  });
}

function getData(url,callback){
  const options = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
    }
  };
  request(options, callback);
}

function dataHandle(body) {
  generateAllHero(body);
  getDetailInfo();
}

function generateAllHero(body) {
  let $ = cheerio.load(body);
  main = $('.table-list tbody tr').map((index, item) => {
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
      enName:enName,
      href: href,
      winRate: winRate
    }
  }).get();

  fs.writeFileSync('./outfile.json', JSON.stringify(main, null, 4));
}

function getDetailInfo(){
    let enName = main.enName;
    let _url = `http://www.dotamax.com/hero/detail/match_up_anti/${enName}`
    console.log(_url);
    getData(_url,(error, response, body)=>{
      handleDetailPage(body,main);
    })
}

function handleDetailPage(body,saveObj){
  let $ = cheerio.load(body);
  let trList = $('.table-list tbody tr')
  let mapRtn = trList.map((index, item) => {
    // console.log(index);
    let href = $(item).find('a').eq(0)
    let enName = $(href).attr('href').split('/')[3];

    let antiVal = $(item).find('div').eq(0).text().slice(0,-1);
    let rtn = {antiVal:antiVal,enName:enName}
    return rtn
  }).get()
  
  let antiArray = mapRtn.sort((a,b)=>{
    if(parseFloat(a.antiVal)> parseFloat(b.antiVal))return 1;
    if(parseFloat(a.antiVal)< parseFloat(b.antiVal))return -1;
    return 0;
  }).slice(0,14).map((item,index)=>{
    return item.enName
  })
  saveObj.antiArray = antiArray
}