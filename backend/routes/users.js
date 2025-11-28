import express from 'express'
import { createUser, getUsers } from '../controllers/userController.js'

export const userRoutes = express.Router()

userRoutes.get("/", getUsers)
userRoutes.post("/", createUser)







