const request = require('request-promise');
const fs = require('fs');
module.exports= {
  output(obj) {
    fs.writeFileSync('./outfile.json', JSON.stringify(obj, null, 4));
  },
  async getData(url) {
    const options = {
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
      }
    };
    let resp = await request(options);
    return resp;
  }
}