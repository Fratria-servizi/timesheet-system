import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hireDate: '',
    salary: '',
    status: 'active'
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      // TODO: Carica dati dipendente esistente
      setFormData({
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@azienda.com',
        phone: '+39 123 456 789',
        position: 'Sviluppatore',
        department: 'IT',
        hireDate: '2024-01-15',
        salary: '35000',
        status: 'active'
      });
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implementa chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula API call
      
      setSuccess(isEditing ? 'Dipendente aggiornato con successo!' : 'Dipendente creato con successo!');
      setTimeout(() => navigate('/employees'), 1500);
    } catch (error) {
      setError('Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/employees')}
            sx={{ mr: 2 }}
          >
            Indietro
          </Button>
          <Typography variant="h4">
            {isEditing ? 'Modifica Dipendente' : 'Nuovo Dipendente'}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cognome"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefono"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Posizione"
                  value={formData.position}
                  onChange={handleChange('position')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reparto"
                  value={formData.department}
                  onChange={handleChange('department')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data Assunzione"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleChange('hireDate')}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stipendio"
                  value={formData.salary}
                  onChange={handleChange('salary')}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Stato</InputLabel>
                  <Select
                    value={formData.status}
                    label="Stato"
                    onChange={handleChange('status')}
                  >
                    <MenuItem value="active">Attivo</MenuItem>
                    <MenuItem value="inactive">Inattivo</MenuItem>
                    <MenuItem value="suspended">Sospeso</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                size="large"
              >
                {loading ? 'Salvataggio...' : (isEditing ? 'Aggiorna' : 'Crea')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/employees')}
                disabled={loading}
                size="large"
              >
                Annulla
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmployeeForm; 