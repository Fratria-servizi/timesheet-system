import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Download, Assessment, TrendingUp, People } from '@mui/icons-material';

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-08');
  const [selectedYear, setSelectedYear] = useState('2025');

  // Dati di esempio per i report
  const monthlyData = {
    totalHours: 1840,
    averageHours: 8.0,
    presentDays: 23,
    absentDays: 2,
    overtimeHours: 120
  };

  const employeeStats = [
    { name: 'Mario Rossi', hours: 176, status: 'Presente', overtime: 8 },
    { name: 'Anna Bianchi', hours: 168, status: 'Presente', overtime: 0 },
    { name: 'Luca Verdi', hours: 184, status: 'Presente', overtime: 16 },
    { name: 'Giulia Neri', hours: 160, status: 'Assente', overtime: 0 }
  ];

  const handleExportExcel = () => {
    // TODO: Implementa export Excel
    alert('Export Excel in corso...');
  };

  const handleExportPDF = () => {
    // TODO: Implementa export PDF
    alert('Export PDF in corso...');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Report e Analisi
      </Typography>

      {/* Filtri */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Mese</InputLabel>
              <Select
                value={selectedMonth}
                label="Mese"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <MenuItem value="2025-01">Gennaio 2025</MenuItem>
                <MenuItem value="2025-02">Febbraio 2025</MenuItem>
                <MenuItem value="2025-03">Marzo 2025</MenuItem>
                <MenuItem value="2025-04">Aprile 2025</MenuItem>
                <MenuItem value="2025-05">Maggio 2025</MenuItem>
                <MenuItem value="2025-06">Giugno 2025</MenuItem>
                <MenuItem value="2025-07">Luglio 2025</MenuItem>
                <MenuItem value="2025-08">Agosto 2025</MenuItem>
                <MenuItem value="2025-09">Settembre 2025</MenuItem>
                <MenuItem value="2025-10">Ottobre 2025</MenuItem>
                <MenuItem value="2025-11">Novembre 2025</MenuItem>
                <MenuItem value="2025-12">Dicembre 2025</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Anno</InputLabel>
              <Select
                value={selectedYear}
                label="Anno"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExportExcel}
                fullWidth
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportPDF}
                fullWidth
              >
                Export PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistiche Generali */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{monthlyData.totalHours}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ore Totali
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
                <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{monthlyData.averageHours}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ore Medie/Giorno
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
                <People sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{monthlyData.presentDays}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giorni Presenti
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
                <Assessment sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{monthlyData.overtimeHours}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ore Straordinarie
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabella Dettagliata */}
      <Paper elevation={3}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Dettaglio Dipendenti - {selectedMonth}
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dipendente</TableCell>
                <TableCell align="right">Ore Lavorate</TableCell>
                <TableCell align="center">Stato</TableCell>
                <TableCell align="right">Straordinari</TableCell>
                <TableCell align="right">% Presenza</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employeeStats.map((employee, index) => (
                <TableRow key={index}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell align="right">{employee.hours}h</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={employee.status}
                      color={employee.status === 'Presente' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{employee.overtime}h</TableCell>
                  <TableCell align="right">
                    {Math.round((employee.hours / 184) * 100)}%
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

export default Reports; 