import React from 'react';
import { render, } from 'react-dom';
import { StitchClient, } from 'mongodb-stitch';
import { browserHistory, Route, } from 'react-router';
import { BrowserRouter, Link, } from 'react-router-dom';

import { db, items, stitchClient, users, } from './dbClient';

import Settings from './settings';

import Home from './home';

require('../static/todo.scss');

render(
  <BrowserRouter>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/settings" component={Settings} />
    </div>
  </BrowserRouter>,
  document.getElementById('app')
);
