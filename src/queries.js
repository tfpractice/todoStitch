import { db, items, stitchClient, } from './dbClient';

export const logError = e => console.error(e.message);

export const getItems = () => items.find(null, null).catch(logError);

export const updateItem = (_id, checked) =>
  items.updateOne({ _id, }, { $set: { checked, }, }).catch(logError);

export const insertItem = (text, owner_id = stitchClient.authedId()) =>
  items.insert([{ text, owner_id, }, ]).catch(logError);

export const deleteChecked = () =>
  items.deleteMany({ checked: true, }).catch(logError);
