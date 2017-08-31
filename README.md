# MongoDB Stitch
[stitchWelcome]: static/images/stitchWelcome.png
[expansions]:https://docs.mongodb.com/stitch/reference/expansions/
[rules]:https://docs.mongodb.com/stitch/rules/mongodb-rules/
[operators]:https://docs.mongodb.com/manual/reference/operator/query/
[or]:https://docs.mongodb.com/manual/reference/operator/query/or/#op._S_or
[exists]:https://docs.mongodb.com/manual/reference/operator/query/exists/#op._S_exists
[readall]:https://docs.mongodb.com/stitch/rules/mongodb-rules-read/#mongodb-service-read-all-fields

I enjoy programming for the sake of programming. I have repos solving the same problem in multiple languages using multiple tools and techniques, I can talk for hours about code quality, and the pleasures of refactoring. What I'm really trying to say is that I love code, almost to an absurd degree. What I don't love, however, is the setup. And apparently I'm not alone. Within the React community there's a preponderance of boilerplate repos and single function libraries, all geared toward developers who want to experiment, or just get something on the screen. But create-react-app cant do it all. Sometimes you need data, fast. And if you haven't the time or energy to wrangle the waterfall of firebase callbacks, or retrain your brain for GraphQL, you'll be glad to know that one of the JS communities most popular databases, MongoDB, has joined the Backend-as-a-Service bandwagon, and it's pretty awesome.
 
In their own words 
 
> MongoDB Stitch lets developers focus on building applications rather than on managing data manipulation code, service integration, or backend infrastructure. Whether you’re just starting up and want a fully managed backend as a service, or you’re part of an enterprise and want to expose existing MongoDB data to new applications, Stitch lets you focus on building the app users want, not on writing boilerplate backend logic.
  

That last sentence was music to my ears. As I'm constantly experimenting with code, I've already come to appreciate mongoDB for it's quick uptake compared to its relational counterparts, and Stitch only makes things better. I've created this small todo-list application, to introduce some of the benefits of Stitch, and demonstrate just how easy it is to get started.
 
# What we'll be building
This is a small CRUD-style application that uses MondoDB Stitch for the backend and React for the UI. Users will be able to Sign-in anonymously (the best!), create new tasks, and edit/delete the tasks they create. Excluding the boilerplate (ugh!) config files, this project's `src` directory consists almost entirely of react components and two files dedicated to the backend. This project is very minimal, so fair warning, it's pretty ugly.
 
## Collection info
Each document in the `items` collection should be structured as follows
~~~js
{
   "_id" : <ObjectID>,
   "text" : <string>,      // ToDo item.
   "owner_id" : <string>,  // Corresponds to the user logged into the app.
   "checked" : <boolean>   // Optional.  Only appears if user checks the item in the app.
}
~~~
And since our users will be anonymous, they will require little more than the default properties
   
# Setup
For this project, you'll need a MongoDB Atlas cluster using MongoDB version 3.4+. The tutorial uses an Atlas Free Tier cluster. They're exceedingly easy to setup, you can find instructions here.
 
You'll need to create a new Stitch application to associate with your cluster. Atlas features an intuitive UI that walks you through creating a new stitch application in under eight clicks. Then you'll be redirected to your console to setup a new collection and database client.

![stitchWelcome][stitchWelcome]
 
Enable anonymous authentication, and create a new `todo` database and `items` collection. From there you'll be presented with a number code samples to direct you in establishing a client. While this code is not exactly useful for our app, it does show that you're more or less ready to start running your application. That easily! But before jumping in, there are a few database specific rules we need to establish.
 
# Rules, Validations and Filters
> For a MongoDB Service, you have to set up rules to control access to fields for read and write operations.
  
When making various requests to your database, these rules determine which data will come back and how it can be manipulated. If you're familiar with other BaaS platforms like FireBase or Apollo, this is conceptually identical, and the primary distinctions are syntactic. If a rule evaluates to true, read and write operation can access the fields for which the rule applies. If a rule evaluates to false, access is denied. More specifically,
> If a rule determines that a field is readable:
  Read and write operations can query on the field.
  Read operations can include the field in their results.
  
> If a rule determines that a field is not readable:
 Read and write operations cannot query on the field; query predicates on that field will not match any documents for read or write operations.
 Read operations will omit the field in their results.

And these rules fall into two categories
 -  _Top Level Document_ apply to any and all fields in a document
 - _Field Specific Rules_ apply to specific fields and their descendants

and can be specified as JSON documents
~~~js
{
  <field1>: <value1|expression1>,
  <field2>: <value2|expression2>,
  ...
} 
~~~
expressions can contain MongoDB query expression [operators][operators] (such as [$or][or] and [$exists][exists]), and special values called [expansions][expansions]. We'll be using `%user`,`%prev`, and `%prevRoot`
- `%user` refers to the user currently logged into the app.
- `%prev` refers to a previous field-value before it is changed by a write operation
- `%prevRoot` refers to a document referenced in a rules expression _before_ it is changed by a write operation.

## `todo.items` rules
Sensibly, the top level read rules default to 
~~~js
{
  "owner_id": "%%user.id"
}
~~~ 
which only allows a client to read documents whose owner_id matches the ID of the current authenticated user. Because our `todo.items` collection allows everyone to read all items, we'll set the Top Level Document read rule to an empty object `{}`, which allows read access to [all fields][readall]
   
The default write rule is identical, and 
since we only allow users to modify their own items, this sounds like it should work. But a quick glance at the docs specifies that
> the write operation must __result__ in a document where the owner_id equals the user ID of the client issuing the write. If the value of owner_id does not match the client user ID, MongoDB Stitch blocks the write.

Even if a user owns an item, deleting it will result in no document at all. So in a strange yet obvious way, the default write rules will not work, and we need to edit the write rules with some expansions.
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
 Having already established a similar Top Level Rule, we simply need to ensure that users can only update or insert documents that they own/create. and set the validation to 
 ~~~js
 "%%user.id"
 ~~~

You can learn more about rules and validations [here][rules], but with our database rules configured, we can now move on to our application!


# The Application
The application is pretty bare-bones, and should work out of the box. The `src` directory is composed mostly of react components, and files to connect with Stitch.

## connecting with Stitch
All of the backend functionality is split into two modules, `dbClient`, and `queries`. `dbClient` contains code similar to what we saw during the setup stage of our application, and allows us to connect to our Stitch MongoDB service. First we set up our APP_ID and baseUrl 
~~~js
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

 Then initialize a new StitchClient and connect to our db and collections
 ~~~js
 export const stitchClient = new StitchClient(appId, options);
 export const db = stitchClient.service('mongodb', 'mongodb-atlas').db('todo');
 export const items = db.collection('items');
 export const users = db.collection('users');
 ~~~
 
 
 `queries.js` contains all of the relevant queries for operating on our items. If you're familiar with server side mongo, then after importing the `items` collection from `dbClient`, this should be a breeze. 
 
 
 ~~~js
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

## components
 The primary components of this app are as follows
- `index`,  renders the app
- `home`, renders the list or the Sign-in link
- `authControls`, which houses 
- `list`, renders the actual items
- `todoItem`, renders individual items
- `checkPath`, renders a checked or empty box based on item status

#AuthControls
this component takes the stitchClient as a `Client` prop and renders either a Sign-in or Sign-out link based on the status of that property. Leveraging the anonymous authentication we established during setup, this component provides login and logout methods
~~~js

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

## List
The List component is the only component with internal state, and  most heavily leverages our stitch client, making requests to create, update, and delete todo-items. The primary methods are loadList() loadMine() which retrieve either all todo-items or those belonging to the current user

~~~js

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
  
~~~

`addItem`, `checkHandler`, and `clear` handle the insertion, updating, and deletion of documents, respectively

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






 
