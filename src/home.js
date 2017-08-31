import React from 'react';
import { stitchClient, } from './dbClient';
import TodoList from './list';
import AuthControls from './authControls';

const Home = () =>
  <div>
    <AuthControls client={stitchClient} />
    <TodoList />
  </div>;

export default Home;
