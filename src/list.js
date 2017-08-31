import React from 'react';
import { authID, isAuthed, } from './dbClient';
import { deleteChecked, getItems, insertItem, updateItem, } from './queries';
import TodoItem from './todoItem';

class TodoList extends React.Component {
  constructor(props) {
    super(props);

    this.state = { items: [], };
  }

  componentWillMount() {
    this.loadList();
  }

  componentDidMount() {
    this.loadList();
  }

  loadList() {
    isAuthed() &&
      getItems().then((items) => {
        this.setState({ items, requestPending: false, });
      });
  }

  checkHandler(id, status) {
    updateItem(id, status).then(() => this.loadList(), { rule: 'checked', });
  }

  addItem(event) {
    if (event.keyCode != 13) {
      return;
    }
    const text = event.target.value;

    this.setState({ requestPending: true, }, () =>
      insertItem(text, authID()).then(() => {
        this._newitem.value = '';
        this.loadList();
      })
    );
  }

  clear() {
    this.setState({ requestPending: true, }, () =>
      deleteChecked().then(() => this.loadList())
    );
  }

  setPending() {
    this.setState({ requestPending: true, });
  }

  render() {
    return (
      isAuthed() &&
      <div>
        <div className="controls">
          <input
            type="text"
            className="new-item"
            placeholder="add a new item..."
            ref={n => (this._newitem = n)}
            onKeyDown={e => this.addItem(e)}
          />
          {this.state.items.filter(x => x.checked).length > 0 &&
            <div
              href=""
              className="cleanup-button"
              onClick={() => this.clear()}
            >
              clean up
            </div>}
        </div>
        <ul className="items-list">
          {this.state.items.length == 0
            ? <div className="list-empty-label">empty list.</div>
            : [ ...this.state.items, ].map(item =>
              <TodoItem
                key={item._id.toString()}
                item={item}
                onChange={() => this.loadList()}
                onStartChange={() => this.setPending()}
              />
            )}
        </ul>
      </div>
    );
  }
}

export default TodoList;
