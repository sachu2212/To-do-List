const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sachin:test123@cluster0.d2b0e.mongodb.net/toDoListDB", {useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Hello"
});

const item2 = new Item({
  name: "World"
});

const item3 = new Item({
  name: "Everyone!!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, (err) => {
//   if(err) {
//     console.log(err);
//   } else {
//     console.log("Inserted into the DB sucessfully!");
//   }
// }); 

// INDEX ROUTE
app.get("/", function (req, res) {

  Item.find({}, (err, foundItems) => {

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if(err) {
          console.log(err);
        } else {
          console.log("Successfully Inserted!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
    
  });
});

// NEW ROUTE
app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

  const item = new Item({
    name: itemName
  });

  // CHECKING FOR THE ITEM WHICH WAS SUBMITTED IN THE CUSTOMLIST.
  // HOME ROUTE
  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {

    //CUSTOMELIST ROUTE
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
 
});

// DELETE ROUTE
app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if(err) {
        console.log(err);
      } else {
        // console.log("Sucessfully Removed!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }
  
});

// WORK ROUTE
// app.get("/work", function (req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

// DYNAMIC ROUTE
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList) => {

    if(!err) {
      if(!foundList) {
        // creating a new list.
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
  
      } else {
        // show an existing list!
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }

  }); 
});

// ABOOUT ROUTE
app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server has started..");
});