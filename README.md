# Query Management Application

## Overview
The Query Management Application is a user-based platform developed to handle queries efficiently. The application supports two types of users: Internal Users and Customer Users. It offers features for raising queries, assigning them, and maintaining a history of resolutions.

---

## Features

### General Features
- **User Authentication**:
  - Sign-up and login functionality.
  - OTP-based verification for email and contact number during sign-up.
  - Password requirements: minimum 8 characters.

### Sign-Up Fields
- First Name
- Last Name
- Email ID
- Contact Number
- Password
- User Type (Dropdown: Internal, Customer)
- OTP (separate for email and contact number, both must match for successful sign-up).

---

### Customer User Features
1. **Raise a Query**:
   - Fields:
     - Query Number (auto-generated)
     - Title
     - Subject
     - Query To
     - Priority (Dropdown: Low, Medium, High)
     - Description
     - Attachment
     - Submit Button
2. **List of Queries**:
   - View all raised queries.
   - Check the status of queries (Pending, Resolved).

---

### Internal User Features
1. **View and Assign Queries**:
   - Fields:
     - Serial Number
     - Query Number
     - Date of Query Raised
     - Subject
     - Query To
     - Query Resolution Date
     - Status
2. **Query History**:
   - Maintain a record of all actions and resolutions associated with each query.

---

## Technologies Used

### Backend
- **Django**:
  - Handles server-side logic and API development.

### Database
- **PostgreSQL**:
  - Used for storing user and query data.

### Frontend
- **ReactJS**:
  - Implements user interfaces.
  - API calls are made using the `fetch` method (not Axios).

---

## Installation and Setup

### Prerequisites
- Python 3.x
- Node.js
- PostgreSQL

### Backend Setup
1. Clone the repository.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the database in `settings.py`.
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

---

## Usage
1. Sign up using the required fields and OTP verification.
2. Log in as either an Internal User or Customer User.
3. Customer Users can raise queries and view their status.
4. Internal Users can view, assign, and resolve queries.

---

## Contributing
Contributions are welcome! Please create a pull request with your proposed changes.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
