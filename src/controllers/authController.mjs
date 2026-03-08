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
import WaterMonitors from "../models/WaterMonitors.mjs"
//import { AccessTokenInstance } from "twilio/lib/rest/verify/v2/service/accessToken"

// Verify OTP
export const verifyOtp = async (req, res, next) => {
  try {
    const {loginSessionId, otp} = req.body

    if(!mongoose.Types.ObjectId.isValid(loginSessionId)) {
      return res.status(400).json({status: "failed:", message: "Invalid login session "})
    }
    //verifying if the session  for otp exists and is pending
    const session = await otp.findById(loginSessionId).populate("user")
    if (!session || session.status !== "Pending") {
      return res.status(400).json({status: "failed:", message: "Invalid or expired OTP"})
    }
    //checking if the otp matches the one in the session and if it is not expired
    if(session.expiresAt < new Date()) {
      session.status = "Expired"
      await session.save()
      return res.status(400).json({status: "failed:", message: "OTP has expired"})
    }
    if(session.code !== otp){
      return res.status(400).json({status: "failed:", message: "Invalid OTP"})
    }

    session.status = "Used"
    await session.save()

    const accessToken = generateAccessToken(session.user)
    const refreshToken = generateRefreshToken(session.user)
    const decoded = verifyRefreshToken(refreshToken)

    const refreshExpiires = new Date(decoded.exp * 1000)

    await RefreshToken.create({
      token: refreshToken,
      user: session.user._id,
      expiresAt: refreshExpiires,
      revoked: false, 
    })

    res.cookies("refreshLoginToken ", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: refreshExpiires,
    })
    //used granted permission to login
    res.status(200).json({
      status: "success",
      accessToken,
      user: session.user,
    })

  } catch (error) {
    next(error);
    
  }
  
}


// Register User
export const registerUser = async (req, res, next) => {
  try {
    const {verificationSessionId, email, location, rol} = req.validatedData

    if(!mongoose.Types.ObjectId.isValid(verificationSessionId)) {
      return res.status(400).json({status: "failed:", message: "Invalid verification session"})
    }
    //checking if the verification session exists and is valid
    const verificationSession = await IdentityVerificationSession.findById(verificationSessionId)

    if(!verificationSession || verificationSession.status !== "Verified" || verificationSession.expiresAt < new Date()) {
      return res.status(400).json({status: "failed:", message: "Expired verification session"})
    }
    //checking if the email is already in use
    const existingUser = await WaterMonitors.findOne({email})
    if(existingUser) {
      return res.status(400).json({status: "failed:", message: "WaiterMonitor already registered"})
    } 
    //checking first if the employee to be registered as Watermonitor exists
    const employee = await Employee.findOne({email})

    if(!employee) {
      return res.status(400).json({status: "failed:", message: "No employee found with the provided email"})
    }

    if(!location) {
      return res.status(400).json({status: "failed:", message: "Location is required"})
    } 
    const tempPassword = generateRandomCode(8)
    const hashshedPassword = await hashPassword(tempPassword)

    //registering new water monitor
    const waterMonitor = await WaterMonitor.create({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      user: employee._id,
      password: hashshedPassword,
      phoneNumber: employee.phoneNumber,
      role: role || "WaterMonitor",
      location: {
        assignedArea: location.assignedArea,
        district: location.district,
      }
    })
    res.status(201).json({
      status: "success",
      message: "Water monitor registered successfully",
      data: {
        waterMonitor,
      }
    })
    //generating otp for first login
    const otpCode = generateRandomCode(6)
    const otp = await Otp.create({
      user: waterMonitor._id,
      code: otpCode,  
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      status: "Registration",
    })
    //sending email notification to the new water monitor
    const html = `
      <h1>Madzi Watcher Alert</h1>
      <p>Dear ${employee.firstName} ${employee.lastName},</p>
      <p>You have been registered as a Water Monitor. Your account has been created successfully.</p>

      <h3>Account Details:</h3>
      <ul>
        <li><strong>Email:</strong> ${employee.email}</li>
        <li><strong>Temporary password:</strong> ${tempPassword}</li>
      </ul>
      <p>Please use the OTP sent via email: <strong>${otpCode}</strong></p>
      <p>This OTP will expire in 10 minutes. Please change your password after logging in.</p>
      <p>Thank you for joining the Madzi Watcher team!</p>
    `
    await sendEmail(employee.email, "Welcome to Madzi Watcher - Your Account Details", html)
    
  
  } catch (error) {
    next(error);
    
  }
  
}

// Login User
export const loginUser = async (req, res, next) => {
  try {
      const{email, password} = req.validatedData

    const findWaterMonitor = await WaterMonitors.findOne({email})
    if(!findWaterMonitor) {
      return res.status(400).json({status: "failed:", message: "Invalid email or password"})
    }
    
    const isPasswordValid = await comparePassword(password, findWaterMonitor.password)
    if(!isPasswordValid) {
      return res.status(400).json({status: "failed:", message: "Invalid email or password"})
    }
    //generating refresh token and access token for the waterMonitor
    const accessToken = generateAccessToken(findWaterMonitor._id)
    const refreshToken = generateRefreshToken(findWaterMonitor._id) 
    const decoded = verifyRefreshToken(refreshToken)

    const refreshExpiires = new Date(decoded.exp * 1000)

    await RefreshToken.create({
      token: refreshToken,
      user: findWaterMonitor._id,
      expiresAt: refreshExpiires,
      revoked: false, 
    })

    const otpCode = generateRandomCode(6)

    const otp = await Otp.create({
      user: findWaterMonitor._id,
      code: otpCode,
      email: findWaterMonitor.email,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
      status: "Login",
    })

    const html = `
      <h1>Madzi Watcher Alert</h1>
      <p>Your login veriification code is: ${otpCode}</p>
      <p>This code will expire in 10 minutes.</p>'
    `
    await sendEmail(findWaterMonitor.email, "Madzi Watcher Login OTP", html)

    const sessionExpires = new Date(Date.now() + 15 * 60 * 1000) // session expires in 15 minutes

    const session = await IdentityVerificationSession.create({
      waterMonitorId: findWaterMonitor._id,
      status: "pending",
      expiresAt: sessionExpires
    })

    res.status(200).json({
      status: "success",
      message:{
        accessTokenInstance: accessToken,
        refreshTokenInstance: refreshToken,
        otpCode: otpCode,
        user:{
          id: findWaterMonitor._id,
          email: findWaterMonitor.email,
        } 
      
      }
    })
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

