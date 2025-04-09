# Backend Structure

```
Backend/
├── config/
│   ├── db.js                     # Database configuration
│   └── mlModel.js               # ML model configuration
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── dashboardController.js   # Dashboard data handling
│   ├── notificationController.js # Notification management
│   ├── periodController.js      # Period tracking logic
│   ├── predictionController.js  # ML predictions
│   ├── recommendationController.js # Recommendations logic
│   ├── recordsController.js     # Health records management
│   ├── reminderController.js    # Reminders handling
│   └── severityController.js    # Severity assessment
├── middleware/
│   ├── authMiddleware.js        # Authentication middleware
│   └── fileUploadMiddleware.js  # File upload handling
├── models/
│   ├── HealthMetric.js         # Health metrics schema
│   ├── Notification.js         # Notification schema
│   ├── OCRResult.js           # OCR results schema
│   ├── Period.js              # Period tracking schema
│   ├── Prediction.js          # Predictions schema
│   ├── Record.js             # Health records schema
│   ├── Reminder.js           # Reminders schema
│   ├── User.js               # User schema
│   └── WellnessTip.js        # Wellness tips schema
├── routes/
│   ├── authRoutes.js          # Authentication routes
│   ├── dashboardRoutes.js     # Dashboard routes
│   ├── notificationRoutes.js  # Notification endpoints
│   ├── periodRoutes.js        # Period tracking routes
│   ├── predictionRoutes.js    # ML prediction routes
│   ├── profile.js            # User profile routes
│   ├── recommendationRoutes.js # Recommendation routes
│   ├── recordRoutes.js       # Health records routes
│   ├── reminderRoutes.js     # Reminder routes
│   └── severityRoutes.js     # Severity assessment routes
├── scripts/
│   └── seedWellnessTips.js   # Database seeding script
├── utils/
│   ├── email.js              # Email utilities
│   ├── mlModel.js           # ML model utilities
│   ├── notificationHelper.js # Notification helpers
│   ├── ocrProcessor.js      # OCR processing utilities
│   └── supabaseClient.js    # Supabase client config
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── eng.traineddata          # OCR training data
├── package.json             # Project dependencies
└── server.js               # Main application entry point

## File Contents Overview

### server.js
- Main Express application setup
- Middleware configuration
- Route registration
- Database connection
- Server initialization

### config/
- `db.js`: Database connection and configuration
- `mlModel.js`: Machine learning model settings

### controllers/
- Business logic for each feature
- Request handling and response formatting
- Data processing and validation

### middleware/
- `authMiddleware.js`: JWT validation and user authentication
- `fileUploadMiddleware.js`: File upload handling and validation

### models/
- Database schemas and models
- Data validation rules
- Model relationships

### routes/
- API endpoint definitions
- Route middleware assignment
- Request validation

### utils/
- Helper functions and utilities
- Email service integration
- ML model utilities
- OCR processing
- Supabase client configuration

### scripts/
- Database seeding scripts
- Utility scripts for development

## Key Features
- Authentication and Authorization
- File Upload Processing
- ML Predictions
- OCR Processing
- Email Notifications
- Health Records Management
- Period Tracking
- Wellness Tips
- User Management
