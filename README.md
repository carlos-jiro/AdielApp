# 🎵 Music Group Manager

> **Organiza tu coro o banda como un profesional.** > Gestiona miembros, repertorios, partituras y audios de ensayo en un solo lugar.

![Project Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-purple?style=for-the-badge)

---

## 🚀 ¿De qué trata?

Esta aplicación es una **plataforma integral de gestión musical** diseñada para directores de coros, líderes de alabanza y bandas.

Olvídate de enviar audios por WhatsApp o perder partituras en correos antiguos. Aquí centralizas todo:
* **Repertorio Maestro:** Una biblioteca única con todos tus cantos.
* **Proyectos/Eventos:** Crea listas (setlists) para eventos específicos (ej. "Concierto Navidad") sin duplicar archivos.
* **Material de Ensayo:** Sube pistas de audio separadas por voz (Soprano, Contralto, Tenor, Bajo) para que tus miembros estudien por su cuenta.

## ✨ Características Principales

* **👥 Gestión de Miembros:** Roles (Admin, Editor, Miembro), perfiles con foto y registro de voz/cuerda.
* **🎼 Biblioteca Musical Avanzada:**
    * Soporte para **PDFs** (Partituras/Letras).
    * Soporte para **MP3s independientes** por voz.
* **🗂️ Sistema de Proyectos:** Arquitectura "Muchos a Muchos". Un canto puede estar en varios proyectos simultáneamente.
* **🎹 Interfaz Moderna:** Diseño limpio con *Glassmorphism*, totalmente responsivo (Móvil/Desktop).
* **🔒 Seguridad:** Autenticación robusta y políticas de acceso (RLS) mediante Supabase.

---

## 🛠️ Tech Stack

Este proyecto está construido con las tecnologías más modernas y eficientes del ecosistema React.

| Tecnología | Uso |
| :--- | :--- |
| ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | Librería de UI |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | Build Tool (Rapidísimo) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) | Tipado estático y seguridad |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Estilizado moderno |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) | Backend, Auth, DB & Storage |
| ![Zustand](https://img.shields.io/badge/Zustand-🐻-orange?style=flat) | Gestión de Estado Global |

---

## 📸 Vistazos (Screenshots)

| Dashboard de Proyectos | Detalle de Canto |
|:---:|:---:|
| *Vista Split: Lista de proyectos a la izquierda, repertorio a la derecha.* | *Modal de carga con soporte para múltiples audios.* |

---

## ⚡ Instalación y Setup

Sigue estos pasos para correr el proyecto localmente:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/music-manager.git](https://github.com/tu-usuario/music-manager.git)
cd music-manager