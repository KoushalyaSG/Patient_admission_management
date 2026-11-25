# Patient Admission Management System

## Project Description

The Patient Admission Management System is a web-based application designed to help hospital staff efficiently manage admitted patients and maintain their records.

The application provides an easy-to-use interface where hospital staff can add new patients, view patient details, update information, search records, and manage patient admission and discharge statuses.

The frontend is developed using **React.js**, the backend is developed using **Python FastAPI**, and **SQLite** is used as the database to store patient information permanently, even after the server restarts.

## Key Features

- **Add Patients:** Register new patients by entering their personal and admission details.
- **View Patients:** Display all admitted and discharged patient records.
- **Search Patients:** Find patients quickly using their names.
- **Filter Patients:** Filter records by ward, department, and doctor.
- **Edit Patient Details:** Update existing patient information.
- **Delete Patients:** Remove patient records with confirmation.
- **Discharge Patients:** Change a patient's status from Admitted to Discharged.
- **Data Validation:** Validate patient information on both frontend and backend.
- **Responsive Design:** Provide a clean and user-friendly interface for desktop, tablet, and mobile devices.

## Technology Stack

- Frontend: React.js
- Backend: Python FastAPI
- Database: SQLite
- Styling: CSS
- API Communication: REST API using JSON

## Validation

The application includes validation to ensure accurate patient information:

- Patient name is required and must contain letters only.
- Age must be a number between 0 and 120.
- Gender, ward, department, and doctor are required selections.
- Admission date is required and cannot be a future date.
- The backend independently validates incoming information and returns clear error messages for invalid data.

## Project Objective

The main objective of this project is to simplify hospital patient admission management by providing a centralized, reliable, and user-friendly system for maintaining patient records and managing admission-related activities.

The application aims to reduce manual record management, improve data accuracy, and make patient information easier for hospital staff to access and update.
