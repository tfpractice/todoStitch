import React from 'react';
import { render, } from 'react-dom';
import { StitchClient, } from 'mongodb-stitch';
import { browserHistory, Route, } from 'react-router';
import { BrowserRouter, Link, } from 'react-router-dom';

import { db, items, stitchClient, users, } from './dbClient';

const formatPhoneNum = (raw) => {
  const intl = number[1] === '+';
  let number = raw.replace(/\D/g, '');

  return intl ? `+${number}` : `+1${number}`;
};

const generateCode = (len) => {
  let text = '';
  const digits = '0123456789';

  for (let i = 0; i < len; i++) {
    text += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  return text;
};

const NumberConfirm = class extends React.Component {
  saveNumber(e) {
    if (e.keyCode == 13) {
      if (formatPhoneNum(this._number.value).length >= 10) {
        const code = generateCode(7);

        stitchClient
          .executePipeline([
            { action: 'literal', args: { items: [{ name: 'hi', }, ], }, },
            {
              service: 'tw1',
              action: 'send',
              args: {
                to: this._number.value,
                from: '%%values.ourNumber',
                body: `Your confirmation code is ${code}`,
              },
            },
          ])
          .then((data) => {
            users
              .updateOne(
                { _id: stitchClient.authedId(), number_status: 'unverified', },
                {
                  $set: {
                    phone_number: this._number.value,
                    number_status: 'pending',
                    verify_code: code,
                  },
                }
              )
              .then(() => {
                this.props.onSubmit();
              });
          })
          .catch((e) => {
            console.log(e);
          });
      }
    }
  }

  render() {
    return (
      <div>
        <div>Enter your phone number. We'll send you a text to confirm.</div>
        <input
          type="textbox"
          name="number"
          ref={(n) => {
            this._number = n;
          }}
          placeholder="number"
          onKeyDown={e => this.saveNumber(e)}
        />
      </div>
    );
  }
};

export default NumberConfirm;
