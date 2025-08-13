import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Schedule, 
  AccessTime, 
  EventNote, 
  TrendingUp,
  PlayArrow,
  Stop,
  Pause
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayHours: '0',
    weekHours: '0',
    monthHours: '0',
    currentStatus: 'Non Presente',
    lastEntry: null,
    lastExit: null
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(API_ENDPOINTS.DASHBOARD, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Errore nel caricamento dashboard:', error);
    }
  };

  const handleTimeAction = async (action) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.post(API_ENDPOINTS.TIME_ENTRY, {
        action
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
        
        // Aggiorna lo stato locale
        if (action === 'entry') {
          setDashboardData(prev => ({ ...prev, currentStatus: 'In Ufficio', lastEntry: response.data.time }));
        } else if (action === 'exit') {
          setDashboardData(prev => ({ ...prev, currentStatus: 'Non Presente', lastExit: response.data.time }));
        } else if (action === 'break') {
          setDashboardData(prev => ({ ...prev, currentStatus: 'In Pausa' }));
        }
        
        // Ricarica i dati della dashboard
        setTimeout(() => loadDashboardData(), 1000);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Errore durante la registrazione',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Dipendente
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Benvenuto, {user?.username || 'Dipendente'}!
      </Typography>

      {/* Azioni Rapide */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Azioni Rapide
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<PlayArrow />}
              onClick={() => handleTimeAction('entry')}
              size="large"
              disabled={loading || dashboardData.currentStatus === 'In Ufficio'}
            >
              Entrata
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              startIcon={<Pause />}
              onClick={() => handleTimeAction('break')}
              size="large"
              disabled={loading || dashboardData.currentStatus === 'Non Presente'}
            >
              Pausa
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={() => handleTimeAction('exit')}
              size="large"
              disabled={loading || dashboardData.currentStatus === 'Non Presente'}
            >
              Uscita
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistiche */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.todayHours}h</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Oggi
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccessTime sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.weekHours}h</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Questa Settimana
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.monthHours}h</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Questo Mese
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventNote sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.currentStatus}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stato Attuale
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ultime Attività */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ultime Attività
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Ultima Entrata:</strong> {dashboardData.lastEntry || 'Non registrata'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Ultima Uscita:</strong> {dashboardData.lastExit || 'Non registrata'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar per notifiche */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard; 