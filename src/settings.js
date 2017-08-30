import React from 'react';
import { render, } from 'react-dom';
import { StitchClient, } from 'mongodb-stitch';
import { browserHistory, Route, } from 'react-router';
import { BrowserRouter, Link, } from 'react-router-dom';

import { db, items, stitchClient, users, } from './dbClient';

import AwaitVerifyCode from './verify';
import NumberConfirm from './number';

function initUserInfo() {
  return users.updateOne(
    { _id: stitchClient.authedId(), },
    { $setOnInsert: { phone_number: '', number_status: 'unverified', }, },
    { upsert: true, }
  );
}
const Settings = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, };
  }

  loadUser() {
    users.find({}, null).then((data) => {
      if (data.length > 0) {
        this.setState({ user: data[0], });
      }
    });
  }

  componentWillMount() {
    initUserInfo().then(() => this.loadUser());
  }

  render() {
    return (
      <div>
        <Link to="/">Lists</Link>
        {((u) => {
          if (u != null) {
            if (u.number_status === 'pending') {
              return <AwaitVerifyCode onSubmit={() => this.loadUser()} />;
            } else if (u.number_status === 'unverified') {
              return <NumberConfirm onSubmit={() => this.loadUser()} />;
            } else if (u.number_status === 'verified') {
              return (
                <div
                >{`Your number is verified, and it's ${u.phone_number}`}</div>
              );
            }
          }
        })(this.state.user)}
      </div>
    );
  }
};

export default Settings;
