const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const multer = require("multer");
const path = require("path");

const sequelize = new Sequelize("FILE_STORE", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

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
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      return this.getDataValue("fileData")
        ? JSON.parse(this.getDataValue("fileData"))
        : null;
    },
    set(value) {
      this.setDataValue("fileData", value ? JSON.stringify(value) : null);
    },
  },
});

sequelize
  .sync()
  .then(() => console.log("Model synchronized"))
  .catch((error) => console.error("Error synchronizing model:", error));

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

app.post("/create", upload.array("files", 10), async (req, res) => {
  try {
    const { categoryname, categorydatatype } = req.body;
    console.log(req.files); // req.files will contain an array of uploaded files

    // Process multiple uploaded files if needed
    const fileData = req.files.map((file) => file.filename);
    console.log(fileData);

    const documentCategory = await DocumentCategory.create({
      categoryname,
      categorydatatype,
      fileData,
    });

    res.status(201).json({
      message: "Document category created successfully",
      documentCategory,
    });
  } catch (error) {
    console.error("Error creating document category:", error);
    res.status(500).json({
      error: "An error occurred while creating the document category",
    });
  }
});

app.put("/update/:id", upload.array("files", 10), async (req, res) => {
  try {
    const documentCategoryId = req.params.id;
    const { categoryname, categorydatatype } = req.body;

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

    // Process multiple uploaded files if needed
    if (req.files && req.files.length > 0) {
      const fileData = req.files.map((file) => file.filename);
      documentCategory.fileData = fileData;
    }

    await documentCategory.save();

    res.json({
      message: "Document category updated successfully",
      documentCategory,
    });
  } catch (error) {
    console.error("Error updating document category:", error);
    res.status(500).json({
      error: "An error occurred while updating the document category",
    });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
