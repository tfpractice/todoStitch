import React from 'react';
import { render, } from 'react-dom';
import { StitchClient, } from 'mongodb-stitch';
import { browserHistory, Route, } from 'react-router';
import { BrowserRouter, Link, } from 'react-router-dom';

import { db, items, stitchClient, users, } from './dbClient';

const AwaitVerifyCode = class extends React.Component {
  checkCode(e) {
    const obj = this;

    if (e.keyCode == 13) {
      users
        .updateOne(
          { _id: stitchClient.authedId(), verify_code: this._code.value, },
          { $set: { number_status: 'verified', }, }
        )
        .then((data) => {
          obj.props.onSubmit();
        });
    }
  }

  render() {
    return (
      <div>
        <h3>Enter the code that you received via text:</h3>
        <input
          type="textbox"
          name="code"
          ref={(n) => {
            this._code = n;
          }}
          placeholder="verify code"
          onKeyDown={e => this.checkCode(e)}
        />
      </div>
    );
  }
};

export default AwaitVerifyCode;
