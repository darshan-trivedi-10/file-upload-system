const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const multer = require("multer");
const path = require("path");

// Replace 'database', 'username', and 'password' with your actual database credentials
const sequelize = new Sequelize("FILE_STORE", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// Define the Sequelize model for the DocumentCategory table
const DocumentCategory = sequelize.define("DocumentCategory", {
  categoryid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  categoryname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categorydatatype: {
    type: DataTypes.ENUM,
    values: ["STRING", "INTEGER", "FLOAT", "DATEONLY", "FILE"],
  },
  fileData: {
    type: DataTypes.STRING, // Store the file name as a string in the database
    allowNull: true,
  },
});

// Synchronize the model with the database
sequelize
  .sync()
  .then(() => console.log("Model synchronized"))
  .catch((error) => console.error("Error synchronizing model:", error));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    // Generate a unique filename using Date.now() and the original file extension
    const uniqueFilename = `${Date.now()}-${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

// API route to create a new document category with file data
app.post("/create", upload.single("file"), async (req, res) => {
  try {
    const { categoryname, categorydatatype } = req.body;
    console.log(req.file, req.body.file);
    const fileData = req.file ? req.file.filename : null;

    // Create a new document category with the provided data
    const documentCategory = await DocumentCategory.create({
      categoryname,
      categorydatatype,
      fileData,
    });

    res
      .status(201)
      .json({
        message: "Document category created successfully",
        documentCategory,
      });
  } catch (error) {
    console.error("Error creating document category:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while creating the document category",
      });
  }
});

// API route to update an existing document category with file data
app.put("/update/:id", upload.single("file"), async (req, res) => {
  try {
    const documentCategoryId = req.params.id;
    const { categoryname, categorydatatype } = req.body;
    const fileData = req.file ? req.file.filename : null;

    // Find the document category by ID
    const documentCategory = await DocumentCategory.findByPk(
      documentCategoryId
    );

    if (!documentCategory) {
      return res.status(404).json({ error: "Document category not found" });
    }

    // Update the document category with the provided data
    documentCategory.categoryname = categoryname;
    documentCategory.categorydatatype = categorydatatype;
    documentCategory.fileData = fileData;
    await documentCategory.save();

    res.json({
      message: "Document category updated successfully",
      documentCategory,
    });
  } catch (error) {
    console.error("Error updating document category:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while updating the document category",
      });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
