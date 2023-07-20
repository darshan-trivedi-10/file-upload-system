const { DataTypes } = require("sequelize");

const DocumentCategorySchema = {
  DocumentCategory: {
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
      type: DataTypes.BLOB,
      allowNull: true,
    },
  },
};

module.exports = DocumentCategorySchema;
