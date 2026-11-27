// Erzeugt die Personenbilder der Forscherwahl (produktentwicklung.js, BILD).
// Aufruf: npm install @dicebear/core@9 @dicebear/collection@9 && node scripts/forscher-bilder.mjs
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
const basis = {style:['circle'], backgroundColor:['efe5d0'], eyes:['default'], eyebrows:['defaultNatural'], mouth:['smile'], clothingGraphic:[], };
const ROLLEN = {
  junior:{seed:'junior', top:['shortCurly'], hairColor:['2c1b18'], skinColor:['d08b5b'], clothing:['hoodie'], clothesColor:['5199e4'],
    accessoriesProbability:0, facialHairProbability:0},
  spezialist:{seed:'spezialist', top:['straight01'], hairColor:['724133'], skinColor:['edb98a'], clothing:['blazerAndShirt'], clothesColor:['25557c'],
    accessories:['round'], accessoriesColor:['262e33'], accessoriesProbability:100, facialHairProbability:0},
  experte:{seed:'experte', top:['sides'], hairColor:['e8e1e1'], skinColor:['ffdbb4'], clothing:['blazerAndSweater'], clothesColor:['3c4f5c'],
    accessories:['prescription02'], accessoriesColor:['262e33'], accessoriesProbability:100, facialHair:['beardMedium'], facialHairColor:['e8e1e1'], facialHairProbability:100}
};
const out = {};
for (const [k, o] of Object.entries(ROLLEN)){
  const svg = createAvatar(avataaars, {...basis, ...o}).toString();
  out[k] = svg;
}
// Ausgabe: JSON {junior, spezialist, experte}; in produktentwicklung.js werden die ids je Rolle eindeutig gemacht.
console.log(JSON.stringify(out));
