import WaterMonitor from "../models/WaterMonitors.mjs"
import Employee from "../models/Employee.mjs"
import Otp from "../models/Otp.mjs"
import sendEmail from "../utils/sendEmail.mjs"
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.mjs"
import {
  generateRandomCode,
  hashPassword,
  comparePassword,
  maskEmail,
} from "../utils/helpers.mjs"
import IdentityVerificationSession from "../models/IdentityVerificationSession.mjs"
import RefreshToken from "../models/RefreshToken.mjs"
import mongoose from "mongoose"

// Verify OTP
export const verifyOtp = async (req, res, next) => {
  try {

    
  } catch (error) {
    next(error);
    
  }
  
}


// Register User
export const registerUser = async (req, res, next) => {
  try {
    
    
  } catch (error) {
    next(error);
    
  }
  
}

// Login User
export const loginUser = async (req, res, next) => {
  try {
    
    
  } catch (error) {
    next(error);
    
  }
  
};


// Logout User
export const logoutUser = async (req, res, next) => {
  try {
    
    
  } catch (error) {
    next(error);
    
  }
  
}


// Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    
    
  } catch (error) {
    next(error);
    
  }
  
}

// Request Password Reset
export const requestPasswordReset = async (req, res, next) => {
  try {
    
    
  } catch (error) {
    next(error);
    
  }
  
}

//reset password
export const resetPassword = async (req, res, next) => {
  try {
    
    
  } catch (error) {
    next(error);
    
  }
  
}

//change password
export const changePassword = async (req, res, next) => {
  try {
    
    
  } catch (error) {
    next(error);
    
  }

}

