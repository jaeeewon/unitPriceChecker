import tr1 from './거래방 1 후.json';
import tr2 from './거래방 2 후.json';
import fs from 'fs';

interface tr {
    "asset": string;
    "type": string;
    "unitPrice": number;
    "date": string;
}

const feebuy: tr[] = [];
const feesell: tr[] = [];
const TIME_BUY: { [key: string]: any } = {};
const TIME_SELL: { [key: string]: any } = {};

const average = (array: number[]) => array.reduce((a: number, b: number) => a + b) / array.length;

[...tr1, ...tr2].map((t) => {
    if (t.asset === 'FEE') {
        if (t.type === 'BUY') {
            if (!TIME_BUY[t.date]) {
                TIME_BUY[t.date] = [];
            }
            TIME_BUY[t.date] = [...TIME_BUY[t.date], t];
        } else {
            if (!TIME_SELL[t.date]) {
                TIME_SELL[t.date] = [];
            }
            TIME_SELL[t.date] = [...TIME_SELL[t.date], t];
        }
    } else {
        if (t.type === 'BUY') {
            feebuy.push(t)
        } else {
            feesell.push(t)
        }
    }
});
// timebuy.map((a: any) => new Date(a.date).getTime()).sort().map((b: any) => {
//     TIME_BUY[new Date(b).toDateString()] = timebuy[new Date(b).toDateString()]
//     console.log(b)
// })

// const TIME = average(time.map((a: any) => a.unitPrice));
// const FEE = average(fee.map((a: any) => a.unitPrice));

// console.log({ FEE, TIME });

// const time0: { [key: string]: any } = {};
// time.map((t) => {
//     if (!time0[t.date]) {
//         time0[t.date] = [];
//     }
//     time0[t.date] = [...time0[t.date], t]
// });

// const TIME: { [key: string]: any } = {};
// Object.keys(time0).map((a: any) => new Date(a).getTime()).sort().map((b) => new Date(b).toDateString()).map((c: any) => {
//     TIME[c] = { av_unit_price: time0[c] };
//     const buy = time0[c].map((b: any) => {
//         return
//     })
// });
// const TIME = Object.keys(time0).map(t => { return { av_unit_price: { sell: average(time0[t].filter((x: any) => x.type === 'SELL')), buy: average(time0[t].filter((x: any) => x.type === 'BUY')) } } });

// const time1: { [key: string]: any } = {};
// TIME.map((t) => {
//     time1.
// })

// console.log(TIME);

Object.keys(TIME_BUY).map((k: any) => {
    TIME_BUY[k] = average(TIME_BUY[k].map((ac: any) => ac.unitPrice));
});

Object.keys(TIME_SELL).map((k: any) => {
    TIME_SELL[k] = average(TIME_SELL[k].map((ac: any) => ac.unitPrice));
});



const tbEnd: { [key: string]: any } = {};


Object.keys(TIME_BUY).map((b) => new Date(b).getTime()).sort().map((b) => new Date(b).toDateString()).map((bb) => tbEnd[bb] = { av_unit_price: { sell: TIME_SELL[bb], buy: TIME_BUY[bb] } })

// Object.keys(TIME_BUY).map((a) => new Date(a).getTime()).sort
fs.writeFileSync('./src/FEE.json', JSON.stringify(tbEnd, null, 1));