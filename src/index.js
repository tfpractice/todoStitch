import React from 'react';
import { render, } from 'react-dom';
import { StitchClient, } from 'mongodb-stitch';
import { browserHistory, Route, } from 'react-router';
import { BrowserRouter, Link, } from 'react-router-dom';

import { db, items, stitchClient, users, } from './dbClient';
import TodoItem from './todoItem';
import TodoList from './list';
import Settings from './settings';
import AuthControls from './authControls';

require('../static/todo.scss');

const Home = function() {
  const authed = !!stitchClient.authedId();

  return (
    <div>
      <AuthControls client={stitchClient} />
      <TodoList />
    </div>
  );
};

render(
  <BrowserRouter>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/settings" component={Settings} />
    </div>
  </BrowserRouter>,
  document.getElementById('app')
);
