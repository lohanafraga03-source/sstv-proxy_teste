const express = require('express');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer');
const helmet = require('helmet');

puppeteerExtra.use(StealthPlugin());

const app = express();
app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET_TOKEN || 'troque_essa_token';
const TARGET = process.env.SSTV_URL || 'https://sstv.center/test.php?key=70d96e0c-8048-4c28-b429-41487fc7421e';
const USE_PROXY = process.env.PROXY_URL || '';

app.get('/sstv-test', async (req, res) => {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ') || auth.split(' ')[1] !== SECRET) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  let browser;
  try {
    const launchOptions = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    };

    if (USE_PROXY) {
      launchOptions.args.push(`--proxy-server=${USE_PROXY}`);
    }

    browser = await puppeteerExtra.launch(launchOptions);
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(TARGET, { waitUntil: 'networkidle2', timeout: 30000 });

    const bodyText = await page.evaluate(() => document.documentElement.innerText);

    await browser.close();

    return res.json({ ok: true, snapshot: bodyText.slice(0, 4000) });
  } catch (err) {
    if (browser) { try { await browser.close(); } catch(e){} }
    console.error('Erro sstv-test:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`srv ok na porta ${PORT}`));
