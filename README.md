# Digital Agenda

> This document is available in two languages. The German version starts below the English section.

---

## English

### Overview

Digital Agenda is a personal productivity application built with Angular 21. It provides a structured way to manage tasks through a system of focus areas, sub-projects, and a daily planner. The application includes a calendar view with both weekly and monthly perspectives, allowing the user to schedule and track tasks over time.

The project was developed to practice full-stack web development with Angular on the frontend and a REST API on the backend, while also demonstrating deployment on a static hosting platform without a persistent server.

### Features

- **Focus Areas**: Organize tasks into custom categories. Each focus area can contain sub-projects, and each sub-project holds its own list of tasks.
- **Daily Planner**: Assign tasks from any focus area to specific days and review the workload for the day.
- **Calendar**: Browse scheduled tasks in a monthly or weekly view. Navigate directly to any week or month.
- **Task Management**: Create, complete, reorder, and delete tasks. Tasks can be scheduled to one or multiple dates.
- **Drag and Drop**: Reorder focus areas and tasks through a drag-and-drop interface.

### Technology Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components) |
| Server-Side Rendering | @angular/ssr, Express |
| Styling | CSS (component-scoped) |
| State Management | Angular Signals |
| HTTP | Angular HttpClient, RxJS |
| Backend (local) | Node.js, Express, SQL.js (SQLite) |
| Deployment | Netlify |

### How it Works Online

The application is deployed on Netlify. In this environment, there is no backend server available. The application detects this automatically at startup: if the API at `localhost:3000` is unreachable, the data layer falls back to `localStorage`. All task and focus area data is then stored and read directly from the browser.

This means the online version is fully functional as a standalone client-side application, with data persisted locally in the user's browser.

**Live URL**: deployed via Netlify (configured in `netlify.toml`)

### How it Works Locally

When running locally, a separate backend server is started alongside the Angular development server. The backend is an Express.js REST API that uses SQL.js to operate a SQLite database stored as a binary file in the local filesystem.

The `TaskStoreService` attempts to connect to the backend on startup. If the backend is available, all reads and writes go through the REST API, providing persistent storage across sessions without depending on the browser.

The backend is not included in this repository.

#### Running the Frontend

```bash
npm install
npm start
```

The application will be available at `http://localhost:4200`.

#### Running the Backend (local only, not included in this repository)

```bash
cd backend
npm install
npm start
```

The API server starts at `http://localhost:3000`. The following endpoints are exposed:

```
GET    /api/health
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/focus-areas
POST   /api/focus-areas
PUT    /api/focus-areas/reorder
DELETE /api/focus-areas/:name
POST   /api/migrate
```

### Project Structure

```
src/
  app/
    add-task/              Task creation form and landing page
    calendar/              Monthly and weekly calendar views
    day-planner/           Daily task assignment view
    focus-areas/           Focus area and sub-project management
    task/                  Individual task component
    api.service.ts         HTTP client for the backend REST API
    task-store.service.ts  Central state management with Angular Signals
  task.model.ts            Core data model
backend/                   Local-only Express + SQLite server (not in repository)
```

### Data Flow

```
Startup
  |
  |-- Try to reach backend (localhost:3000)
        |
        |-- Success --> Load tasks and focus areas from SQLite via REST API
        |
        |-- Failure --> Load tasks and focus areas from localStorage
```

All subsequent reads and writes follow the same path: backend when available, localStorage when not.

---

---

## Deutsch

### Uberblick

Digital Agenda ist eine personliche Produktivitatsanwendung, entwickelt mit Angular 21. Sie bietet eine strukturierte Moglichkeit, Aufgaben mithilfe eines Systems aus Schwerpunktbereichen, Teilprojekten und einem Tagesplaner zu verwalten. Die Anwendung enthalt eine Kalenderansicht in Wochen- und Monatsform, mit der der Nutzer Aufgaben zeitlich einplanen und verfolgen kann.

Das Projekt wurde entwickelt, um die Full-Stack-Webentwicklung mit Angular im Frontend und einer REST-API im Backend zu uben und gleichzeitig die Bereitstellung auf einer statischen Hosting-Plattform ohne dauerhaften Server zu demonstrieren.

### Funktionen

- **Schwerpunktbereiche**: Aufgaben werden in benutzerdefinierte Kategorien eingeteilt. Jeder Schwerpunktbereich kann Teilprojekte enthalten, und jedes Teilprojekt fuhrt eine eigene Aufgabenliste.
- **Tagesplaner**: Aufgaben aus beliebigen Schwerpunktbereichen konnen bestimmten Tagen zugewiesen und die tagliche Arbeitsbelastung uberpruft werden.
- **Kalender**: Geplante Aufgaben konnen in einer Monats- oder Wochenansicht eingesehen werden. Die Navigation zu einer beliebigen Woche oder einem beliebigen Monat ist direkt moglich.
- **Aufgabenverwaltung**: Aufgaben konnen erstellt, abgeschlossen, neu geordnet und geloscht werden. Aufgaben konnen einem oder mehreren Terminen zugewiesen werden.
- **Drag and Drop**: Schwerpunktbereiche und Aufgaben konnen per Drag-and-Drop neu angeordnet werden.

### Technologie-Stack

| Ebene | Technologie |
|---|---|
| Framework | Angular 21 (Standalone-Komponenten) |
| Server-seitiges Rendering | @angular/ssr, Express |
| Styling | CSS (Komponenten-spezifisch) |
| Zustandsverwaltung | Angular Signals |
| HTTP | Angular HttpClient, RxJS |
| Backend (lokal) | Node.js, Express, SQL.js (SQLite) |
| Bereitstellung | Netlify |

### Funktionsweise im Online-Betrieb

Die Anwendung ist auf Netlify bereitgestellt. In dieser Umgebung ist kein Backend-Server verfugbar. Die Anwendung erkennt dies automatisch beim Start: Wenn die API unter `localhost:3000` nicht erreichbar ist, wechselt die Datenschicht auf `localStorage`. Alle Aufgaben- und Schwerpunktbereichsdaten werden dann direkt im Browser gespeichert und gelesen.

Das bedeutet, dass die Online-Version als vollstandig eigenstandige Client-Anwendung funktioniert, deren Daten lokal im Browser des Nutzers gespeichert werden.

**Live-URL**: Bereitgestellt uber Netlify (konfiguriert in `netlify.toml`)

### Funktionsweise im lokalen Betrieb

Bei lokalem Betrieb wird neben dem Angular-Entwicklungsserver ein separater Backend-Server gestartet. Das Backend ist eine Express.js-REST-API, die SQL.js verwendet, um eine SQLite-Datenbank als Binardatei im lokalen Dateisystem zu betreiben.

Der `TaskStoreService` versucht beim Start, eine Verbindung zum Backend herzustellen. Wenn das Backend verfugbar ist, erfolgen alle Lese- und Schreibvorgange uber die REST-API, was eine sitzungsubergreifende dauerhafte Speicherung ohne Browserabhangigkeit ermoglicht.

Das Backend ist nicht in diesem Repository enthalten.

#### Frontend starten

```bash
npm install
npm start
```

Die Anwendung ist unter `http://localhost:4200` verfugbar.

#### Backend starten (nur lokal, nicht in diesem Repository enthalten)

```bash
cd backend
npm install
npm start
```

Der API-Server startet unter `http://localhost:3000`. Die folgenden Endpunkte stehen zur Verfugung:

```
GET    /api/health
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/focus-areas
POST   /api/focus-areas
PUT    /api/focus-areas/reorder
DELETE /api/focus-areas/:name
POST   /api/migrate
```

### Projektstruktur

```
src/
  app/
    add-task/              Formular zur Aufgabenerstellung und Startseite
    calendar/              Monats- und Wochenkalenderansichten
    day-planner/           Tagesansicht fur Aufgabenzuweisung
    focus-areas/           Verwaltung von Schwerpunktbereichen und Teilprojekten
    task/                  Einzelne Aufgabenkomponente
    api.service.ts         HTTP-Client fur die Backend-REST-API
    task-store.service.ts  Zentrale Zustandsverwaltung mit Angular Signals
  task.model.ts            Kern-Datenmodell
backend/                   Lokaler Express + SQLite Server (nicht im Repository)
```

### Datenfluss

```
Start
  |
  |-- Verbindung zum Backend versuchen (localhost:3000)
        |
        |-- Erfolg --> Aufgaben und Schwerpunktbereiche aus SQLite per REST-API laden
        |
        |-- Fehler --> Aufgaben und Schwerpunktbereiche aus localStorage laden
```

Alle nachfolgenden Lese- und Schreibvorgange folgen demselben Pfad: Backend wenn verfugbar, localStorage wenn nicht.

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
