import React from 'react';
import { authID, db, items, stitchClient, users, } from './dbClient';
import { deleteChecked, getItems, insertItem, updateItem, } from './queries';
import CheckPath from './checkPath';

const TodoItem = ({ item, onChange, onStartChange, }) => {
  const itemClass = item.checked ? 'done' : '';
  const canEdit = authID() === item.owner_id;
  const clicked = () => {
    canEdit &&
      Promise.resolve(onStartChange())
        .then(() => updateItem(item._id, !item.checked))
        .then(onChange);
  };

  return (
    <div className="todo-item-root">
      <label className="todo-item-container" onClick={clicked}>
        {canEdit && <CheckPath item={item} />}
        <span className={`todo-item-text ${itemClass}`}>
          {item.text}
        </span>
      </label>
    </div>
  );
};

export default TodoItem;
