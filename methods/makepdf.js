const puppeteer = require('puppeteer');
const path = require("path");

const makepdf = async (title, text, name) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Create PDF from static HTML
  const htmlContent = `<body>
    <h1>${title}</h1>
    <h2>${text}</h2>
  </body>`
  await page.setContent(htmlContent)

  const pathname = path.join(__dirname, "..", "pdf", `Заметка # ${name}.pdf`);

  // Downlaod the PDF
  await page.pdf({
    path: pathname,
    margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
    printBackground: true,
    format: 'A4',
  });

  await browser.close();
  return pathname;
};

module.exports = makepdf;
