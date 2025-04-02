import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Проверяем, находимся ли мы на странице входа или регистрации
  const isAuthPage = location.pathname === '/auth' || 
                     location.pathname === '/login' || 
                     location.pathname === '/register';

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Health Tracker
        </Typography>
        {user ? (
          <>
            <Button color="inherit" onClick={() => navigate('/')}>
              Главная
            </Button>
            <Button color="inherit" onClick={() => navigate('/sleep')}>
              Сон
            </Button>
            <Button color="inherit" onClick={() => navigate('/nutrition')}>
              Питание
            </Button>
            <Button color="inherit" onClick={() => navigate('/activity')}>
              Активность
            </Button>
            <Button color="inherit" onClick={() => navigate('/wellbeing')}>
              Самочувствие
            </Button>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Профиль</MenuItem>
              <MenuItem onClick={handleLogout}>Выйти</MenuItem>
            </Menu>
          </>
        ) : (
          !isAuthPage && (
            <Button color="inherit" onClick={() => navigate('/auth')}>
              Войти
            </Button>
          )
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 