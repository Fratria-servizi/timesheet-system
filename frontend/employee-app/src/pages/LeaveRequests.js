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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const LeaveRequests = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    days: ''
  });

  // Carica le richieste esistenti
  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(API_ENDPOINTS.LEAVE_REQUESTS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setLeaveRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Errore nel caricamento richieste:', error);
      setSnackbar({
        open: true,
        message: 'Errore nel caricamento richieste',
        severity: 'error'
      });
    }
  };

  const handleOpenDialog = (request = null) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        days: request.days
      });
    } else {
      setEditingRequest(null);
      setFormData({
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
        days: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
    setFormData({
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      days: ''
    });
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason || !formData.days) {
      setSnackbar({
        open: true,
        message: 'Compila tutti i campi obbligatori',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.post(API_ENDPOINTS.CREATE_LEAVE_REQUEST, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
        
        handleCloseDialog();
        loadLeaveRequests(); // Ricarica la lista
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Errore durante il salvataggio',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa richiesta?')) {
      try {
        // TODO: Implementa endpoint per eliminazione
        setSnackbar({
          open: true,
          message: 'Richiesta eliminata!',
          severity: 'success'
        });
        loadLeaveRequests();
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Errore durante l\'eliminazione',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approvata': return 'success';
      case 'In Attesa': return 'warning';
      case 'Rifiutata': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Richieste Ferie e Permessi
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuova Richiesta
        </Button>
      </Box>

      {/* Tabella Richieste */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Data Inizio</TableCell>
                <TableCell>Data Fine</TableCell>
                <TableCell>Giorni</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell align="center">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{new Date(request.startDate).toLocaleDateString('it-IT')}</TableCell>
                  <TableCell>{new Date(request.endDate).toLocaleDateString('it-IT')}</TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status} 
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Button 
                        size="small" 
                        startIcon={<Edit />}
                        onClick={() => handleOpenDialog(request)}
                        color="primary"
                      >
                        Modifica
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<Delete />}
                        onClick={() => handleDelete(request.id)}
                      >
                        Elimina
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog per creare/modificare richiesta */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRequest ? 'Modifica Richiesta' : 'Nuova Richiesta'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo"
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <MenuItem value="Ferie">Ferie</MenuItem>
                  <MenuItem value="Permesso">Permesso</MenuItem>
                  <MenuItem value="Malattia">Malattia</MenuItem>
                  <MenuItem value="104">Permesso 104</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giorni"
                type="number"
                value={formData.days}
                onChange={(e) => setFormData({...formData, days: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data Inizio"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data Fine"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo"
                multiline
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Salvataggio...' : (editingRequest ? 'Aggiorna' : 'Crea')}
          </Button>
        </DialogActions>
      </Dialog>

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

export default LeaveRequests; 