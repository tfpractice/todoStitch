import React from 'react';
import { db, items, stitchClient, users, } from './dbClient';
import TodoList from './list';
import AuthControls from './authControls';

const Home = () => {
  const authed = !!stitchClient.authedId();

  return (
    <div>
      <AuthControls client={stitchClient} />
      <TodoList />
    </div>
  );
};

export default Home;
