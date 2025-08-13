import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  PlayArrow, 
  Stop, 
  Pause, 
  History
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const TimeTracking = () => {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState('Non Presente');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRecords, setTimeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Aggiorna l'ora ogni secondo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Carica i dati iniziali
  useEffect(() => {
    loadTimeRecords();
    loadCurrentStatus();
  }, []);

  const loadTimeRecords = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(API_ENDPOINTS.TIME_RECORDS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTimeRecords(response.data.records);
      }
    } catch (error) {
      console.error('Errore nel caricamento time records:', error);
    }
  };

  const loadCurrentStatus = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(API_ENDPOINTS.DASHBOARD, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCurrentStatus(response.data.data.currentStatus);
      }
    } catch (error) {
      console.error('Errore nel caricamento stato:', error);
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
          setCurrentStatus('In Ufficio');
        } else if (action === 'exit') {
          setCurrentStatus('Non Presente');
        } else if (action === 'break') {
          setCurrentStatus('In Pausa');
        }
        
        // Ricarica i dati
        setTimeout(() => {
          loadTimeRecords();
          loadCurrentStatus();
        }, 1000);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completo': return 'success';
      case 'In Corso': return 'warning';
      case 'Incompleto': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Time Tracking
      </Typography>

      {/* Orologio e Stato Attuale */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ora Attuale
              </Typography>
              <Typography variant="h2" color="primary">
                {currentTime.toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stato Attuale
              </Typography>
              <Chip 
                label={currentStatus} 
                color={currentStatus === 'In Ufficio' ? 'success' : 
                       currentStatus === 'In Pausa' ? 'warning' : 'default'}
                size="large"
                sx={{ fontSize: '1.2rem', padding: '8px' }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Azioni Time Tracking */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Azioni Time Tracking
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
              disabled={loading || currentStatus === 'In Ufficio'}
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
              disabled={loading || currentStatus === 'Non Presente'}
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
              disabled={loading || currentStatus === 'Non Presente'}
            >
              Uscita
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Storico Time Records */}
      <Paper elevation={3}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Storico Time Records
            </Typography>
            <Button startIcon={<History />} onClick={loadTimeRecords}>
              Aggiorna
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Entrata</TableCell>
                <TableCell>Uscita</TableCell>
                <TableCell>Pause</TableCell>
                <TableCell>Totale</TableCell>
                <TableCell>Stato</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.date).toLocaleDateString('it-IT')}</TableCell>
                  <TableCell>{record.entry}</TableCell>
                  <TableCell>{record.exit}</TableCell>
                  <TableCell>{record.breaks}</TableCell>
                  <TableCell>{record.total}</TableCell>
                  <TableCell>
                    <Chip 
                      label={record.status} 
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

export default TimeTracking; 