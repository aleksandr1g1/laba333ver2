import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, StyledEngineProvider, CssBaseline } from '@mui/material';
import { GlobalStyles } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import SleepTracker from './components/SleepTracker';
import NutritionTracker from './components/NutritionTracker';
import ActivityTracker from './components/ActivityTracker';
import WellbeingTracker from './components/WellbeingTracker';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          paddingRight: '0 !important',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          zIndex: 2000,
        },
        paper: {
          overflowY: 'visible',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

const inputGlobalStyles = (
  <GlobalStyles
    styles={{
      body: {
        overflowY: 'scroll',
      },
      '.MuiPopover-root': {
        zIndex: 2100,
      },
      '.MuiDialog-root': {
        zIndex: 2000,
      },
    }}
  />
);

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {inputGlobalStyles}
        <AuthProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sleep"
                element={
                  <PrivateRoute>
                    <SleepTracker />
                  </PrivateRoute>
                }
              />
              <Route
                path="/nutrition"
                element={
                  <PrivateRoute>
                    <NutritionTracker />
                  </PrivateRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <PrivateRoute>
                    <ActivityTracker />
                  </PrivateRoute>
                }
              />
              <Route
                path="/wellbeing"
                element={
                  <PrivateRoute>
                    <WellbeingTracker />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
