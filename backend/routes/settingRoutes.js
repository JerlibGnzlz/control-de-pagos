import express from 'express'

export const settinghRoutes = express.Router()

settinghRoutes.get('/', async (req, res) => {
    const config = await Setting.findOne()
    res.json(config)
})

settinghRoutes.post('/', async (req, res) => {
    try {
        const s = new Setting(req.body)
        await s.save()
        res.status(201).json(s)
    } catch (err) {
        res.status(400).json({ error: 'Error al guardar configuración' })
    }
})

settinghRoutes.put('/', async (req, res) => {
    try {
        const updated = await Setting.findOneAndUpdate({}, req.body, { new: true })
        res.json(updated)
    } catch (err) {
        res.status(400).json({ error: 'Error al actualizar' })
    }
})

