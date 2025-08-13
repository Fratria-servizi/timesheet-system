import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Button,
  Alert
} from '@mui/material';

const CompanyFeatures = () => {
  const [features, setFeatures] = useState({
    login: true,
    calendar: false,
    timeTracking: true,
    breaks: false,
    leave: true,
    permissions: false,
    medical: false
  });
  const [success, setSuccess] = useState('');

  const handleFeatureChange = (feature) => (event) => {
    setFeatures({
      ...features,
      [feature]: event.target.checked
    });
  };

  const handleSave = async () => {
    // TODO: Implement feature saving
    setSuccess('Funzionalità salvate con successo!');
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestione Funzionalità Azienda
        </Typography>
        
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={features.login} onChange={handleFeatureChange('login')} />}
            label="Login Dipendenti"
          />
          <FormControlLabel
            control={<Checkbox checked={features.calendar} onChange={handleFeatureChange('calendar')} />}
            label="Calendario"
          />
          <FormControlLabel
            control={<Checkbox checked={features.timeTracking} onChange={handleFeatureChange('timeTracking')} />}
            label="Entrata/Uscita"
          />
          <FormControlLabel
            control={<Checkbox checked={features.breaks} onChange={handleFeatureChange('breaks')} />}
            label="Pause"
          />
          <FormControlLabel
            control={<Checkbox checked={features.leave} onChange={handleFeatureChange('leave')} />}
            label="Ferie e Permessi"
          />
          <FormControlLabel
            control={<Checkbox checked={features.permissions} onChange={handleFeatureChange('permissions')} />}
            label="Permessi 104"
          />
          <FormControlLabel
            control={<Checkbox checked={features.medical} onChange={handleFeatureChange('medical')} />}
            label="Malattia"
          />
        </Box>

        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ mt: 3 }}
        >
          Salva Funzionalità
        </Button>
      </Paper>
    </Container>
  );
};

export default CompanyFeatures; 