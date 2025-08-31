import express from 'express'
import { createUser, getUserWithPayments } from '../controllers/userController.js'

export const userRoutes = express.Router()

userRoutes.post("/", createUser)

userRoutes.get('/:name', getUserWithPayments)






