# BudgetTrackr - Complete Budget Management System

A modern, responsive Budget Management System featuring a beautiful glassmorphism frontend and a robust FastAPI backend with SQLite storage.

## 🚀 Quick Start

### Frontend (Browser-based)
1. Open `frontend/index.html` in your web browser
2. Start managing your budgets immediately!

### Backend (Optional)
```bash
cd backend
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 4000
```

## 📁 Project Structure

```
BudgetTrackr/
├── frontend/                 # Frontend application
│   ├── index.html           # Main HTML structure
│   ├── styles.css           # Glassmorphism CSS styles
│   ├── app.js              # JavaScript functionality
│   ├── apiService.js       # API integration service
│   └── config.js           # Configuration settings
├── backend/                 # Backend API server
│   ├── app/                # FastAPI application
│   │   ├── __init__.py
│   │   ├── main.py         # Main FastAPI app
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── crud.py         # Database operations
│   │   ├── database.py     # Database configuration
│   │   ├── deps.py         # Dependencies
│   │   └── routers/        # API route handlers
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
└── README.md               # This comprehensive guide
```

---

## 🎨 Frontend Features

### **Glassmorphism Design**
- Translucent glass panels with backdrop blur effects
- Soft shadows and rounded corners
- Smooth hover animations and transitions
- Three theme options: Glass, Light, and Dark

### **Dashboard Module**
- Personalized greeting with time-based messages
- Summary cards showing total budgeted amount, categories, and upcoming budgets
- Interactive line chart with weekly/monthly period switching
- Activity statistics with trend analysis

### **Budget Management**
- Create, edit, and delete budgets
- Support for multiple currencies (GHS, USD, EUR)
- Category-based organization
- Date-based filtering and search functionality
- Responsive table with glass-styled rows

### **Reports & Analytics**
- Pie chart showing budget distribution by category
- Bar chart displaying monthly budget trends
- Line chart tracking cumulative budget growth
- Insightful summaries below each chart

### **Settings & Preferences**
- Default currency selection
- Theme switching (Glass/Light/Dark)
- Category management (add/edit/delete)
- Data export/import functionality

### **Right Info Panel**
- User profile display
- Interactive calendar with budget indicators
- Upcoming budgets schedule
- Collapsible on smaller screens

### **Search & Filtering**
- Real-time search across budget names, categories, and descriptions
- Category-based filtering
- Date-based filtering
- Calendar day click filtering

---

## 🔧 Backend Features

### **RESTful API Endpoints**
- `GET    /api/health` - Health check
- `GET    /api/budgets` - Retrieve all budgets
- `POST   /api/budgets` - Create new budget
- `PUT    /api/budgets/{id}` - Update existing budget
- `DELETE /api/budgets/{id}` - Delete budget
- `GET    /api/categories` - Retrieve all categories
- `POST   /api/categories` - Create new category
- `DELETE /api/categories/{name}` - Delete category
- `GET    /api/settings` - Retrieve user settings
- `PUT    /api/settings` - Update user settings

### **Database Schema**
- **Budget**: id (str), name, amount, currency, category, description?, budgetDate, effectiveDate, createdAt, updatedAt
- **Category**: name (str)
- **Settings**: id=1, defaultCurrency, theme

### **Technology Stack**
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping library
- **SQLite**: Lightweight, serverless database
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server for running FastAPI applications

---

## 🎯 Usage Guide

### **Frontend Usage**

#### Adding Your First Budget
1. Click the "+" button in the top bar
2. Fill in the budget details:
   - **Name**: Descriptive name for your budget
   - **Amount**: Budget amount
   - **Currency**: Select from GHS, USD, or EUR
   - **Category**: Choose from existing categories or create new ones
   - **Description**: Optional details about the budget
   - **Budget Date**: When the budget was created
   - **Effective Date**: When the budget becomes active
3. Click "Save Budget"

#### Managing Categories
1. Go to Settings → Categories
2. Click "Add Category" to create new categories
3. Use the delete button to remove unused categories
4. Note: Categories in use cannot be deleted

#### Switching Themes
1. Go to Settings → Preferences
2. Choose between Glass, Light, or Dark themes
3. Your preference is automatically saved

#### Exporting/Importing Data
1. **Export**: Go to Settings → Data Management → Export Data
2. **Import**: Go to Settings → Data Management → Import Data
3. Select a previously exported JSON file

### **Backend Integration**

#### Enable Backend API
1. In the app Settings (inside the running UI):
   - Toggle "Use Backend API"
   - Set "API Base URL" (e.g., http://localhost:4000)
   - Click "Save API Settings"

#### API Contract
The frontend expects the following API structure:

**Budget Endpoints:**
- `GET /api/budgets` → Returns array of Budget objects
- `POST /api/budgets` → Accepts BudgetInput, returns Budget with ID
- `PUT /api/budgets/:id` → Accepts BudgetInput, returns updated Budget
- `DELETE /api/budgets/:id` → Returns 204/200 on success

**Category Endpoints:**
- `GET /api/categories` → Returns array of category names
- `POST /api/categories` → Accepts { name }, returns 201/200
- `DELETE /api/categories/:name` → Returns 204/200 on success

**Settings Endpoints:**
- `GET /api/settings` → Returns { defaultCurrency, theme }
- `PUT /api/settings` → Accepts { defaultCurrency?, theme? }, returns 200

**Data Types:**
```typescript
Budget: {
  id: string,
  name: string,
  amount: number,
  currency: 'GHS' | 'USD' | 'EUR',
  category: string,
  description?: string,
  budgetDate: string, // YYYY-MM-DD
  effectiveDate: string, // YYYY-MM-DD
  createdAt: string, // ISO timestamp
  updatedAt: string // ISO timestamp
}

BudgetInput: Same as Budget without id, createdAt, updatedAt
```

---

## 🎨 Design System

### **Color Palette**
- **Primary**: #FF8A3D (Orange)
- **Secondary**: #6C8CF5 (Blue)
- **Success**: #21C776 (Green)
- **Warning**: #FFC447 (Yellow)
- **Danger**: #FF5D5D (Red)

### **Typography**
- **Headlines**: 28-34px, semi-bold
- **Body Text**: 14-16px
- **System Font Stack**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

### **Glassmorphism Elements**
- **Background**: `rgba(255, 255, 255, 0.12)`
- **Backdrop Filter**: `blur(12px)`
- **Border Radius**: 24px (cards), 28px (containers), 12px (chips)
- **Shadows**: `0 10px 30px rgba(0, 0, 0, 0.2)`

---

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: 480px and below
- **Tablet**: 768px and below
- **Desktop**: 1024px and below
- **Large Desktop**: 1440px and below

### **Mobile Features**
- Collapsible sidebar
- Stacked layouts for small screens
- Touch-friendly interactions
- Optimized form layouts

---

## 🔧 Technical Details

### **Frontend Technologies**
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Grid, Flexbox, Custom Properties, Animations
- **Vanilla JavaScript**: ES6+ classes, modules, localStorage
- **Chart.js**: Interactive charts and visualizations
- **Font Awesome**: Icon library

### **Backend Technologies**
- **Python 3.10+**: Core runtime
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM and database toolkit
- **SQLite**: Database engine
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### **Browser Support**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### **Performance Features**
- Lazy chart initialization
- Debounced search functionality
- Efficient DOM manipulation
- LocalStorage for data persistence
- FastAPI async performance

---

## 🎭 Theme System

### **Glass Theme (Default)**
- Translucent backgrounds with backdrop blur
- Subtle borders and shadows
- Dark text on light backgrounds

### **Light Theme**
- Clean white backgrounds
- Dark text and borders
- Minimal shadows and effects

### **Dark Theme**
- Dark backgrounds with light text
- High contrast elements
- Subtle glow effects

---

## 📊 Data Model

### **Frontend Data Structure**
```json
{
  "id": "unique_id",
  "name": "Budget Name",
  "amount": 450.00,
  "currency": "GHS",
  "category": "Food",
  "description": "Optional description",
  "budgetDate": "2025-01-01",
  "effectiveDate": "2025-01-05",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### **Backend Database**
- **SQLite Database**: `backend/budgettrackr.db`
- **Local Storage Key**: `budgetTrackr_v1` (frontend fallback)
- **Data Persistence**: Survives browser sessions and server restarts

---

## 🚀 Development Setup

### **Frontend Development**
1. Clone the repository
2. Open `frontend/index.html` in your browser
3. Make changes to CSS/JS files
4. Refresh browser to see changes

### **Backend Development**
1. Navigate to backend directory
2. Create virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell
   . .venv/Scripts/Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 4000
   ```

### **Full Stack Development**
1. Start backend server (see Backend Development above)
2. Open frontend in browser
3. Enable backend API in frontend settings
4. Set API URL to `http://localhost:4000`

---

## 🔌 API Integration

### **CORS Configuration**
Backend CORS is permissive for common localhost origins. Adjust in `app/main.py` for production.

### **Data Flow**
- When API is enabled, frontend reads/writes via API
- LocalStorage serves as fallback cache
- Real-time synchronization between frontend and backend

---

## 🚀 Future Enhancements

### **Planned Features**
- Budget notifications and reminders
- Advanced reporting and analytics
- Data visualization improvements
- Mobile app version
- Cloud synchronization
- Multi-user support
- Real-time collaboration
- Advanced security features

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👥 Development Team

**TechNova**
- **Alice Johnson** - Frontend Developer
- **Sarah Lee** - UI/UX Designer
- **Maria Lopez** - Coordinator & Video Presenter

---

**BudgetTrackr** - Where beautiful design meets robust backend architecture! 🎨💰🚀


