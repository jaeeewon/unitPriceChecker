import { info } from 'console';
import fs from 'fs';
import { chat, chats } from './small';

const FILTER_KEYWORD = "💰";
const SELL_KEYWORD = `${FILTER_KEYWORD}SELL`;
const BUY_KEYWORD = `${FILTER_KEYWORD}BUY`;
const TIME_ASSET_NAME /*: "'τ'"*/ = "'τ'";
const FEE_ASSET_NAME /*: "'Φ'"*/ = "'Φ'";

type buySellType = 999 | 100 | 0 | 1 | 400;
type buySellString = "UNKNOWN" | "COEXIST" | "SELL" | "BUY" | "ERROR";
type knownBuySellTypeType = { [key in buySellString]: buySellType };

const knownBuySellType: knownBuySellTypeType = {
    "UNKNOWN": 999,
    "COEXIST": 100,
    "SELL": 0,
    "BUY": 1,
    "ERROR": 400
};

type AssetsType = 999 | 100 | 0 | 1 | 400;
type AssetsString = "UNKNOWN" | "COEXIST" | "TIME" | "FEE" | "ERROR";
type knownAssetsTypeType = { [key in AssetsString]: AssetsType };

const knownAssetsType: knownAssetsTypeType = {
    "UNKNOWN": 999,
    "COEXIST": 100,
    "TIME": 0,
    "FEE": 1,
    "ERROR": 400
};


// type AssetsName = typeof TIME_ASSET_NAME | typeof FEE_ASSET_NAME;
type AssetsNameString = "TIME" | "FEE";
// type knownAssetNameType = { [key in AssetsNameString]: AssetsName };
// const knownAssetName: knownAssetNameType = {
//     "TIME": TIME_ASSET_NAME,
//     "FEE": FEE_ASSET_NAME
// };

const appropriatePrice: { [key in AssetsNameString]: [number, number] } = { "TIME": [6, 20], "FEE": [0.05, 0.55] };

function determineAppropriatePrice(type: AssetsNameString, unitPrice: number): boolean {
    const [less, big] = appropriatePrice[type];
    if (less <= unitPrice && unitPrice <= big) {
        return true;
    } else {
        return false;
    }
}

function replaceNormal(text: string) {
    return text
        // 한글과 겹치는 숫자
        .replace(/1대1|일대일|일괄|금일|휴일|일걸|일단|일은|제일|내일|요일|일반/g, "") // 1
        .replace(/아이디|이상|톡이|없이|이요|이상|이하|이력|이면|사이/g, "") // 2
        .replace(/주삼/g, "") // 3
        .replace(/프사|무사고|사기|사절|사담|감사|사진|사봅|사볼/g, "") // 4
        .replace(/오오/g, "") // 5
        .replace(/육육/g, "") // 6
        .replace(/칠칠/g, "") // 7
        .replace(/팔팔/g, "") // 8
        .replace(/많구/g, "") // 9
        .replace(/십십/g, "") // 10
        .replace(/1 v\/s1|오픈|일대|1:1|-|:|,|\n|\\n|오픈/g, "") // 잡

        // 소수점 복구
        .replace(/\./g, "?")
        .replace(/[0-9]\?[0-9]/g, (match: string, text: number, href: string) => match.replace('?', '.'))

        // 만 단위 복구
        .replace(/[0-9]만[0-9]/g, (match: string, text: number, href: string) => match.replace("만", ""))

        // 천 단위 복구
        .replace(/[0-9]천[0-9]/g, (match: string, text: number, href: string) => match.replace("천", ""))

        // 백 단위 복구
        .replace(/[0-9]백[0-9]/g, (match: string, text: number, href: string) => match.replace("백", ""))

        // 십 단위 복구
        .replace(/[0-9]십[0-9]/g, (match: string, text: number, href: string) => match.replace("십", ""))
        // 단위 복구로 인해 1181 => 1185로 증가

        // 띄우는 한글 숫자
        .replace(/ 만/g, "10000")
        .replace(/ 천/g, "1000")
        .replace(/ 백/g, "100")
        .replace(/ 십/g, "10")
        .replace(/ /g, "")



        // 매수 매도 및 숫자와 겹치는 경우 먼저 변경
        .replace(/매도|판매|판|팔아|팔고|팔려|팝|급매|매매|팜|사실/g, SELL_KEYWORD)
        .replace(/삽|살|구매|구입|구해|구하|구합|사요|사여|사봐|사보|사고|매수|매입/g, BUY_KEYWORD)

        // 한글 숫자
        .replace(/만/g, "0000")
        .replace(/천/g, "000")
        .replace(/백/g, "00")
        .replace(/십/g, "0")
        .replace(/일/g, "1")
        .replace(/이/g, "2")
        .replace(/삼/g, "3")
        .replace(/사/g, "4")
        .replace(/오/g, "5")
        .replace(/육/g, "6")
        .replace(/칠/g, "7")
        .replace(/팔/g, "8")
        .replace(/구/g, "9")
        .replace(/십/g, "10")

        // 자산 종류
        .replace(/타임|time/gi, TIME_ASSET_NAME)
        .replace(/피|퓌|fee/gi, FEE_ASSET_NAME)
}


function buySellTypeToString(type: buySellType): buySellString {
    let buySellTypeString: buySellString = 'UNKNOWN';
    (Object.keys(knownBuySellType) as buySellString[]).map((key: buySellString) => {
        if (knownBuySellType[key] == type) {
            buySellTypeString = key;
        }
    }
    );
    return buySellTypeString;
}

function AssetTypeToString(type: AssetsType): AssetsString {
    let AssetTypeString: AssetsString = 'UNKNOWN';
    (Object.keys(knownAssetsType) as AssetsString[]).map((key: AssetsString) => {
        if (knownAssetsType[key] == type) {
            AssetTypeString = key;
        }
    }
    );
    return AssetTypeString;
}

function checkTimes(TEXT: string, Keyword: string): number {
    const REG = new RegExp(Keyword, 'g');
    const REPL = TEXT.replace(REG, '');
    return (TEXT.length - REPL.length) / Keyword.length;
}

function determineType(text: string): buySellType {
    if (!text.includes(FILTER_KEYWORD)) {
        return knownBuySellType.UNKNOWN;
    }

    const isSell = text.includes(SELL_KEYWORD);
    const isBuy = text.includes(BUY_KEYWORD);

    if (isSell && isBuy) {
        // 매수 매도 포함 수를 판단해서 한 번 더 필터링
        const buyTimes = checkTimes(text, BUY_KEYWORD);
        const sellTimes = checkTimes(text, SELL_KEYWORD);
        if (buyTimes === sellTimes) {
            // 한 번 더 필터링 했지만 동일할 경우 그냥 COEXIST로 리턴
            return knownBuySellType.COEXIST;
        } else if (buyTimes > sellTimes) {
            return knownBuySellType.BUY;
        } else if (buyTimes < sellTimes) {
            return knownBuySellType.SELL;
        } else {
            return knownBuySellType.ERROR
        }
    } else if (isSell && !isBuy) {
        return knownBuySellType.SELL;
    } else if (!isSell && isBuy) {
        return knownBuySellType.BUY;
    } else {
        console.log('ERROR! "', text, '"Required to change FILTER_KEYWORD', FILTER_KEYWORD);
        return knownBuySellType.ERROR;
    }
};

function determineAssetType(text: string): AssetsType {
    if (!text.includes(TIME_ASSET_NAME) && !text.includes(FEE_ASSET_NAME)) {
        return knownAssetsType.UNKNOWN;
    }

    const isTime = text.includes(TIME_ASSET_NAME);
    const isFee = text.includes(FEE_ASSET_NAME);

    if (isTime && isFee) {
        return knownAssetsType.COEXIST;
    } else if (isTime && !isFee) {
        return knownAssetsType.TIME;
    } else if (!isTime && isFee) {
        return knownAssetsType.FEE;
    } else {
        return knownAssetsType.ERROR;
    }
}

interface List {
    asset: string;
    unitPrice: number | null;
    type: string;
    date: string;
}

const List = [] as List[];
let c1 = 0;
let c2 = 0;
let c3 = 0;
let conditionOK = 0;

const testObject: chat[] = [{
    "sender": {
        "userId": "9190823607574453274",
        "linkId": 199773979,
        "openToken": 1642681342,
        "perm": 2,
        "userType": 1000,
        "nickname": "콜드월렛",
        "profileURL": "https://open.kakaocdn.net/dn/JevQr/wmIKoAlNdv/3543qM0My7SEo0rtIacszK/img_s.jpg",
        "fullProfileURL": "https://open.kakaocdn.net/dn/JevQr/wmIKoAlNdv/3543qM0My7SEo0rtIacszK/img_l.jpg",
        "originalProfileURL": "https://open.kakaocdn.net/dn/JevQr/wmIKoAlNdv/3543qM0My7SEo0rtIacszK/img.jpg"
    },
    "chat": {
        "type": 1,
        "logId": "2775211828606652416",
        "prevLogId": "2775176940142712833",
        "sender": {
            "userId": "9190823607574453274"
        },
        "sendAt": 1651768230000,
        "messageId": 353382671,
        "text": "FEE 팝니다\n수량 145만개\n금액 14만원\n오픈톡 주세요"
    },
    "room": "타임스토프 한국 거래방 2",
    "_id": "6273fba689615401207e01a9",
    "timestamp": "2022-05-05T16:30:30.682Z"
}];

chats.map((chat: chat) => {
    if (!chat.chat.text || chat.sender.perm === 8 || chat.chat.type !== 1) return; // 채팅 조건이 안 맞으면 리턴
    const text = chat.chat.text;
    const proc = replaceNormal(text); // 필요 없는 거 지우고 한글을 숫자로 변경

    if (!/\d/.test(proc)) return; // 숫자가 없는 경우 리턴

    const textBuySell: buySellType = determineType(proc);
    const textAsset: AssetsType = determineAssetType(proc);
    if ([knownBuySellType.ERROR, knownBuySellType.UNKNOWN].includes(textBuySell) || [knownAssetsType.ERROR, knownAssetsType.UNKNOWN].includes(textAsset)) {
        return;
    }
    conditionOK++

    const extractNumber = (proc.match(/[\d\.]+/g) || []) // 숫자만 뽑는데, type safe를 위해 array
        .filter((reg: string) => ![".", ".."].includes(reg) && ![0].includes(parseFloat(reg)) && !reg.startsWith('010')).map((num: string) => parseFloat(num)).sort();

    // console.log(AssetTypeToString(textAsset), buySellTypeToString(textBuySell), extractNumber, proc);
    // console.log({ asset: AssetTypeToString(textAsset), type: buySellTypeToString(textBuySell), numbers: extractNumber })

    // interface info { [key: string]: string | number }
    // const info: info = {};

    const assetName = AssetTypeToString(textAsset);
    if (!["TIME", "FEE"].includes(assetName)) {
        return;
    }
    const date = new Date(chat.timestamp).toDateString();



    switch (extractNumber.length) {
        case 1: {
            const isOK = determineAppropriatePrice(assetName as AssetsNameString, extractNumber[0]);
            if (!isOK) {
                return;
            }
            c1++;
            return List.push({ asset: AssetTypeToString(textAsset), type: buySellTypeToString(textBuySell), unitPrice: extractNumber[0], date });
        }
        case 2: {
            const min = Math.min(extractNumber[0], extractNumber[1]);
            const max = Math.max(extractNumber[0], extractNumber[1]);
            const big = determineAppropriatePrice(assetName as AssetsNameString, max);
            const sml = determineAppropriatePrice(assetName as AssetsNameString, min);
            let unitPrice = 0;
            if (big && !sml) {
                unitPrice = max
            } else if (!big && sml) {
                unitPrice = min
            } else if (determineAppropriatePrice(assetName as AssetsNameString, max / min)) {
                // 해당 필터링 추가로 982 => 1171로 증가함
                unitPrice = parseFloat((max / min).toFixed(2));
            } else if (determineAppropriatePrice(assetName as AssetsNameString, min / max)) {
                // 해당 필터링 추가로 1171 => 1182 증가함
                unitPrice = parseFloat((min / max).toFixed(2));
            } else {
                return console.log(extractNumber, text, proc)
            }
            c2++;
            return List.push({ asset: assetName, type: buySellTypeToString(textBuySell), unitPrice, date });
        }
        case 3: {
            const first = extractNumber[0];
            const second = extractNumber[1];
            const third = extractNumber[2];
            const max = Math.max(first, second, third);
            const rnd = extractNumber[Math.floor(extractNumber.length / 2)];
            const min = Math.min(first, second, third);
            const big = determineAppropriatePrice(assetName as AssetsNameString, max);
            const rod = determineAppropriatePrice(assetName as AssetsNameString, rnd);
            const sml = determineAppropriatePrice(assetName as AssetsNameString, min);
            let unitPrice = 0;
            if (big && !rod && !sml) {
                unitPrice = max
            } else if (!big && rod && !sml) {
                unitPrice = rnd
            } else if (!big && !rod && sml) {
                unitPrice = min
            } else {
                return
            }
            c3++;
            return List.push({ asset: assetName, type: buySellTypeToString(textBuySell), unitPrice, date });
        }
    }
})

console.log({ c1, c2, c3, all: conditionOK, div: c1 + c2 + c3, percent: (c1 + c2 + c3) / conditionOK * 100 });
// fs.writeFileSync('./src/end.json', JSON.stringify(List, null, 1));