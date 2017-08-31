# MongoDB Stitch

 I enjoy programming for the sake of programming. I have repos solving the same problem in multiple languages using multiple tools and techniques, I can talk for hours about code quality, and the pleasures of refactoring. What I'm really trying to say is that I love code, almost to an absurd degree. What I don't love, however, is the setup. And apparently I'm not alone. Within the React community there's a preponderance of boilerplate repos and single function libraries, all geared toward developers who want to experiment, or just get something on the screen. But create-react-app cant do it all. Sometimes you need data, fast. And if you haven't the time or energy to wrangle the waterfall of firebase callbacks, or retrain your brain for GraphQL, you'll be glad to know that one of the JS communities most popular databases, MongoDB, has joined the Backend-as-a-Service bandwagon, and it's pretty awesome.
 
 In their own words 
 
 >> MongoDB Stitch lets developers focus on building applications rather than on managing data manipulation code, service integration, or backend infrastructure. Whether you’re just starting up and want a fully managed backend as a service, or you’re part of an enterprise and want to expose existing MongoDB data to new applications, Stitch lets you focus on building the app users want, not on writing boilerplate backend logic.
  

 That last sentence was music to my ears. As I'm constantly experimenting with code,I've come to appreciate mongoDB for it's quick uptake compared to its relational counterparts, and Stitch only makes things better. I've created this small todo-list application, to introduce some of the benefits of Stitch, and show demonstrate just how easy it is to get started.
 
# What we'll be building
 This is a small CRUD-style application that uses MondoDB Stitch for the backend and React for the UI. Users will be able to Sign-in anonymously (the best!), create new tasks, and edit/delete the tasks they create. Excluding the boilerplate (ugh!) config files, this project's `src` directory consists almost entirely of react components and two files dedicated to the backend. This project is very minimal, so fair warning, it's pretty ugly.
 
# Setup
 For this project, you'll need a MongoDB Atlas cluster using MongoDB version 3.4+. The tutorial uses an Atlas Free Tier cluster. They're exceedingly easy to setup, you can find instructions here.
 
 You'll need to create a new Stitch application to associate with  your cluster. Atlas features an intuitive UI that walks you through creating a new stitch application in under eight clicks. Then you'll be redirected to your console to setup a new collection. 
 
