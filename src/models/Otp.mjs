import  Mongoose  from "mongoose"; 
const { Schema } = Mongoose;

const OtpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,       
        index: true,                
    },
    code: {
      type: String,             
        required: true,         
        index: true,    
    },
    expiresAt: {
      type: Date,                                                                               
        required: true,             
        index: { expires: 0 } // TTL index to auto-delete expired OTPs                  
    }                       
    },
    {           
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }                                                               
);                                                  

export default Mongoose.model("Otp", OtpSchema);    