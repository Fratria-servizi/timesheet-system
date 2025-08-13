import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { Save, Edit, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'Mario',
    lastName: 'Rossi',
    email: 'mario.rossi@azienda.com',
    phone: '+39 123 456 789',
    position: 'Sviluppatore',
    department: 'IT',
    hireDate: '2024-01-15',
    employeeId: 'EMP001'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implementa endpoint per aggiornamento profilo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula API call
      
      setSuccess('Profilo aggiornato con successo!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La nuova password deve essere di almeno 6 caratteri');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordData.newPassword);
      
      if (result.success) {
        setSuccess('Password cambiata con successo!');
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Errore durante il cambio password');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setProfileData({
      ...profileData,
      [field]: event.target.value
    });
  };

  const handlePasswordInputChange = (field) => (event) => {
    setPasswordData({
      ...passwordData,
      [field]: event.target.value
    });
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profilo Dipendente
      </Typography>

      {(success || error) && (
        <Alert 
          severity={success ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={handleCloseSnackbar}
        >
          {success || error}
        </Alert>
      )}

      {/* Informazioni Principali */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              fontSize: '2rem',
              bgcolor: 'primary.main',
              mr: 3
            }}
          >
            {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {profileData.firstName} {profileData.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profileData.position} - {profileData.department}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {profileData.employeeId}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Informazioni Personali</Typography>
          <Box>
            {!editing ? (
              <Button startIcon={<Edit />} onClick={handleEdit}>
                Modifica
              </Button>
            ) : (
              <Box display="flex" gap={1}>
                <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                  Annulla
                </Button>
                <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={loading}>
                  {loading ? 'Salvataggio...' : 'Salva'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nome"
              value={profileData.firstName}
              onChange={handleInputChange('firstName')}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cognome"
              value={profileData.lastName}
              onChange={handleInputChange('lastName')}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileData.email}
              onChange={handleInputChange('email')}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefono"
              value={profileData.phone}
              onChange={handleInputChange('phone')}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Posizione"
              value={profileData.position}
              onChange={handleInputChange('position')}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reparto"
              value={profileData.department}
              onChange={handleInputChange('department')}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Data Assunzione"
              type="date"
              value={profileData.hireDate}
              onChange={handleInputChange('hireDate')}
              disabled={!editing}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Cambio Password */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Sicurezza</Typography>
          <Button 
            startIcon={<Lock />} 
            onClick={() => setShowPasswordChange(!showPasswordChange)}
          >
            Cambia Password
          </Button>
        </Box>

        {showPasswordChange && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password Attuale"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange('currentPassword')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nuova Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange('newPassword')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Conferma Nuova Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange('confirmPassword')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" gap={1} alignItems="flex-end" height="100%">
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowPasswordChange(false)}
                    disabled={loading}
                  >
                    Annulla
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handlePasswordChange}
                    disabled={loading}
                  >
                    {loading ? 'Cambio...' : 'Cambia Password'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Profile; 