import React from 'react';
import { items, stitchClient, } from './dbClient';
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
    const authed = !!stitchClient.authedId();

    console.log('stitchClient.authedId()', stitchClient.authedId());
    if (!authed) {
      return;
    }

    const obj = this;

    items.find(null, null).then((data) => {
      this.setState({ items: data, requestPending: false, });
    });
  }

  checkHandler(id, status) {
    items.updateOne({ _id: id, }, { $set: { checked: status, }, }).then(() => {
      this.loadList();
    }, { rule: 'checked', });
  }

  addItem(event) {
    if (event.keyCode != 13) {
      return;
    }

    this.setState({ requestPending: true, });
    items
      .insert([{ text: event.target.value, owner_id: stitchClient.authedId(), }, ])
      .then(() => {
        this._newitem.value = '';
        this.loadList();
      });
  }

  clear() {
    this.setState({ requestPending: true, });
    items.deleteMany({ checked: true, }).then(() => {
      this.loadList();
    });
  }

  setPending() {
    this.setState({ requestPending: true, });
  }

  render() {
    const loggedInResult = (
      <div>
        <div className="controls">
          <input
            type="text"
            className="new-item"
            placeholder="add a new item..."
            ref={(n) => {
              this._newitem = n;
            }}
            onKeyDown={e => this.addItem(e)}
          />
          {this.state.items.filter(x => x.checked).length > 0
            ? <div
              href=""
              className="cleanup-button"
              onClick={() => this.clear()}
            >
                clean up
            </div>
            : null}
        </div>
        <ul className="items-list">
          {this.state.items.length == 0
            ? <div className="list-empty-label">empty list.</div>
            : this.state.items.map(item =>
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

    return stitchClient.authedId() ? loggedInResult : null;
  }
}

export default TodoList;
