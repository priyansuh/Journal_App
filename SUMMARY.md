# Journal Application - Project Summary & Documentation

## Overview
A complete, lightweight, and modern **Spring Boot Journal Web Application** integrated with **MongoDB** and featuring a glassmorphic single-page user interface (HTML5, CSS3, JavaScript ES6+).

---

## 📁 Project Architecture & Files

```
c:\JournalAPPForWipro\
├── pom.xml
├── SUMMARY.md
├── src/
│   ├── main/
│   │   ├── java/com/demoLearning/journalApp/
│   │   │   ├── JournalApplication.java
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── journalEntryController.java
│   │   │   │   └── UserController.java
│   │   │   ├── entity/
│   │   │   │   ├── journalEntry.java
│   │   │   │   └── User.java
│   │   │   ├── repository/
│   │   │   │   ├── JournalEntryRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   └── service/
│   │   │       ├── JournalEntryService.java
│   │   │       └── UserService.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── index.html
│   │           ├── css/styles.css
│   │           └── js/app.js
```

---

## 🚀 Key Features

1. **User Management**:
   - Create new users (`userName`, `password`).
   - Switch active user profiles directly from the navigation bar.
   - Fetch and manage isolated journal entries for each specific user.

2. **Journal Entries (CRUD)**:
   - **Create**: Add daily reflections with auto-stamped date and time.
   - **Read / View**: Interactive cards with search filtering & full modal detail view.
   - **Update / Edit**: Modify title and content of existing entries seamlessly.
   - **Delete**: Remove entries with user confirmation.

3. **MongoDB Integration**:
   - Documents mapped to `journal_entries` and `users` collections.
   - Spring Data MongoDB repositories.

4. **Modern UI Design**:
   - Dark glassmorphic visual aesthetic using curated colors and typography (`Inter`, `Outfit`).
   - Live stats dashboard (Total Entries, Active User, Last Activity).
   - Real-time toast notification system.

---

## 🌐 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/user` | Get list of all users |
| `POST` | `/user` | Create a new user |
| `PUT` | `/user/{userName}` | Update user credentials |
| `GET` | `/journal/{userName}` | Get all journal entries for a user |
| `POST` | `/journal/{userName}` | Create a new entry for a user |
| `GET` | `/journal/id/{myId}` | Get journal entry by ID |
| `PUT` | `/journal/id/{userName}/{myId}` | Update entry by ID and username |
| `DELETE` | `/journal/id/{userName}/{myId}` | Delete entry by ID and username |
| `GET` | `/journal/test` | Controller health check |

---

## 🏃 How to Run the Application

1. Ensure **MongoDB** is running locally on `localhost:27017` (or update `application.properties` with your MongoDB URI).
2. Open terminal in `c:\JournalAPPForWipro`:
   ```bash
   mvn spring-boot:run
   ```
3. Open your browser and navigate to:
   **`http://localhost:8080`**
