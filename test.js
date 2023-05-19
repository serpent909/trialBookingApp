const moment = require('moment');


let originalStartTime = '2023-05-01T15:30:00.000'
let newStartTime = moment(originalStartTime).subtract(30, 'minutes').format('YYYY-MM-DDTHH:mm:ss');

console.log(newStartTime)