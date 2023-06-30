//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://mstfakks:M.581441.a@cluster0.dr31itw.mongodb.net/todolistDB"
);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => console.log("Default items added"))
          .catch((err) => console.log(err));
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch((err) => console.log(err));
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then((foundList) => {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  });
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({ _id: checkedItemId })
      .then(() => {
        console.log("Item deleted");
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    ).then((foundList) => {
      res.redirect("/" + listName);
    });
  }
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

/*
Deploying Apps with Databases
-> Bu adımda bir db ile çalışan uygulamayı deploy etmeyi öğreneceğiz.
-> Şu anda uygulamamıza localhost:3000 üzerinden erişebiliyoruz. Uygulama 
sunucu olarak bilgisayarımızı kullanıyor bilgisayarımız node a dayanıyor.
-> Web uygulamamızın kendisini heroku gibi bir platforma deploy edebiliriz.
-> Veritabanımızı da ayrı bir sunucu içerisinde açmalıyız. MongoDB için 
MongoDB Atlas kullanacağız.
-> Db mizi dağıtmak için MongoDB Atlas'a kayıt oluyoruz.
-> Databases kısmında connect butonuna tıklıyoruz. Burada mongosh
kullandığımız için I have MongoDB shell seçeneğini işaretliyoruz.
-> Daha sonra bize verdiği connection stringi terminalimize kopyalıyoruz.
-> connection stringten sonra istediği şifreyi giriyoruz.
-> Uygulamamızı buraya bağlamak için connect your application diyip
oradan gelen url i uygulamada connection kısmına yapıştırıyoruz.
*/
