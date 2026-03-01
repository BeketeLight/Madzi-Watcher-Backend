// models/Application.mjs
import mongoose from "mongoose"

const { Schema } = mongoose

const EmployeeSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      index: true,
    },
    lastName: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    position: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    } 
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("Employee", EmployeeSchema)
