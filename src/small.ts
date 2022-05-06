export interface chat {
  "sender": {
    "userId": string;
    "linkId"?: number;
    "openToken": number;
    "perm": number;
    "userType": number;
    "nickname": string;
    "profileURL": string;
    "fullProfileURL": string;
    "originalProfileURL": string;
  },
  "chat": {
    "type": number;
    "logId": string;
    "prevLogId": string;
    "sender": { "userId": string; },
    "sendAt": number;
    "messageId": number;
    "text": string | null;
  },
  "room": string;
  "_id": string;
  "timestamp": string;
}

import trade from './trade.json';
export const chats = trade as chat[];