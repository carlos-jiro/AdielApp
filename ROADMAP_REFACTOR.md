# 🗺️ Roadmap de Refactorización — Proyecto Adiel

> Documento vivo que registra el progreso de la refactorización del frontend.
> **Última actualización:** 2026-05-09

---

## Resumen Ejecutivo

Este documento trackea las fases de refactorización planificadas para el proyecto **Adiel Front** (React 19 + Vite + Supabase + Zustand).

---

## ✅ FASES COMPLETADAS

### Fase 1 — Eliminar Componentes Duplicados y Limpiar `src/components/`
**Estado:** `COMPLETADA` | **Prioridad:** 🔴 Crítica

**Objetivo:** Eliminar la duplicación masiva entre `src/components/` y `src/features/*/components/`.

**Archivos eliminados de `src/components/`:**
- `ProjectCard.tsx`
- `UploadSongModal.tsx`
- `AddExistingSongModal.tsx`
- `CreateProjectModal.tsx`
- `MemberProfileView.tsx`
- `InviteMemberModal.tsx`
- `AttendanceRegister.tsx`
- `MyAttendanceView.tsx`

**Archivos que permanecen en `src/components/` (solo globales):**
- `layout/Header.tsx`
- `layout/Navbar.tsx`
- `global/GlobalPlayer.tsx`
- `ui/ModalLayout.tsx`
- `AddTutorialModal.tsx`

**Resultado:** Build exitoso. Reducción de ~600 líneas de código duplicado.

---

### Fase 2 — Refactorizar API Routes: Extraer Utilidades Comunes
**Estado:** `COMPLETADA` | **Prioridad:** 🔴 Crítica

**Objetivo:** Eliminar la duplicación de lógica entre las 3 API routes (`api/`) y `vite.config.ts`.

**Archivo creado:**
- `api/lib/apiUtils.ts`
  - `decodeJwtPayload(token)`
  - `getStoragePathFromPublicUrl(url)`
  - `createValidateAdmin(supabaseUrl, supabaseAnonKey)` — factory para evitar hardcodear env vars

**Archivos refactorizados:**
- `api/delete-user.ts` → ahora importa desde `api/lib/apiUtils.ts`
- `api/delete-song.ts` → ahora importa desde `api/lib/apiUtils.ts`
- `api/delete-song-asset.ts` → ahora importa desde `api/lib/apiUtils.ts`
- `vite.config.ts` → eliminadas ~200 líneas de lógica duplicada, ahora importa utilidades compartidas

**Configuración actualizada:**
- `tsconfig.node.json` → incluye `api/lib/apiUtils.ts` en el array `include`

**Resultado:** Build exitoso. Lógica de validación de admin y utilidades JWT centralizadas en un solo archivo.

---

### Fase 3 — Corregir Typo `memebers/` → `members/` y Estandarizar Imports `@/`
**Estado:** `COMPLETADA` | **Prioridad:** 🔴 Crítica

**Objetivo:** Corregir el typo en el nombre de carpeta y establecer el alias `@/` como estándar en todo el proyecto.

**Cambios realizados:**
- Renombrada carpeta: `src/pages/memebers/` → `src/pages/members/`
- Actualizado `src/App.tsx` para importar desde `@/pages/members/Members`
- Estandarizados imports a alias `@/` en:
  - `src/App.tsx` (todos sus imports)
  - `src/components/layout/Header.tsx`
  - `src/components/layout/Navbar.tsx`
  - `src/components/global/GlobalPlayer.tsx`
  - `src/components/AddTutorialModal.tsx`

**Resultado:** Build exitoso. Estructura de carpetas corregida y consistencia en imports.

---

## 📋 FASES PENDIENTES

### Fase 4 — Dividir `Settings.tsx` en Sub-componentes
**Estado:** `PENDIENTE` | **Prioridad:** 🟠 Alta | **Estimado:** ~50 min

**Objetivo:** Refactorizar el monolito de 534 líneas en componentes pequeños y reutilizables por dominio.

**Archivos a crear:**
- `src/features/settings/components/ProfileSettings.tsx` (datos personales, avatar)
- `src/features/settings/components/GroupSettings.tsx` (info del grupo, logo)
- `src/features/settings/components/SecuritySettings.tsx` (cambio de contraseña)
- `src/features/settings/components/ThemeSettings.tsx` (selector de gradientes)

**Archivos a crear/modificar:**
- `src/features/settings/SettingsView.tsx` (nuevo wrapper que compone los 4 sub-componentes)
- `src/pages/settings/Settings.tsx` → actualizar para importar desde `features/settings/SettingsView`
- `src/features/settings/index.ts` → barrel export

**Pasos:**
1. Crear carpeta `src/features/settings/components/`
2. Extraer cada sección del JSX de `Settings.tsx` en su propio componente
3. Extraer la lógica de estado correspondiente a cada componente (o mantenerla en el parent si es compartida)
4. Crear `SettingsView.tsx` que renderice los 4 sub-componentes
5. Actualizar `src/pages/settings/Settings.tsx`
6. Ejecutar `npm run build`

**Criterio de éxito:** Build pasa. La página de Settings funciona igual pero con código dividido.

---

### Fase 5 — Reemplazar Datos Hardcodeados del Dashboard
**Estado:** `PENDIENTE` | **Prioridad:** 🟠 Alta | **Estimado:** ~60 min

**Objetivo:** Hacer que `NoticesWidget` y `AchievementsWidget` consuman datos reales de Supabase en lugar de datos estáticos en el código.

**Esquema de base de datos a crear (en Supabase):**
- Tabla `notices` (id, title, content, type, created_at, active)
- Tabla `achievements` (id, user_id, name, description, xp, icon, unlocked_at)

**Archivos a modificar:**
- `src/features/dashboard/components/NoticesWidget.tsx` → consumir desde tabla `notices`
- `src/features/dashboard/components/AchievementsWidget.tsx` → consumir desde tabla `achievements`
- `src/store/slices/createDataSlice.ts` → agregar fetchers para `notices` y `achievements`
- `src/store/types.ts` → agregar tipos

**Pasos:**
1. Definir tipos `Notice` y `Achievement` en `src/lib/types.ts` o `src/store/types.ts`
2. Crear hooks: `useNotices()` y `useAchievements()` en `src/features/dashboard/hooks/`
3. Refactorizar widgets para usar los hooks
4. (Opcional) Si no se quiere modificar la base de datos ahora, se puede simular con un JSON en el store como paso intermedio, pero lo ideal es crear las tablas

**Criterio de éxito:** Los widgets muestran datos dinámicos. Si no hay datos, muestran estado vacío.

---

### Fase 6 — Centralizar Cálculo de Asistencia y Mejorar Manejo de Errores
**Estado:** `PENDIENTE` | **Prioridad:** 🟡 Media | **Estimado:** ~60 min

**Objetivo:** Crear una única fuente de verdad para las estadísticas de asistencia y mejorar el feedback al usuario.

**Archivos a crear/modificar:**
- `src/features/members/hooks/useAttendanceStats.ts` (nuevo hook compartido)
- `src/store/slices/createUserSlice.ts` → usar el hook o centralizar el cálculo aquí
- `src/features/members/components/MyAttendanceView.tsx` → usar el hook compartido
- `src/features/dashboard/components/StatsWidget.tsx` → usar el hook compartido
- (Opcional) Crear un sistema de toasts/notificaciones simple con React Context o un slice de Zustand

**Pasos:**
1. Crear `useAttendanceStats(userId)` que calcule total de eventos, asistencias y porcentaje
2. Reemplazar la lógica duplicada en `MyAttendanceView` y `UserSlice` por este hook
3. Implementar un toast/simple notification system (por ejemplo, un slice `createNotificationSlice` en Zustand + un componente `ToastContainer`)
4. Reemplazar `alert()` y `console.error` crudos en operaciones destructivas por notificaciones

**Criterio de éxito:** El porcentaje de asistencia se calcula en un solo lugar. Los errores muestran toasts en lugar de `alert()`.

---

### Fase 7 — Testing y Polish
**Estado:** `PENDIENTE` | **Prioridad:** 🟢 Baja | **Estimado:** ~50 min

**Objetivo:** Agregar tests básicos y hacer una revisión final de calidad.

**Archivos a crear:**
- `src/store/slices/__tests__/createPlayerSlice.test.ts` (o similar con Vitest)
- `src/lib/__tests__/apiUtils.test.ts`

**Pasos:**
1. Configurar Vitest (ya viene con Vite, solo agregar script `test`)
2. Escribir tests para los slices de Zustand más críticos (Player, User)
3. Hacer una revisión de `npm run lint` y corregir warnings restantes
4. Revisar que no queden `console.log` o `any` sin justificación
5. Actualizar `README.md` si hay cambios significativos en la estructura

**Criterio de éxito:** Tests pasan. Lint limpio. Build de producción exitosa.

---

## 📊 Tabla Resumen de Fases

| # | Fase | Prioridad | Estado | Estimado |
|---|------|-----------|--------|----------|
| 1 | Limpiar duplicados | 🔴 Crítica | ✅ Completada | 20 min |
| 2 | Refactorizar API | 🔴 Crítica | ✅ Completada | 40 min |
| 3 | Corregir typo + imports | 🔴 Crítica | ✅ Completada | 30 min |
| 4 | Dividir Settings.tsx | 🟠 Alta | ⏳ Pendiente | 50 min |
| 5 | Datos reales Dashboard | 🟠 Alta | ⏳ Pendiente | 60 min |
| 6 | Asistencia + Toasts | 🟡 Media | ⏳ Pendiente | 60 min |
| 7 | Tests + Polish | 🟢 Baja | ⏳ Pendiente | 50 min |

---

## Notas Adicionales

- Cada fase se implementa de forma aislada para evitar romper el build
- Se ejecuta `npm run build` al final de cada fase para verificar que todo funciona
- El alias `@/` ya está configurado en `vite.config.ts` y `tsconfig.app.json`
- La carpeta `src/components/` ahora solo contiene componentes globales reales
