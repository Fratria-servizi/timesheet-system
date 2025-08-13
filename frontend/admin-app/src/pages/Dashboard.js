import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, companiesResponse] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/companies')
      ]);

      setStats(statsResponse.data);
      setRecentCompanies(companiesResponse.data.slice(0, 5)); // Ultime 5 aziende
    } catch (error) {
      console.error('Errore nel caricamento dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color = 'primary.main' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color: 'white', fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Panoramica del sistema timesheet
      </Typography>

      {/* Statistiche principali */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aziende Attive"
            value={stats?.active_companies || 0}
            icon={<BusinessIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dipendenti Totali"
            value={stats?.total_employees || 0}
            icon={<PeopleIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Utenti Admin"
            value={stats?.admin_users || 0}
            icon={<AdminIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Utenti Azienda"
            value={stats?.company_users || 0}
            icon={<TrendingIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Contenuto principale */}
      <Grid container spacing={3}>
        {/* Aziende recenti */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aziende Recenti
            </Typography>
            <List>
              {recentCompanies.map((company) => (
                <ListItem key={company.id} divider>
                  <ListItemIcon>
                    <BusinessIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={company.name}
                    secondary={`${company.employee_count || 0} dipendenti • ${company.enabled_features_count || 0} funzionalità`}
                  />
                  <Chip
                    label={company.status}
                    color={company.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Attività recenti */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Attività Recenti
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Sistema operativo"
                  secondary="Tutte le funzionalità funzionano correttamente"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Database connesso"
                  secondary="Connessione PostgreSQL attiva"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Backup consigliato"
                  secondary="Ultimo backup: 2 giorni fa"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Azioni Rapide
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Chip
              label="Nuova Azienda"
              color="primary"
              variant="outlined"
              clickable
              onClick={() => window.location.href = '/companies/new'}
            />
          </Grid>
          <Grid item>
            <Chip
              label="Gestione Funzionalità"
              color="secondary"
              variant="outlined"
              clickable
            />
          </Grid>
          <Grid item>
            <Chip
              label="Report Sistema"
              color="info"
              variant="outlined"
              clickable
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard; 