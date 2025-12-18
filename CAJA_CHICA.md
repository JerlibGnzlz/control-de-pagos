# 💰 Visualización de Caja Chica (Dinero Disponible)

## ✨ Funcionalidad Nueva Implementada

Se ha agregado una **visualización clara y destacada** del dinero disponible (Caja Chica) en dos lugares de la aplicación.

## 📍 Ubicaciones

### 1. **En la Tabla de Datos (DataTable)**
Debajo de la tabla principal, ahora aparece una **tarjeta de resumen financiero** con:

```
┌─────────────────────────────────────────────────┐
│        📊 Resumen Financiero Total              │
├──────────────┬──────────────┬───────────────────┤
│ Total        │ Total        │ 💰 Caja Chica    │
│ Recaudado    │ Alquileres   │ Disponible        │
│ $XXX.XXX     │ $XXX.XXX     │ +$XX.XXX         │
│ (verde)      │ (rojo)       │ (verde/rojo)      │
└──────────────┴──────────────┴───────────────────┘
    Barra de progreso: [████████░░] 85%
```

**Características:**
- ✅ **3 tarjetas visibles** con valores grandes
- 💰 La tarjeta de **Caja Chica** tiene borde amarillo destacado
- 🎨 Fondo con gradiente desde índigo hasta azul
- 📊 **Barra de progreso** que muestra qué porcentaje del alquiler se ha cubierto
- 🟢 Verde cuando hay superávit (≥100%)
- 🟡 Amarillo cuando está entre 75-100%
- 🔴 Rojo cuando está por debajo del 75%

### 2. **En el Componente Summary**
Al inicio del componente Resumen de Pagos, aparece una **sección destacada**:

```
┌──────────────────────────────────────────┐
│ 💰 Dinero Disponible (Caja Chica)       │
│         +$XXX.XXX                         │
│ (Total recaudado - Total de alquileres)  │
└──────────────────────────────────────────┘
```

Seguido de un desglose:
- Total recaudado: $XXX.XXX
- Total de alquileres: $XXX.XXX
- ─────────────────
- Diferencia: +$XX.XXX

## 🧮 Cálculo de la Caja Chica

```
Caja Chica = Total Recaudado - Total de Alquileres
```

**Ejemplo:**

| Concepto | Monto |
|----------|-------|
| Total recaudado de todos los meses | $950.000 |
| Total de alquileres de todos los meses | $800.000 |
| **Caja Chica (Dinero Disponible)** | **+$150.000** |

## 🎨 Código de Colores

| Condición | Color | Significado |
|-----------|-------|-------------|
| Caja Chica ≥ 0 | 🟢 Verde | Hay dinero disponible |
| Caja Chica < 0 | 🔴 Rojo | Hay un déficit |

### Mensajes Adicionales

- ✅ **"Hay fondos disponibles"** - Cuando caja chica es positiva
- ⚠️ **"Déficit acumulado"** - Cuando caja chica es negativa

## 📊 Barra de Progreso

La barra de progreso muestra visualmente qué porcentaje del alquiler total se ha cubierto:

```
Porcentaje = (Total Recaudado / Total Alquiler) × 100
```

**Colores:**
- 🟢 **Verde**: ≥100% (cubierto completamente o con superávit)
- 🟡 **Amarillo**: 75-99% (casi cubierto)
- 🔴 **Rojo**: <75% (falta mucho por cubrir)

## 💡 Interpretación Práctica

### Caso 1: Caja Chica Positiva (+$150.000)
```
✅ Significado: Has recaudado más de lo necesario para pagar todos 
   los alquileres del año.
   
💰 Tienes $150.000 disponibles para:
   - Fondo de emergencia
   - Gastos extras
   - Ahorro
```

### Caso 2: Caja Chica Negativa (-$50.000)
```
⚠️ Significado: No has recaudado suficiente para cubrir todos 
   los alquileres del año.

💸 Falta cubrir $50.000:
   - Necesitas recaudar más
   - O reducir alquileres futuros
   - O usar fondos de otra fuente
```

### Caso 3: Caja Chica Cero ($0)
```
✓ Significado: Recaudaste exactamente lo necesario para todos 
  los alquileres. Ni sobra ni falta.
```

## 🔄 Relación con Saldo Acumulado

**IMPORTANTE:**
- **Saldo Acumulado** (fila azul en la tabla): Muestra mes a mes cuánto dinero vas acumulando
- **Caja Chica Total**: Es el valor **FINAL** del saldo acumulado (última columna)

```
Caja Chica Total = Saldo Acumulado del último mes
```

## 📱 Diseño Responsive

Las tarjetas se adaptan al tamaño de pantalla:
- 📱 **Móvil**: 1 columna (apiladas)
- 💻 **Desktop**: 3 columnas (lado a lado)

## ✅ Funcionalidad Completa

✓ Cálculo automático en tiempo real  
✓ Actualización inmediata al cambiar alquileres  
✓ Formato con separadores de miles  
✓ Signo + para valores positivos  
✓ Colores dinámicos según el estado  
✓ Compatible con modo oscuro  
✓ Diseño atractivo y profesional  
✓ Mensajes claros y descriptivos  
