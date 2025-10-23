# Personal Finance App
A full-stack personal finance application with a Django REST Framework backend and a React frontend. Users can manage categories, transactions, budgets, and view dashboards.

## Features

### Backend (Django REST Framework)
- User authentication and profile management
- CRUD for Categories, Transactions, Budgets
- Transaction summaries and reports
- Dashboard endpoints (total income/expenses, balance, monthly stats, recent transactions)
- Default categories creation
- Search, filter, and ordering support
- Permissions: users can only access their own data
- Caching for summary endpoints

### Frontend (React)
- User login/register/logout
- Dashboard showing balance, monthly stats, and recent transactions
- CRUD UI for categories, transactions, and budgets
- Filters and sorting for transactions
- Responsive design

## Tech Stack

### Backend
- Python 3.x, Django 4.x, Django REST Framework
- SQLite (default) / PostgreSQL (optional for production)

### Frontend
- React 18
- Axios for API requests
- Tailwind CSS for styling
