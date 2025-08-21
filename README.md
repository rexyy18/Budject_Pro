# BudgetTrackr - Glassmorphism Dashboard

A modern, responsive Budget Management System built with HTML, CSS, and Vanilla JavaScript featuring a beautiful glassmorphism design.

## ✨ Features

### 🎨 **Glassmorphism Design**
- Translucent glass panels with backdrop blur effects
- Soft shadows and rounded corners
- Smooth hover animations and transitions
- Three theme options: Glass, Light, and Dark

### 📊 **Dashboard Module**
- Personalized greeting with time-based messages
- Summary cards showing total budgeted amount, categories, and upcoming budgets
- Interactive line chart with weekly/monthly period switching
- Activity statistics with trend analysis

### 💰 **Budget Management**
- Create, edit, and delete budgets
- Support for multiple currencies (GHS, USD, EUR)
- Category-based organization
- Date-based filtering and search functionality
- Responsive table with glass-styled rows

### 📈 **Reports & Analytics**
- Pie chart showing budget distribution by category
- Bar chart displaying monthly budget trends
- Line chart tracking cumulative budget growth
- Insightful summaries below each chart

### ⚙️ **Settings & Preferences**
- Default currency selection
- Theme switching (Glass/Light/Dark)
- Category management (add/edit/delete)
- Data export/import functionality

### 📅 **Right Info Panel**
- User profile display
- Interactive calendar with budget indicators
- Upcoming budgets schedule
- Collapsible on smaller screens

### 🔍 **Search & Filtering**
- Real-time search across budget names, categories, and descriptions
- Category-based filtering
- Date-based filtering
- Calendar day click filtering

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- No build tools or frameworks required

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start managing your budgets!

### File Structure
```
BudgetTrackr/
├── index.html          # Main HTML structure
├── styles.css          # Glassmorphism CSS styles
├── app.js             # JavaScript functionality
└── README.md          # This documentation
```

## 🎯 Usage Guide

### Adding Your First Budget
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

### Managing Categories
1. Go to Settings → Categories
2. Click "Add Category" to create new categories
3. Use the delete button to remove unused categories
4. Note: Categories in use cannot be deleted

### Switching Themes
1. Go to Settings → Preferences
2. Choose between Glass, Light, or Dark themes
3. Your preference is automatically saved

### Exporting/Importing Data
1. **Export**: Go to Settings → Data Management → Export Data
2. **Import**: Go to Settings → Data Management → Import Data
3. Select a previously exported JSON file

## 🎨 Design System

### Color Palette
- **Primary**: #FF8A3D (Orange)
- **Secondary**: #6C8CF5 (Blue)
- **Success**: #21C776 (Green)
- **Warning**: #FFC447 (Yellow)
- **Danger**: #FF5D5D (Red)

### Typography
- **Headlines**: 28-34px, semi-bold
- **Body Text**: 14-16px
- **System Font Stack**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

### Glassmorphism Elements
- **Background**: `rgba(255, 255, 255, 0.12)`
- **Backdrop Filter**: `blur(12px)`
- **Border Radius**: 24px (cards), 28px (containers), 12px (chips)
- **Shadows**: `0 10px 30px rgba(0, 0, 0, 0.2)`

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 480px and below
- **Tablet**: 768px and below
- **Desktop**: 1024px and below
- **Large Desktop**: 1440px and below

### Mobile Features
- Collapsible sidebar
- Stacked layouts for small screens
- Touch-friendly interactions
- Optimized form layouts

## 🔧 Technical Details

### Technologies Used (Frontend Only)
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Grid, Flexbox, Custom Properties, Animations
- **Vanilla JavaScript**: ES6+ classes, modules, localStorage
- **Chart.js**: Interactive charts and visualizations
- **Font Awesome**: Icon library

Note: This project is frontend-only by default and does not include a backend/server. However, it can connect to a backend if provided (see Backend Integration below).

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance Features
- Lazy chart initialization
- Debounced search functionality
- Efficient DOM manipulation
- LocalStorage for data persistence

## 🎭 Theme System

### Glass Theme (Default)
- Translucent backgrounds with backdrop blur
- Subtle borders and shadows
- Dark text on light backgrounds

### Light Theme
- Clean white backgrounds
- Dark text and borders
- Minimal shadows and effects

### Dark Theme
- Dark backgrounds with light text
- High contrast elements
- Subtle glow effects

## 📊 Data Model

### Budget Structure
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

### Local Storage
- **Key**: `budgetTrackr_v1`
- **Data**: Budgets, categories, and user settings
- **Persistence**: Survives browser sessions

## 🚀 Future Enhancements

### Planned Features
- Budget notifications and reminders
- Advanced reporting and analytics
- Data visualization improvements
- Mobile app version
- Cloud synchronization
- Multi-user support

### Contributing
This is a frontend-first application designed for learning and demonstration purposes. No backend is required to run locally, but you can optionally connect to a backend. Feel free to fork and modify for your own projects!

## 🔌 Backend Integration (Optional)

You can connect this UI to a backend API when it becomes available.

1) In the app Settings (inside the running UI):
- Toggle "Use Backend API"
- Set "API Base URL" (e.g., http://localhost:4000)
- Click "Save API Settings"

2) Expected API contract (JSON; with credentials/cookies if any):
- GET /api/budgets → [Budget]
- POST /api/budgets { BudgetInput } → Budget (with id)
- PUT /api/budgets/:id { BudgetInput } → Budget
- DELETE /api/budgets/:id → 204/200
- GET /api/categories → [string | { name: string }]
- POST /api/categories { name } → 201/200
- DELETE /api/categories/:name → 204/200
- GET /api/settings → { defaultCurrency, theme }
- PUT /api/settings { defaultCurrency?, theme? } → 200

Types:
- Budget: { id: string, name: string, amount: number, currency: 'GHS'|'USD'|'EUR', category: string, description?: string, budgetDate: string(YYYY-MM-DD), effectiveDate: string(YYYY-MM-DD), createdAt: ISO, updatedAt: ISO }
- BudgetInput: same as Budget without id/createdAt/updatedAt

Behavior:
- When API is enabled, the app reads/writes via the API and keeps a local cache in localStorage as fallback.

## 📝 License

This project is open source and available under the MIT License.

## 👥 Development Team

**TechNova**
- **Alice Johnson** - Frontend Developer
- **Sarah Lee** - UI/UX Designer
- **Maria Lopez** - Coordinator & Video Presenter

---

**BudgetTrackr** - Where beautiful design meets practical budget management! 🎨💰


