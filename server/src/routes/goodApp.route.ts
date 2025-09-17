import { Router } from 'express';
import fetch from 'node-fetch';

const goodappRouter = Router();

const YANDEX_BASE = 'https://mc.yandex.ru';

goodappRouter.get('/metrika/tag.js', async (req, res) => {
  try {
    const response = await fetch(`${YANDEX_BASE}/metrika/tag.js`);
    const body = await response.text();

    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(body);
  } catch (error) {
    res.status(500).send('Error fetching Yandex Metrika script');
  }
});

goodappRouter.get('/watch/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${YANDEX_BASE}/watch/${id}`;
    const response = await fetch(url);

    const contentType = response.headers.get('content-type');
    if (contentType) res.set('Content-Type', contentType);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (error) {
    res.status(500).send('Error fetching Yandex Metrika pixel');
  }
});

export default goodappRouter;
