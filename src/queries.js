import { authID, db, items, stitchClient, } from './dbClient';

export const logError = e => console.error(e.message);

export const getItems = params => items.find(params).catch(logError);

export const updateItem = (_id, checked) =>
  items.updateOne({ _id, }, { $set: { checked, }, }).catch(logError);

export const insertItem = (text, owner_id = stitchClient.authedId()) =>
  items.insert([{ text, owner_id, }, ]).catch(logError);

export const deleteChecked = () =>
  items.deleteMany({ checked: true, owner_id: authID(), }).catch(logError);

export const isChecked = item => item.checked;

export const compareUsers = (a, b) => a.owner_id - b.owner_id;
