import React from 'react';
import { render, } from 'react-dom';
import { browserHistory, Route, } from 'react-router';
import { BrowserRouter, } from 'react-router-dom';

import Home from './home';

require('../static/todo.scss');

render(
  <BrowserRouter>
    <Route exact path="/" component={Home} />
  </BrowserRouter>,
  document.getElementById('app')
);
