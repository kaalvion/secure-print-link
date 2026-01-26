# Secure Print Link

A secure, responsive print management system for enterprise environments.

## 🎯 Key Features

### 🔒 Security Features
- **Single-use View Enforcement**: Documents can only be viewed once
- **Secure Token Generation**: Cryptographically secure job tokens
- **Time-based Expiration**: Automatic cleanup of expired jobs (60-second server-side cleanup)
- **Role-based Access Control**: Different permissions for users and admins
- **Audit Trail**: Complete logging of job views and releases

### 📱 Responsive Design
- **Mobile-first approach** with breakpoints for:
  - Mobile: 0-768px
  - Tablet: 768px-1024px
  - Desktop: 1024px+
- **Collapsible Sidebar**: Auto-collapses on mobile with hamburger menu
- **Touch-friendly controls**: Minimum 44px touch targets
- **Proper scrolling**: No blank pages, content adapts to viewport

### 🔄 Job Lifecycle Enforcement
```
SUBMITTED → PENDING → (VIEW once) → RELEASED → DELETED
                ↘ (EXPIRED) → DELETED
```

- **Strict one-time view**: Button permanently disabled after first view
- **Backend enforcement**: Server-side validation prevents multiple views
- **Automatic cleanup**: Expired jobs deleted from database and file storage
- **No client-side reliance**: All timing handled server-side

### 📊 Data Consistency
- **Single source of truth**: Dashboard and job queue use identical data
- **Real-time synchronization**: All components reflect backend state
- **Stateless architecture**: Server restarts don't lose data integrity
- **API-level validation**: All input validated at the server level

## 🛠️ Technical Implementation

### Frontend Stack
- React with Hooks
- Styled Components for CSS-in-JS
- Responsive design system with mobile-first approach
- Comprehensive error handling and validation

### Backend Stack
- Node.js with Express
- SQLite database with proper indexing
- In-memory expiration metadata for performance
- RESTful API with comprehensive validation

### Security Measures
- Token-based authentication
- Input sanitization and validation
- Secure file handling
- Audit logging for compliance

## 📱 Responsive Breakpoints

| Device | Breakpoint | Features |
|--------|------------|----------|
| Mobile | 0-768px | Hamburger menu, collapsible sidebar, touch targets |
| Tablet | 768px-1024px | Adaptive grid, optimized spacing |
| Desktop | 1024px+ | Full sidebar, multi-column layouts |

## 🚀 Getting Started

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd secure-print-link

# Install dependencies
npm install

# Start development server
npm start

# Start backend server (in separate terminal)
cd server
npm install
npm start
```

### Environment Variables
Create a `.env` file in the server directory:
```env
PORT=4000
MAX_UPLOAD_BYTES=20971520  # 20MB
PUBLIC_BASE_URL=http://localhost:4000
```

## 📋 API Endpoints

### Jobs
- `POST /api/jobs` - Submit new print job
- `GET /api/jobs/:id` - Get job details (single-view enforced)
- `POST /api/jobs/:id/view` - View document (one-time only)
- `POST /api/jobs/:id/release` - Release job for printing
- `POST /api/jobs/:id/complete` - Mark job as completed

### Printers
- `GET /api/printers` - Get all printers
- `POST /api/printers` - Add new printer
- `PUT /api/printers/:id` - Update printer
- `DELETE /api/printers/:id` - Delete printer

## 🔧 Development Guidelines

### Code Structure
```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── pages/          # Page components
├── api/            # API client and utilities
├── utils/          # Utility functions
└── styles/         # Global styles and themes
```

### Responsive Design Principles
1. **Mobile-first**: Start with mobile styles, enhance for larger screens
2. **Flexible grids**: Use CSS Grid and Flexbox for adaptive layouts
3. **Proper breakpoints**: Use standard breakpoints for consistency
4. **Touch considerations**: Ensure adequate touch targets and spacing

### Security Best Practices
1. **Server-side validation**: Never trust client-side validation alone
2. **Input sanitization**: Sanitize all user inputs
3. **Secure tokens**: Use cryptographically secure token generation
4. **Audit logging**: Log all security-relevant actions

## 🧪 Testing

### Manual Testing Checklist
- [ ] Mobile responsiveness (various screen sizes)
- [ ] Single-view enforcement
- [ ] Job expiration and cleanup
- [ ] Cross-browser compatibility
- [ ] Error handling and validation
- [ ] Empty state handling
- [ ] Loading states and indicators

### Automated Testing
```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test
```

## 📈 Performance Considerations

### Frontend
- Code splitting for faster initial loads
- Lazy loading of non-critical components
- Efficient state management with React Context
- Optimized bundle size

### Backend
- Database indexing for performance
- In-memory caching for frequently accessed data
- Efficient file handling and cleanup
- Rate limiting for API endpoints

## 🚨 Security Notes

### ⚠️ Browser Limitations
- **PDF viewing**: Limited to browser-native PDF viewers
- **Office documents**: May require download for full functionality
- **Large files**: Storage limitations in localStorage
- **Cross-origin**: File access restrictions in browsers

### 🔐 Security Measures Implemented
- **Single-view enforcement**: Backend validates view count
- **Token expiration**: Server-side time validation
- **File cleanup**: Automatic deletion of expired files
- **Input validation**: Comprehensive server-side validation
- **Audit trail**: Logging of all actions for compliance

## 📚 Documentation

### Additional Resources
- [API Documentation](docs/api.md)
- [Security Guidelines](docs/security.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and feature requests, please use the GitHub issue tracker.

---

**Secure Print Link** - Enterprise-grade print management with security at its core.