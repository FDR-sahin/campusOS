import express from 'express';

export const apiRouter = express.Router();

// Routes definition for independently deployed backend
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusOS API', campus: 'City University, Bangladesh' });
});

// Auth endpoints
apiRouter.post('/auth/register', (req, res) => {
  res.json({ success: true, message: 'User registration endpoint' });
});

apiRouter.post('/auth/login', (req, res) => {
  res.json({ success: true, message: 'User login endpoint' });
});

// Notices endpoints
apiRouter.get('/notices', (req, res) => {
  res.json({ success: true, data: [] });
});

// Exams endpoints
apiRouter.get('/exams', (req, res) => {
  res.json({ success: true, data: [] });
});

// Events endpoints
apiRouter.get('/events', (req, res) => {
  res.json({ success: true, data: [] });
});

// Resources endpoints
apiRouter.get('/resources', (req, res) => {
  res.json({ success: true, data: [] });
});

// Clubs endpoints
apiRouter.get('/clubs', (req, res) => {
  res.json({ success: true, data: [] });
});
