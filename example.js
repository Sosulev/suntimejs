/*
Расширение библиотеки dayjs. Расчет времени положения солнца под определенным углом

dayjs().sunTime(param)
Время в которое солце находится в под углом над горизонтом заданном в param

param = 'sun' возвращает объект {rise, set, length} - время воcхода, заката солнца а так же длительность светового дня в минутах
param = 'sunRise' возвращает объект - время воcхода, солнца
param = 'sunSet' возвращает объект - время заката, солнца

param = 'twilight' возвращает объект {rise, set, length} - время утренних и вечерних сумерек а так же длительность между сумерками в минутах
param = 'twilightRise' возвращает объект - время утренних сумерек
param = 'twilightSet' возвращает объект - время вечерних сумерек

param = degrees Возвращает объект {rise, set, length} - время наклона солнца над горизонтом по углом "degrees" а так же длительность дня

Установка:
>npm i suntimejs
*/

const dayjs = require('dayjs');
const latitude=53.87;     // Людиново
const longitude=34.44;    // Людиново
const suntimejs=require('suntimejs')
dayjs.extend(suntimejs, {latitude, longitude});
const now = dayjs();

console.log ('Sunrise in the city of Lyudinovo', now.sunTime('sunRise').format('DD.MM.YYYY HH:mm'));
console.log ('Sunset in the city of Lyudinovo', now.sunTime('sunSet').format('DD.MM.YYYY HH:mm'));
console.log ('Length of daylight (minute)', now.sunTime('sun').length);

console.log ('Morning twilight', now.sunTime('twilightRise').format('DD.MM.YYYY HH:mm'));
console.log ('Evening Twilight', now.sunTime('twilightSet').format('DD.MM.YYYY HH:mm'));

const {rise, set} = now.sunTime(3)
console.log ('Time in the morning, at a sun angle of 3 degrees', rise.format('DD.MM.YYYY HH:mm'));
console.log ('Time in the evening, with a sun angle of 3 degrees', set.format('DD.MM.YYYY HH:mm'));

const {azimuth, altitude} = now.sunPositions()
console.log ('Azimuth now', azimuth);
console.log ('Altitude now', altitude);
