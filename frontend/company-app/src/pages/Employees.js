import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';

const Employees = () => {
  const navigate = useNavigate();
  
  const employees = [
    { id: 1, name: 'Mario Rossi', email: 'mario.rossi@azienda.com', position: 'Sviluppatore', department: 'IT', status: 'Attivo', hireDate: '2024-01-15' },
    { id: 2, name: 'Anna Bianchi', email: 'anna.bianchi@azienda.com', position: 'Designer', department: 'Design', status: 'Attivo', hireDate: '2024-02-01' },
    { id: 3, name: 'Luca Verdi', email: 'luca.verdi@azienda.com', position: 'Project Manager', department: 'Management', status: 'Attivo', hireDate: '2023-11-10' },
    { id: 4, name: 'Giulia Neri', email: 'giulia.neri@azienda.com', position: 'Marketing', department: 'Marketing', status: 'Inattivo', hireDate: '2024-03-20' }
  ];

  const handleEdit = (id) => {
    navigate(`/employees/${id}/edit`);
  };

  const handleView = (id) => {
    // TODO: Implementa visualizzazione dettagli
    alert(`Visualizza dipendente ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo dipendente?')) {
      // TODO: Implementa eliminazione
      alert(`Dipendente ${id} eliminato`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Attivo': return 'success';
      case 'Inattivo': return 'error';
      case 'Sospeso': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Gestione Dipendenti
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => navigate('/employees/new')}
        >
          Nuovo Dipendente
        </Button>
      </Box>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Posizione</TableCell>
                <TableCell>Reparto</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell>Data Assunzione</TableCell>
                <TableCell align="center">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.status} 
                      color={getStatusColor(employee.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(employee.hireDate).toLocaleDateString('it-IT')}</TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Button 
                        size="small" 
                        startIcon={<Visibility />}
                        onClick={() => handleView(employee.id)}
                      >
                        Visualizza
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<Edit />}
                        onClick={() => handleEdit(employee.id)}
                        color="primary"
                      >
                        Modifica
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<Delete />}
                        onClick={() => handleDelete(employee.id)}
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
    </Container>
  );
};

export default Employees; 