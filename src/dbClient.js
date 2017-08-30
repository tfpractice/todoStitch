import { StitchClient, } from 'mongodb-stitch';

let appId = process.env.TFP_TODO_STITCH_APP_ID;

if (process.env.APP_ID) {
  appId = process.env.APP_ID;
}

const options = {};

if (process.env.STITCH_URL) {
  options.baseUrl = process.env.STITCH_URL;
}

export const stitchClient = new StitchClient(appId, options);
export const db = stitchClient.service('mongodb', 'mongodb-atlas').db('todo');
export const items = db.collection('items');
export const users = db.collection('users');
export const isAuthed = () => !!stitchClient.authedId();
