# MongoDB Stitch
[stitchWelcome]: static/images/stitchWelcome.png

 I enjoy programming for the sake of programming. I have repos solving the same problem in multiple languages using multiple tools and techniques, I can talk for hours about code quality, and the pleasures of refactoring. What I'm really trying to say is that I love code, almost to an absurd degree. What I don't love, however, is the setup. And apparently I'm not alone. Within the React community there's a preponderance of boilerplate repos and single function libraries, all geared toward developers who want to experiment, or just get something on the screen. But create-react-app cant do it all. Sometimes you need data, fast. And if you haven't the time or energy to wrangle the waterfall of firebase callbacks, or retrain your brain for GraphQL, you'll be glad to know that one of the JS communities most popular databases, MongoDB, has joined the Backend-as-a-Service bandwagon, and it's pretty awesome.
 
 In their own words 
 
 >> MongoDB Stitch lets developers focus on building applications rather than on managing data manipulation code, service integration, or backend infrastructure. Whether you’re just starting up and want a fully managed backend as a service, or you’re part of an enterprise and want to expose existing MongoDB data to new applications, Stitch lets you focus on building the app users want, not on writing boilerplate backend logic.
  

 That last sentence was music to my ears. As I'm constantly experimenting with code, I've already come to appreciate mongoDB for it's quick uptake compared to its relational counterparts, and Stitch only makes things better. I've created this small todo-list application, to introduce some of the benefits of Stitch, and demonstrate just how easy it is to get started.
 
# What we'll be building
 This is a small CRUD-style application that uses MondoDB Stitch for the backend and React for the UI. Users will be able to Sign-in anonymously (the best!), create new tasks, and edit/delete the tasks they create.
 Excluding the boilerplate (ugh!) config files, this project's `src` directory consists almost entirely of react components and two files dedicated to the backend. This project is very minimal, so fair warning, it's pretty ugly.
 
## collection info
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
 
 You'll need to create a new Stitch application to associate with  your cluster. Atlas features an intuitive UI that walks you through creating a new stitch application in under eight clicks. Then you'll be redirected to your console to setup a new collection and database client.
 ![stitchWelcome][stitchWelcome]
 
 Enable anonymous authentication, and create a new `todo` database and `items` collection. From there you'll be presented with a number code samples to direct you in establishing a client. The Nodejs tab will present something to the effect of:
 
 ~~~js
const stitch = require("mongodb-stitch")
const client = new stitch.StitchClient('<YOUR-APP-ID>');
const db = client.service('mongodb', 'mongodb-atlas').db('<DATABASE>');
client.login().then(() =>
  db.collection('<COLLECTION>').updateOne({owner_id: client.authedId()}, {$set:{number:42}}, {upsert:true})
).then(() =>
  db.collection('<COLLECTION>').find({owner_id: client.authedId()})
).then(docs => {
  console.log("Found docs", docs)
  console.log("[MongoDB Stitch] Connected to Stitch")
}).catch(err => {
  console.error(err)
});
 ~~~
 
 While this code is not useful for our app, it does show that you're more or less ready to start running your application. That easily. But before jumping into the code base directly, there are a few database specific rules we need to establish.
 
# Rules 
>> For a MongoDB Service, you have to set up rules to control access to fields for read and write operations.

 When making various requests to your database, these rules determine which data will come back and how it can be manipulated. If you're familiar with other BaaS platforms like FireBase or Apollo, this is conceptually identical, and the primary distinctions are syntactic. If a rule evaluates to true, read and write operation can access the fields for which the rule applies. If a rule evaluates to false, access is denied.
 
 There are two types of rules
 -  _Top Level Document_ apply to any and all fields in a document
 - _Field Specific Rules_ apply to specific fields and their descendants

## Todo.Items Rules
For our `todo.items` collection, we want everyone to be able to read everyone's items and so set the Top Level Document read rule to an empty object, which evaluates to true
~~~js
{}
~~~
But since only users who create items should be able to modify them, the write rules are set to 
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
  
 
# The Application
The application is pretty bare-bones, and should work out of the box
