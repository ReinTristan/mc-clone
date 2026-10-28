import type { SpriteDef } from '@/types/textures'

// Pixel art propio (16×16): paletas y motivos originales, sin imitar
// el arte de Mojang. Editable a mano: cada char mapea a la paleta,
// '.' = transparente.
//
// Los sprites en escala de grises (grass_block_top, grass_block_side_overlay)
// NO llevan color: se tintan con `FaceSpec.tint` al componer la cara. Ese es
// el hueco por el que entran los verdes por bioma más adelante — variar el
// color es añadir tints, nunca duplicar sprites.

const dirt: SpriteDef = {
  palette: {
    a: '#9a5b3f',
    b: '#84492f',
    c: '#6f3a26',
    d: '#ac6f4e',
  },
  rows: [
    'aabaacadaabbacaa',
    'baacabaacaadaaba',
    'acaadaabbaacaaab',
    'aabcaaacaabaadaa',
    'daabaadaacabaaca',
    'aacaabaaabdaabaa',
    'abaadacaabaacaad',
    'aadaabaacaadbaaa',
    'caabaacabaabaaca',
    'aabaadaabaacaaba',
    'adaacaabaadaacab',
    'aabaabacaabaabaa',
    'acaadaabaacdaaba',
    'baacaabaadaabaac',
    'aadaabacaabaacaa',
    'abaacaadaacabada',
  ],
}

// Grises: se tinta al componer. Valores altos a propósito — un sprite oscuro
// tintado da un verde embarrado.
const grass_block_top: SpriteDef = {
  palette: {
    w: '#f2f2f2',
    x: '#d6d6d6',
    y: '#b4b4b4',
    z: '#949494',
  },
  rows: [
    'xwxxyxwxxxywxxwy',
    'wxyxxwxxyzxxwxxy',
    'xxwyxxywxwyxxyzx',
    'yxxwwxxyxxwxwxxw',
    'xwyxxyzxwxxyxxyx',
    'xxxwxwxyxyxwyxwx',
    'wxyzxxwxxwyxxxxy',
    'xxwxyxxyxxxwwxyx',
    'xyxwwxyxyzxwxxwx',
    'wxxyxxwyxwxxyxxw',
    'xwyxxyxwxxyzxwyx',
    'xxxwwxyxwxxwxxxy',
    'yxwxxxywxyxxwxwy',
    'xwxyzxwxxwyxxyxx',
    'xxywxwxyxxxwyxxw',
    'wxxxyxwyxwxxxyzx',
  ],
}

// Base tierra vista de lado, SIN franja de pasto: el verde lo pone
// grass_block_side_overlay. El properties.color viejo tintaba la cara entera
// y por eso no podía haber tierra abajo y pasto arriba en la misma cara.
const grass_block_side: SpriteDef = {
  palette: {
    a: '#9a5b3f',
    b: '#84492f',
    c: '#6f3a26',
    d: '#ac6f4e',
  },
  rows: [
    'aabaadaacaabaada',
    'adaabaaadaabcaab',
    'aacaabdaabaacaaa',
    'baaadaacaabaadab',
    'aabaacaaabdaacaa',
    'acaabaadaacaabaa',
    'aaadaacbaabaadac',
    'abaacaaadaacaaba',
    'aadaabaacbaadaaa',
    'caabaadaaabaacab',
    'aaacaabdaacaabaa',
    'abaadaacaabaadaa',
    'aacaaabaadaacbaa',
    'daabaacaaabaadaa',
    'aaadaabcaadaacab',
    'abaacaaadaabaada',
  ],
}

// Grises + alpha: solo la franja superior con flecos irregulares.
// Se dibuja encima de la base y se tinta con el verde del bloque.
const grass_block_side_overlay: SpriteDef = {
  palette: {
    w: '#f2f2f2',
    x: '#d6d6d6',
    y: '#b4b4b4',
    z: '#949494',
  },
  rows: [
    'xwxxywxxxwyxxwxy',
    'wxxyxxwxyxxwxxyx',
    'xxyxwxxyxxwxyxxw',
    'yxy.xwxyx.xyxyxy',
    'xy..yxy.z.yzy.yz',
    '.z...yz...z.z.z.',
    '.....z......z...',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
}

const stone: SpriteDef = {
  palette: {
    a: '#7d8794',
    b: '#6b7581',
    c: '#5a636f',
    d: '#8f99a6',
  },
  rows: [
    'aadddaaabbaaaaad',
    'aaddaaaabbaacaad',
    'daaaaabbaaaaddaa',
    'aaabbbaaacaaddaa',
    'aaabbaaaaaaaadaa',
    'ddaaaaaddaaabbaa',
    'daaacaaddaaabbaa',
    'aaaaaaaaaaaabaaa',
    'aabbaaaaddaaaaad',
    'aabbaaacddaaaadd',
    'aaaaaaaaadaaaadd',
    'ddaaabbaaaaaaaaa',
    'ddaaabbaaaccaaaa',
    'aaaaaaaaaaccaaaa',
    'aabddaaaaaaaabba',
    'aaddaaaaadaaabba',
  ],
}

const cobblestone: SpriteDef = {
  palette: {
    a: '#7d8794',
    b: '#6b7581',
    c: '#4d5661',
    d: '#8f99a6',
    e: '#9ba5b2',
  },
  // Cantos irregulares cerrados por mortero (c), con el borde iluminado (e)
  // arriba-izquierda para que cada canto se lea redondeado. Cierra al tilear.
  rows: [
    'aaabcebbccaaabce',
    'aaabcecccceaabce',
    'aaabcceeeccbbbce',
    'bbbbceaaabcccccc',
    'ccccccbabbceeeec',
    'ceeeeccbcceaaaab',
    'eaaaabcceeaaaabc',
    'eaaaaabceaaaaabc',
    'eaaaaabceaaaaabc',
    'eaaaaabccaaaaabc',
    'eaaaaaabcebbbbbc',
    'ebbbbbbccccccccc',
    'ccccccceceeeeeec',
    'eeeeceebceaaaabc',
    'eaabceabceaaaabc',
    'aaabceabceaaabce',
  ],
}

const oak_log: SpriteDef = {
  palette: {
    a: '#a9743f',
    b: '#8e5c30',
    c: '#6f4523',
    d: '#c08e55',
  },
  rows: [
    'adabacaadabaacab',
    'addbacaadbbaacab',
    'adabbcaadabaacdb',
    'adabacdadabbacab',
    'aaabacaaaabaacab',
    'adacacaadacaacab',
    'adabacaadabaacab',
    'adabacaddabadcab',
    'ddabacaadabaacac',
    'adababaadabaabab',
    'adbbacaaddbaacab',
    'adabacaadabaacab',
    'adabdcaadabdacab',
    'adabacbadabaacbb',
    'acabacaababaacab',
    'adabacaadabaacab',
  ],
}

const oak_log_top: SpriteDef = {
  palette: {
    a: '#c08e55',
    b: '#a9743f',
    c: '#8e5c30',
    d: '#6f4523',
  },
  // Anillos de crecimiento por radio (ligeramente ovalados, no una diana
  // cuadrada). La cara llena el cuadrado: corteza solo en el borde de 1px.
  rows: [
    'dddddddddddddddd',
    'dbbcaaaaaaaacbbd',
    'dbcaaaccccaaacbd',
    'dcaaccbbbbccaacd',
    'dcacbbbbbbbbcacd',
    'daacbbcaacbbcaad',
    'daabbcaaaacbbaad',
    'dacbbcaccacbbcad',
    'dacbbcaccacbbcad',
    'daabbcaaaacbbaad',
    'daacbbcaacbbcaad',
    'dcacbbbbbbbbcacd',
    'dcaaccbbbbccaacd',
    'dbcaaaccccaaacbd',
    'dbbcaaaaaaaacbbd',
    'dddddddddddddddd',
  ],
}

// Tablas de altura desigual (3/4/3/3, con la de arriba y la de abajo uniéndose
// al tilear) y solo 2 juntas de testa, en el tono medio (c) y no en el más
// oscuro. Con junta en las 4 y alturas iguales se leía como muro de ladrillo.
// La veta va en tiradas largas: eso es lo que la hace madera.
const oak_planks: SpriteDef = {
  palette: {
    a: '#c08e55',
    b: '#a9743f',
    c: '#8e5c30',
    d: '#6f4523',
  },
  rows: [
    'aabbbaaaaacaaacc',
    'aaaaacccaacaaaaa',
    'abbaaaaaabcaaaaa',
    'dddddddddddddddd',
    'aaccacaabbbaaaaa',
    'aaaaacaaaaacccaa',
    'bbbaacaccaaaaabb',
    'aaacccaaabbaaaaa',
    'dddddddddddddddd',
    'ccaaaaaaabbbaaaa',
    'aaaacccaaaaaaabb',
    'aabbaaaaccaaaaaa',
    'dddddddddddddddd',
    'aacccaaaaacaaaaa',
    'bbbaaaaccacaaaaa',
    'aaaaacccaacabbba',
  ],
}

// Despiece propio: ladrillo estrecho (~5px) para que no se lea como el de MC.
const stone_bricks: SpriteDef = {
  palette: {
    a: '#7d8794',
    b: '#6b7581',
    c: '#4d5661',
    d: '#8f99a6',
  },
  rows: [
    'daaabcdaaabcdaab',
    'aabaacaabaacaaba',
    'abaaacabaaacabaa',
    'cccccccccccccccc',
    'aacdaaabcdaaabcd',
    'bacaabaacaabaaca',
    'abcabaaacabaaaca',
    'cccccccccccccccc',
    'adaabcadaabcadab',
    'aabaacbaaaacbaaa',
    'baabacaabaacaaba',
    'cccccccccccccccc',
    'dacaaabacaaabaca',
    'abcdaaaacdaaaacd',
    'aacabaabcabaabca',
    'cccccccccccccccc',
  ],
}

// Ladrillo ancho (8px) a media traba, con mortero claro: rítmicamente
// opuesto a stone_bricks para que los dos no se confundan de lejos.
const bricks: SpriteDef = {
  palette: {
    a: '#b05a45',
    b: '#98483a',
    c: '#d9cfc4',
    d: '#c47060',
  },
  rows: [
    'daaaabacdaaaabaa',
    'aabaaaacaabaaaab',
    'abaabaacabaabaaa',
    'cccccccccccccccc',
    'aabcdaaaabacdaaa',
    'baacaabaaaacaaba',
    'aaacabaabaacabaa',
    'cccccccccccccccc',
    'abaaaabcaaabaaad',
    'daabaaacbaaaabaa',
    'aabaabacaabaaaba',
    'cccccccccccccccc',
    'baacaaabaaacaaab',
    'aabcdaaaabacdaaa',
    'abacaabaaabcaaba',
    'cccccccccccccccc',
  ],
}

const glass: SpriteDef = {
  palette: {
    g: '#9fc9d9',
    h: '#dff2f7',
  },
  // Dos destellos cortos y desplazados; una sola diagonal larga se leía como
  // un tachón cruzando el panel.
  rows: [
    'gggggggggggggggg',
    'g..............g',
    'g.hh...........g',
    'g..hh..........g',
    'g...h..........g',
    'g..............g',
    'g..............g',
    'g..............g',
    'g..............g',
    'g..............g',
    'g..........h...g',
    'g..........hh..g',
    'g...........h..g',
    'g..............g',
    'g..............g',
    'gggggggggggggggg',
  ],
}

export const sprites: Record<string, SpriteDef> = {
  bricks,
  cobblestone,
  dirt,
  glass,
  grass_block_side,
  grass_block_side_overlay,
  grass_block_top,
  oak_log,
  oak_log_top,
  oak_planks,
  stone,
  stone_bricks,
}
