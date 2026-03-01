import mongoose from "mongoose";    
const { Schema } = mongoose;                        
const IdentityVerificationSessionSchema = new Schema(
  {
    waterMonitor: {                 
        type: Schema.Types.ObjectId,
        ref: "WaterMonitor",                    
        required: true,     
    },
    employee: {                 
        type: Schema.Types.ObjectId,                                        
        ref: "Employee",
        required: true, 
    },                          
    status: {       
        type: String,       
        enum: ["pending", "verified", "failed"],    
        default: "pending",         
    },                                          
    expiresAt: {            
        type: Date, 
        required: true,                 
        index: { expires: 0 } // TTL index to auto-delete expired sessions      
    }                                               
    },              
    {       
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }                                               
);                      
                            
export default mongoose.model("IdentityVerificationSession", IdentityVerificationSessionSchema);                