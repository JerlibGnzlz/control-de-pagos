import express from 'express'
import { createUser } from '../controllers/userController.js'

export const userRoutes = express.Router()

userRoutes.post("/", createUser)







