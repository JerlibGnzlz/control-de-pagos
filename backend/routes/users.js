import express from 'express'
import { createUser, getUsers, updateUser, deleteUser, reactivateUser } from '../controllers/userController.js'

export const userRoutes = express.Router()

// GET /api/users - Obtener usuarios (solo activos por defecto)
// GET /api/users?includeInactive=true - Obtener todos los usuarios
userRoutes.get("/", getUsers)

// POST /api/users - Crear nuevo usuario
userRoutes.post("/", createUser)

// PUT /api/users/:id - Actualizar usuario
userRoutes.put("/:id", updateUser)

// DELETE /api/users/:id - Desactivar usuario (soft delete)
userRoutes.delete("/:id", deleteUser)

// PATCH /api/users/:id/reactivate - Reactivar usuario
userRoutes.patch("/:id/reactivate", reactivateUser)
