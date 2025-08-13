import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Chip
} from '@mui/material';
import { Download, FilterList, Visibility } from '@mui/icons-material';

const TimeRecords = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2025-08-13');

  const timeRecords = [
    { id: 1, employee: 'Mario Rossi', date: '2025-08-13', entry: '09:00', exit: '18:00', breaks: '1h', total: '8h', status: 'Completo' },
    { id: 2, employee: 'Anna Bianchi', date: '2025-08-13', entry: '08:30', exit: '17:30', breaks: '1h', total: '8h', status: 'Completo' },
    { id: 3, employee: 'Luca Verdi', date: '2025-08-13', entry: '09:15', exit: '18:15', breaks: '1h', total: '8h', status: 'Completo' },
    { id: 4, employee: 'Giulia Neri', date: '2025-08-13', entry: '09:00', exit: '', breaks: '', total: '', status: 'In Corso' }
  ];

  const employees = [
    { id: 'all', name: 'Tutti i dipendenti' },
    { id: '1', name: 'Mario Rossi' },
    { id: '2', name: 'Anna Bianchi' },
    { id: '3', name: 'Luca Verdi' },
    { id: '4', name: 'Giulia Neri' }
  ];

  const handleExportExcel = () => {
    // TODO: Implementa export Excel
    alert('Export Excel in corso...');
  };

  const handleViewDetails = (id) => {
    // TODO: Implementa visualizzazione dettagli
    alert(`Visualizza dettagli record ${id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completo': return 'success';
      case 'In Corso': return 'warning';
      case 'Incompleto': return 'error';
      default: return 'default';
    }
  };

  const filteredRecords = selectedEmployee === 'all' 
    ? timeRecords 
    : timeRecords.filter(record => record.employee === employees.find(emp => emp.id === selectedEmployee)?.name);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Time Records
        </Typography>
        <Button variant="contained" startIcon={<Download />} onClick={handleExportExcel}>
          Export Excel
        </Button>
      </Box>

      {/* Filtri */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Dipendente</InputLabel>
              <Select
                value={selectedEmployee}
                label="Dipendente"
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Data"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />}
              fullWidth
            >
              Applica Filtri
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Statistiche */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {filteredRecords.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Record Totali
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {filteredRecords.filter(r => r.status === 'Completo').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completati
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {filteredRecords.filter(r => r.status === 'In Corso').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Corso
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {filteredRecords.reduce((sum, r) => sum + (r.total ? parseFloat(r.total) : 0), 0)}h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ore Totali
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tabella Time Records */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dipendente</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Entrata</TableCell>
                <TableCell>Uscita</TableCell>
                <TableCell>Pause</TableCell>
                <TableCell>Totale</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell align="center">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.employee}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString('it-IT')}</TableCell>
                  <TableCell>{record.entry}</TableCell>
                  <TableCell>{record.exit || '-'}</TableCell>
                  <TableCell>{record.breaks || '-'}</TableCell>
                  <TableCell>{record.total || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={record.status} 
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      size="small" 
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(record.id)}
                    >
                      Dettagli
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default TimeRecords; 