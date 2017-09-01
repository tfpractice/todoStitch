# MongoDB Stitch
[stitchWelcome]: static/images/stitchWelcome.png
[expansions]:https://docs.mongodb.com/stitch/reference/expansions/
[rules]:https://docs.mongodb.com/stitch/rules/mongodb-rules/
[operators]:https://docs.mongodb.com/manual/reference/operator/query/
[or]:https://docs.mongodb.com/manual/reference/operator/query/or/#op._S_or
[exists]:https://docs.mongodb.com/manual/reference/operator/query/exists/#op._S_exists
[readall]:https://docs.mongodb.com/stitch/rules/mongodb-rules-read/#mongodb-service-read-all-fields

As a developer, I enjoy finding new solutions to old problems, discussing code quality, and refactoring ad nauseam. I love almost everything about making apps. Everything but the setup. And apparently I'm not the only one. Within the React community alone boasts preponderance of boilerplate repos and single function libraries designed to help get you started as quickly as possible. But [Create React App](https://github.com/facebookincubator/create-react-app) cant do it all. Sometimes you need a backend, fast. And if you haven't the energy to wrangle a waterfall of Firebase callbacks, or retrain your brain for GraphQL, you'll be glad to know that MongoDB has joined the Backend-as-a-Service bandwagon, with its new product Stitch, and it's a benefit to us all.
 
In their own words 
 
> MongoDB Stitch lets developers focus on building applications rather than on managing data manipulation code, service integration, or backend infrastructure. Whether you’re just starting up and want a fully managed backend as a service, or you’re part of an enterprise and want to expose existing MongoDB data to new applications, Stitch lets you focus on building the app users want, not on writing boilerplate backend logic.
  

That last sentence was music to my ears. As I'm constantly experimenting with code, I've already come to appreciate mongoDB for it's quick uptake compared to its relational counterparts, and Stitch only makes things better. Stitch composes number of services (MongoDB Atlas, authentication, instant messaging, and more) to represent your application backend. 'Stitched' together in this way, this patchwork of services allow for a graceful, agile development process, useful at any stage. Stitch can add features to an existing application, selectively expose existing data to new applications, or be your complete backend. To introduce some of the benefits of Stitch, and demonstrate just how easy it is to get started, I've created this repository and will walk you through the development of a rather simple todo-list application.
 
# What we'll be building
This is a small CRUD-style app that uses MongoDB Stitch for the backend and React for the UI. Users will be able to Sign-in anonymously, view tasks, create new tasks, and edit/delete the tasks they create. In order to do this, we will use two of Stitch's services: the MongoDB service (powered by MongoDB's database-as-a-service, Atlas) and anonymous authentication. I'll walk you through setting up the project, connecting with an Atlas cluster, establishing database rules, and running the app. After that, feel free to fork this repo and add as many features as you like. Fair warning, this project is very minimal, and is likely not the prettiest thing you've ever built.
 
## Collection info
Each document in the `items` collection should be structured as follows
~~~js
{
   "_id" : <ObjectID>,
   "text" : <string>,      // ToDo item.
   "owner_id" : <string>,  // Corresponds to the user who created the task.
   "checked" : <boolean>   // Optional.  Only appears if user checks the item in the app.
}
~~~
And since our users will be anonymous, they will require little more than the default properties
   
# Setup
For this project, you'll need a MongoDB Atlas cluster using MongoDB version 3.4+. The tutorial uses an Atlas Free Tier cluster. They're exceedingly easy to setup and you can find instructions [here](https://docs.atlas.mongodb.com/getting-started/).
 
You'll need to create a new Stitch application to associate with your cluster. Atlas features an intuitive UI that guides you through creating a new Stitch app in under eight clicks. Then you'll be redirected to your console to setup a new collection and database client.

![stitchWelcome][stitchWelcome]
 
Enable anonymous authentication, and create a new `todo` database and `items` collection. From there you'll be presented with a number code samples to direct you in establishing a client. The Nodejs tab presents something to the effect of 
~~~js
const stitch = require("mongodb-stitch")
const client = new stitch.StitchClient('<YOUR-APP-ID>');
const db = client.service('mongodb', 'mongodb-atlas').db('<DATABASE>');
~~~
While this code is not yet useful for our app, it does show that you're more or less ready to start running your application. That easily! But before jumping in, there are a few database specific rules we need to establish.
 
# Rules and Validations
This app will primarily make use of the MongoDB Service. For this to work, we have to set up rules to control access to fields for read and write operations. When making various requests to your database, these rules determine which data will come back and how it can be manipulated.

If you're familiar with other BaaS platforms (e.g. FireBase, Apollo), this is conceptually identical, and the primary distinctions are syntactic. If a rule evaluates to true, read and write operations can access the fields for which the rule applies. If a rule evaluates to false, access is denied. More specifically,
> If a rule determines that a field is readable:
  Read and write operations can query on the field.
  Read operations can include the field in their results.
  
> If a rule determines that a field is not readable:
 Read and write operations cannot query on the field; query predicates on that field will not match any documents for read or write operations.
 Read operations will omit the field in their results.

These rules fall into two categories
 -  _Top Level Document_ , which apply to any and all fields in a document
 - _Field Specific Rules_, which apply to specific fields and their descendants

and can be specified as JSON documents
~~~js
{
  <field1>: <value1|expression1>,
  <field2>: <value2|expression2>,
  ...
} 
~~~
expressions can contain MongoDB query [expression operators][operators] (such as [$or][or] and [$exists][exists]), and special values called [expansions][expansions]. We'll be using `%user`,`%prev`, and `%prevRoot`
- `%user` refers to the user currently logged into the app.
- `%prev` refers to a previous field-value before it is changed by a write operation
- `%prevRoot` refers to a document referenced in a rules expression _before_ it is changed by a write operation.

## `todo.items` rules
Sensibly, the top level document read rules default to 
~~~js
{
  "owner_id": "%%user.id"
}
~~~ 
which only allows a client to read documents whose owner_id matches the ID of the current authenticated user. Because our `todo.items` collection allows everyone to read all items, we'll set this rule to an empty object `{}`, which allows read access to [all fields][readall]
   
The default top level write rule is identical. Since we only allow users to modify their own items, this sounds like it should work. But a quick glance at the [docs](https://docs.mongodb.com/stitch/rules/mongodb-rules-write/) specifies that
> the write operation must  __result__  in a document where the owner_id equals the user ID of the client issuing the write. If the value of owner_id does not match the client user ID, MongoDB Stitch blocks the write.

Even if a user owns an item, deleting it will result in no document at all. In a strange yet obvious way, this means that the default write rules will not work, and we need to edit it with some expansions.
~~~js
{
  "%or": [
    {
      "%%prevRoot.owner_id": "%%user.id"
    },
    {
      "%%prevRoot": {
        "%exists": 0
      }
    }
  ]
}
~~~
This means that a user can perform a write operation on a document if 
 - the document _prior to the operation_ was owned by the current  
 -  the document is newly inserted
 
Finally, we should add some field_specific validations to protect against invalid updates. 
  
## Validations
Validation rules apply to update and insert operations. If the update and insert operations do not pass the validation rule, MongoDB Stitch fails the operations.  We will apply a field specific validation to the `owner_id` field of our `items` collection. Its default declares an update or insert to be valid if the resulting document's `owner_id` field matches the current user or is no owner_id field existed at all.
~~~js
{
  "%or": [
    { "%%prev": "%%user.id" },
    { "%%prev": { "%exists": false } }
  ]
}
~~~
Having already established a similar top level rule, we simply need to ensure that users can only update or insert documents that they own/create, and disallow users from reassigning tasks. We do this by setting the rule to
 ~~~js
 "%%user.id"
 ~~~
You can learn more about rules and validations [here][rules], but with our database rules configured, we can now move on to our application!


# The Application
The application is pretty bare-bones, and should work out of the box. The `src` directory is composed mostly of react components, and files to connect with Stitch.

### Connecting with Stitch
All of the backend functionality is split into two modules, `dbClient.js`, and `queries.js`. `dbClient` contains code similar to what we saw during the setup stage of our application, and allows us to connect to our Stitch MongoDB service. First we set up our `APP_ID` and `baseUrl` 
~~~js
// src/dbClient.js

import { StitchClient, } from 'mongodb-stitch';

let appId = <YOUR-APP-ID>;

if (process.env.APP_ID) {
  appId = process.env.APP_ID;
}
let  options = {};

if (process.env.STITCH_URL) {
  options.baseUrl = process.env.STITCH_URL;
}
~~~
>To access MongoDB database and collection using the MongoDB service, use:
- The StitchClient.service() function to return an instance of MongoDB Stitch MongoDBService.
- The MongoDBService.db() function to returns a DB object.
- The DB.collection() function to return a Collection object.

Then initialize a new StitchClient and connect to our db and collections. This module also provides two helper functions to check authentication status
 ~~~js
 // src/dbClient.js

 export const stitchClient = new StitchClient(appId, options);
 export const db = stitchClient.service('mongodb', 'mongodb-atlas').db('todo');
 
 export const items = db.collection('items');
 export const users = db.collection('users');
 
 export const authID = () => stitchClient.authedId();
 export const isAuthed = () => !!authID();
 ~~~
### Querying the database
`queries.js` contains all of the relevant queries for operating on our items. If you're familiar with server side mongo, then after importing the `items` collection from `dbClient`, this should be a breeze. If not, here's a short explanation of the methods the application uses:
- `Collection.find` method to retrieve documents from MongoDB
- `Collection.insert` to create documents in MongoDB
- `Collection.updateOne` to update documents in MongoDB
- `Collection.deleteMany` to delete documents in MongoDB
 
~~~js
 // src/queries.js
 
 import { authID, items, stitchClient, } from './dbClient';

 export const logError = e => console.error(e.message);

 export const getItems = params => items.find(params).catch(logError);

 export const updateItem = (_id, checked) =>
   items.updateOne({ _id, }, { $set: { checked, }, }).catch(logError);

 export const insertItem = (text, owner_id = stitchClient.authedId()) =>
   items.insert([{ text, owner_id, }, ]).catch(logError);

 export const deleteChecked = () =>
   items.deleteMany({ checked: true, owner_id: authID(), }).catch(logError);

~~~
with a database connection and queries established and safely compartmentalized, our app is now ready to render.Next, we'll go over the primary components

## Components
 The primary components of this app are as follows
- `index`,  renders the app
- `home`, renders the list or the Sign-in link
- `authControls`, which houses 
- `list`, renders the actual items
- `todoItem`, renders individual items
- `checkPath`, renders a checked or empty box based on item status

### AuthControls
this component takes the stitchClient as a `Client` prop and renders either a Sign-in or Sign-out link based on the status of that property. Leveraging the anonymous authentication we established during setup, this component also provides login and logout methods
~~~js
// src/authControls.js

const AuthControls = ({ client, }) => {
  const authed = !!client.authedId();
  const logout = () => client.logout().then(() => location.reload());
  const login = () => client.login().then(() => location.reload());

  return (
    <div className="login-header">
      {authed
        ? <a className="logout" href="#" onClick={logout}>
            sign out
        </a>
        : <div className="login-links-panel">
          <h2>TODO</h2>
          <div onClick={login} className="signin-button">
            <span className="signin-button-text">Sign in Anonymously</span>
          </div>
        </div>}
    </div>
  );
};
~~~ 

### List
The List component is the only component with internal state, and  most heavily leverages our stitch client, making requests to create, update, and delete todo-items. The methods `loadList` and `loadMine` retrieve either all todo-items or those belonging to the current user, respectively
~~~js
// src/list.js

import { authID, isAuthed, } from './dbClient';
import { deleteChecked, getItems, insertItem, updateItem, } from './queries';

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

  loadMine() {
    isAuthed() &&
      getItems({ owner_id: authID(), }).then((items) => {
        this.setState({ items, requestPending: false, });
      });
  }
}
~~~

The `addItem`, `checkHandler`, and `clear` methods handle the insertion, updating, and deletion of documents, respectively

~~~js
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
~~~
  
Along with a field to create new items and a set of buttons to determine which items appear on screen and to clear the current users completed items, the List component renders the tasks themselves, represented by a `TodoItem`, and passes them each callbacks, scoped to the list with arrow functions.

~~~js
  render() {
    return (
      isAuthed() &&
      <div>
        <button onClick={() => this.loadMine()}>Show my items</button>
        <button onClick={() => this.loadList()}>Show all items</button>
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
  ~~~
### TodoItem
This component renders a task and its text. If the current user can updated the item (from our previously established rules), a checkbox appears beside the component. If the item is completed, it is greyed out and stricken through. A clickHandler uses the db queries from `quries.js` to update the item via stitch, and event handlers passed as props allow the list component to respond to these updates.

~~~js
const TodoItem = ({ item, onChange, onStartChange, }) => {
  const itemClass = item.checked ? 'done' : '';
  const canEdit = authID() === item.owner_id;
  const clicked = () => {
    canEdit &&
      Promise.resolve(onStartChange())
        .then(() => updateItem(item._id, !item.checked))
        .then(onChange);
  };

  return (
    <div className="todo-item-root">
      <label className="todo-item-container" onClick={clicked}>
        {canEdit && <CheckPath item={item} />}
        <span className={`todo-item-text ${itemClass}`}>
          {item.text}
        </span>
      </label>
    </div>
  );
};
~~~


# Conclusion
And that's our application. Using Stitch's mongoDB service, we successfully established a database connection without setting up a local connection or a ODM like Mongoose. With the Authentication service, we set up collection permissions and document relationships without having to manually configure and integrate an authorization system (e.g. Passport & its plethora of strategies). And We were able to focus on producing a clean, consistent, and secure React application.

[MongoDB Stitch](https://www.mongodb.com/cloud/stitch) is a wonderfully convenient tool for development teams any stage in their process, and I would highly recommend it for developers keen on experimentation. For more information on how it can be of use to you, check their site. I hope you found this tutorial useful, as I enjoyed walking you through it. Now that I have stitch, I'm off to rewrite some old projects.
