function transliterate(text: string): string {
  const ruToLatMap: { [key: string]: string } = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
    я: 'ya',

    А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'Yo', Ж: 'Zh',
    З: 'Z', И: 'I', Й: 'Y', К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O',
    П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U', Ф: 'F', Х: 'Kh', Ц: 'Ts',
    Ч: 'Ch', Ш: 'Sh', Щ: 'Shch', Ъ: '', Ы: 'Y', Ь: '', Э: 'E', Ю: 'Yu', Я: 'Ya',
    ' ': '_', 
  };

  return text
    .split('')
    .map((char) => ruToLatMap[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/__+/g, '_') // заменяет подряд идущие "_" на одно
    .replace(/^_+|_+$/g, ''); // удаляет "_" в начале и конце
}

export { transliterate };

function reverseTransliterate(text: string): string {
  const latToRuMap: { [key: string]: string } = {
    a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', e: 'е', yo: 'ё', zh: 'ж',
    z: 'з', i: 'и', y: 'й', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о',
    p: 'п', r: 'р', s: 'с', t: 'т', u: 'у', f: 'ф', kh: 'х', ts: 'ц',
    ch: 'ч', sh: 'ш', shch: 'щ', yu: 'ю', ya: 'я',

    A: 'А', B: 'Б', V: 'В', G: 'Г', D: 'Д', E: 'Е', Yo: 'Ё', Zh: 'Ж',
    Z: 'З', I: 'И', Y: 'Й', K: 'К', L: 'Л', M: 'М', N: 'Н', O: 'О',
    P: 'П', R: 'Р', S: 'С', T: 'Т', U: 'У', F: 'Ф', Kh: 'Х', Ts: 'Ц',
    Ch: 'Ч', Sh: 'Ш', Shch: 'Щ', Yu: 'Ю', Ya: 'Я',
    _: ' ',
  };

  // Сначала заменяем многосимвольные сочетания (должно быть до одиночных символов)
  const multiCharPatterns = ['shch', 'sh', 'ch', 'kh', 'ts', 'yo', 'yu', 'ya', 
                           'Shch', 'Sh', 'Ch', 'Kh', 'Ts', 'Yo', 'Yu', 'Ya'];
  
  let result = text.toLowerCase();
  
  for (const pattern of multiCharPatterns) {
    result = result.replace(new RegExp(pattern, 'g'), match => latToRuMap[match] || match);
  }

  // Затем заменяем одиночные символы
  result = result
    .split('')
    .map(char => latToRuMap[char] || char)
    .join('');

  return result;
}

export { reverseTransliterate };
