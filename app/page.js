import RunScraperButton from "./components/RunScraperButton";
import CloudinaryButton from "./components/CloudinaryButton";

//import Link from 'next/link';

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const ExcelJS = require('exceljs');
//const path = require('path');
const cloudinary = require('cloudinary').v2;
const XLSX = require('xlsx');
const streamifier = require('streamifier');


//import FileSaver from "file-saver";

require('dotenv').config()


cloudinary.config({ 
  cloud_name: 'do5l7hms7', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true  
  });

let counter = 0;

//books array
let booksArr = [];

let cloudUrl = ''

export default function Home({ searchParams }) {

  if(searchParams.runScraperButton) {
    console.log('Search Param:', searchParams);

    runScraper();  
 }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <RunScraperButton />
      <CloudinaryButton excelUrl={cloudUrl} />
     {/* {booksArr && <FileButton booksArr={booksArr} />} */}
    </main>
  )
}

const runScraper = async () => {
 
  //launch puppeteer browser
  try {
  const browser = await puppeteer.launch({
    headless:true,
    'args' : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })
  //ignoreDefaultArgs: ['--disable-extensions'],
  const page = await browser.newPage();

  //set browser viewport
  /*await page.setViewport({
  width: 1300,
  height: 600
})*/

//go to url
const endpoint = 'https://books.toscrape.com';
await page.goto(endpoint, {
  waitUntil: "domcontentloaded"
});

//wait 3 seconds
await wait(3000);

//click category
await clickCategory(page);

//wait 3 seconds
await wait(3000);

//extract data
await scrapeData(page);

//wait 3 seconds
await wait(3000);

  //show books
//console.log(booksArr);

//total number of books scraped
console.log('total number of books scraped:', booksArr.length);

console.log('Done.');

//wait 1 seconds
await wait(1000);

//close browser
await browser.close();
}
catch(e) {
  console.log('Some bad happened')
}
//createExcel();
  
//wait 2 seconds
await wait(2000);

uploadToCloudinary(booksArr)
  .then((result) => {
    console.log('Cloudinary upload result:', result);
    // Handle the Cloudinary upload result as needed
  })
  .catch((error) => {
    console.error('Cloudinary upload error:', error);
    // Handle the Cloudinary upload error
  });

await wait(2000);
// Access the cloudUrl value outside the promise chain
console.log('Cloud URL outside promise:', cloudUrl);

}


//wait function
const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//click category function
//let counter = 0;
const clickCategory = async (page) => {
  //const catAttr = 'catalogue/category/books_1/index.html';
  const catAttr = 'catalogue/category/books/mystery_3/index.html';

  if(!await page.$(`a[href='${catAttr}']`)) {
    counter++;
    if(counter < 3) {
      console.log(`can\'t find category selector... Running retry number${counter}`);
      await wait(2000);
      await clickCategory(page);
    }
    else {
      console.log(('Unable to find category selector... Moving on.'));
      counter = 0;
    }
    return;
  }

  counter = 0;

  await page.click(`a[href='${catAttr}']`);
}

// scrape data
const scrapeData = async (page) => {
  const $ = cheerio.load(await page.content());

  if(!await page.$('ol.row li')) {
    counter++;
    console.log(`can\'t find scrapeData  selector... Running retry number${counter}`);
    if(counter < 3) {
      await wait(2000);
      await scrapeData(page);
    }
    else {
      console.log(('Unable to find scrapeData selector... Moving on.'));
      counter = 0;
    }
    return;
  }

  // get li tags
  const liTags = $('ol.row li');

  // extract data for each book
  //let booksArr = [];
  const baseUrl = 'https://books.toscrape.com/';
  liTags.each((i, el) => {
    let imageUrl = $(el).find('img').attr('src');
    imageUrl = imageUrl.replaceAll('../', '').trim();
    imageUrl = baseUrl + imageUrl;
    let starRating = $(el).find('p.star-rating').attr('class');
    starRating = starRating.replace('starRating', '').trim();
    const title = $(el).find('h3').text().trim();
    const price = $(el).find('p.price_color').text().trim();
    const availability = $(el).find('p.instock.availability').text().trim();
    const book = {title, price, starRating, availability, imageUrl};
    booksArr.push(book);


  })
  counter = 0;
  console.log(booksArr);

}

//upload To Cloudinary 
  const uploadToCloudinary = (booksArr) => {
  return new Promise((resolve, reject) => {
    
    // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  
  // Create a new worksheet
  const worksheet = workbook.addWorksheet('Sheet 1');
  
  // Define the column headers
  worksheet.columns = [
    { header: 'title', key: 'title', width: 30 },
    { header: 'price', key: 'price', width: 10 },
    { header: 'starRating', key: 'starRating', width: 20 },
    { header: 'availability', key: 'availability', width: 10 },
    { header: 'imageUrl', key: 'imageUrl', width: 50 },
  ];
  
  // Add data to the worksheet
  booksArr.forEach((row) => {
    worksheet.addRow(row);
  });
  
  // Write the workbook to a buffer
  workbook.xlsx.writeBuffer().then((buffer) => {

  // Convert the buffer to a readable stream
  const stream = streamifier.createReadStream(buffer);

  // Upload the stream to Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        format: 'xlsx',  // Specify the desired format as XLSX
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
          cloudUrl = result.secure_url;
        console.log('Excel file uploaded to Cloudinary:', cloudUrl);
        }
      }
    );
      
    stream.pipe(uploadStream);
  });
});
};

