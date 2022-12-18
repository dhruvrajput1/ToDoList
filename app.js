const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

mongoose.set('strictQuery', false);

mongoose.connect("mongodb+srv://dhruuvvv:iittopper@cluster0.laibfef.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema ({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Buy Food"
});

const item2 = new Item ({
    name: "Eat Food"
});

const item3 = new Item ({
    name: "Cook Food"
});

const defaultItems = [item1, item2, item3];

const ListSchema = new mongoose.Schema ({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", ListSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
    
    Item.find({}, function(err, foundItems) {
 
        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if(err) {
                    console.log(err);
                }
                else {
                    console.log("Data added to Server");
                }
            })
            res.redirect("/");
        }
        else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
        
    })

})

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);


    
    List.findOne({name: customListName}, function(err, foundListItem) {
        if(!foundListItem) {
            // create new list
            const list = new List ({
                name: customListName,
                items: defaultItems
            });

            list.save();
            res.redirect("/" + customListName);
        }
        else {
            // show existing list
            res.render("list", {listTitle: foundListItem.name, newListItems: foundListItem.items});
        }
    })


    
})


app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    })

    if(listName === "Today") {
        item.save();

        res.redirect("/");
    }
    else {
        List.findOne({name: listName}, function(err, foundListItem) {
            foundListItem.items.push(item);

            foundListItem.save();
            
            res.redirect("/" + listName);
        })
    }

    
    
})

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.chekbox;

    const listName = req.body.listName; 

    if(listName === "Today") {
        Item.deleteOne({_id: checkedItemId}, function(err) {
            if(err) {
                console.log(err);
            }
        });
        res.redirect("/");
    }
    else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundListItem) {
            res.redirect("/" + listName);
        })
    }

    

    
})


// app.post("/work", function(req, res) {
//     let item = req.body.newItem;
//     workItems.push(item);


//     res.redirect("/work");
// })

app.get("/about", function(req, res) {
    res.render("about")
})

app.listen(3000, function() {
    console.log("Server is live on port 3000");
})
