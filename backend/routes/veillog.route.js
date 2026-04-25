const express = require("express");
const router = express.Router();
const path = require("path");
const authentify = require("../middlewares/authetication.middleware.js");
const note = require("../models/note.model.js");
const todo = require("../models/todo.model.js");
const journal = require("../models/journal.model.js");
const open = require("../models/open.model.js");
const { model } = require("mongoose");

const models = { note: note, todo: todo, journal: journal, open: open };
router.get("/veillog/entries", authentify, async function (req, res) {
  try {
    const ownerId = req.user.id;

    const [notes, journals, todos, opens] = await Promise.all([
      note.find({ ownerId }),
      journal.find({ ownerId }),
      todo.find({ ownerId }),
      open.find({ ownerId }),
    ]);

    // findNotes(ownerId),
    // findJournals(ownerId),
    // findTodos(ownerId),

    const logs = [...notes, ...journals, ...todos, ...opens];

    res.json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching entries", error: error.message });
  }
});

router.post("/veillog/:type", authentify, async function (req, res) {
  try {
    const Model = models[req.params.type];

    if (!Model) {
      return res.status(404).send("Invalid category");
    }

    const entry = new Model({ ...req.body, ownerId: req.user.id });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({
      message: `Error creating ${req.params.type}`,
      error: error.message,
    });
  }
});
router.patch("/veillog/:type/:id", authentify, async function (req, res) {
  try {
    const Model = models[req.params.type];
    const updated = await Model.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { $set: req.body },
      { returnDocument: "after" },
    );
    res.status(202).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/veillog/:type/:id", authentify, async function (req, res) {
  try {
    const Model = models[req.params.type];
    await Model.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
