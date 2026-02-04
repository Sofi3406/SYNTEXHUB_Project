import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Pagination,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import contactAPI from '../services/api';
import ContactForm from './ContactForm';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  
  // Modal states
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formMode, setFormMode] = useState('create');

  useEffect(() => {
    fetchContacts();
  }, [search, favoriteFilter, page]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        ...(search && { search }),
        ...(favoriteFilter && { favorite: true })
      };
      
      const response = await contactAPI.getAll(params);
      setContacts(response.data || response);
      setTotalPages(response.totalPages || 1);
      setTotalContacts(response.total || (response.data ? response.data.length : response.length) || 0);
      setError(null);
    } catch (err) {
      console.log('Using sample data due to backend error:', err.message);
      // Use sample data if backend fails
      const sampleContacts = getSampleContacts();
      setContacts(sampleContacts);
      setTotalContacts(sampleContacts.length);
      setTotalPages(1);
      setError('Using sample data. Backend not fully connected.');
    } finally {
      setLoading(false);
    }
  };

  const getSampleContacts = () => {
    return [
      
      
      {
        _id: '1',
        firstName: 'Sumeya',
        lastName: 'Reduwan',
        email: 'sumeya@gmail.com',
        phone: '+251924114815',
        company: 'None',
        jobTitle: 'have no job',
        isFavorite: true
      },
      {
        _id: '2',
        firstName: 'Salhadin',
        lastName: 'Yasin',
        email: 'salhadin@gmail.com',
        phone: '+2519999999',
        company: 'Marketing Pro',
        jobTitle: 'Marketing Director',
        isFavorite: false
      },
    ];
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleToggleFavorite = async (id) => {
    try {
      // Try backend first
      const updatedContact = await contactAPI.toggleFavorite(id);
      setContacts(contacts.map(contact => 
        contact._id === id ? updatedContact.data : contact
      ));
      toast.success(updatedContact.message || 'Favorite status updated');
    } catch (err) {
      // If backend fails, update locally
      setContacts(contacts.map(contact => 
        contact._id === id ? { ...contact, isFavorite: !contact.isFavorite } : contact
      ));
      toast.success('Favorite status updated locally');
    }
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setFormMode('edit');
    setOpenForm(true);
  };

  const handleDeleteClick = (contact) => {
    setSelectedContact(contact);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await contactAPI.delete(selectedContact._id);
      setContacts(contacts.filter(contact => contact._id !== selectedContact._id));
      toast.success('Contact deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedContact(null);
    } catch (err) {
      // If backend fails, delete locally
      setContacts(contacts.filter(contact => contact._id !== selectedContact._id));
      toast.success('Contact deleted locally');
      setOpenDeleteDialog(false);
      setSelectedContact(null);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (formMode === 'create') {
        const newContact = await contactAPI.create(data);
        const contactToAdd = newContact.data || { _id: Date.now().toString(), ...data };
        setContacts([contactToAdd, ...contacts]);
        toast.success('Contact created successfully');
      } else {
        const updatedContact = await contactAPI.update(selectedContact._id, data);
        setContacts(contacts.map(contact => 
          contact._id === selectedContact._id ? (updatedContact.data || { ...contact, ...data }) : contact
        ));
        toast.success('Contact updated successfully');
      }
      setOpenForm(false);
      setSelectedContact(null);
    } catch (err) {
      // If backend fails, update locally
      if (formMode === 'create') {
        const newContact = { _id: Date.now().toString(), ...data };
        setContacts([newContact, ...contacts]);
        toast.success('Contact created locally');
      } else {
        setContacts(contacts.map(contact => 
          contact._id === selectedContact._id ? { ...contact, ...data } : contact
        ));
        toast.success('Contact updated locally');
      }
      setOpenForm(false);
      setSelectedContact(null);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading && contacts.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  const displayContacts = contacts;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Contact Manager
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setFormMode('create');
              setSelectedContact(null);
              setOpenForm(true);
            }}
          >
            Add New Contact
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search contacts..."
                value={search}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={favoriteFilter}
                      onChange={(e) => {
                        setFavoriteFilter(e.target.checked);
                        setPage(1);
                      }}
                      color="primary"
                    />
                  }
                  label="Show Favorites Only"
                />
                <Typography color="textSecondary">
                  {displayContacts.length} contact{displayContacts.length !== 1 ? 's' : ''} found
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Contact Grid */}
        <Grid container spacing={3}>
          {displayContacts.length === 0 ? (
            <Grid size={12}>
              <Alert severity="info">
                No contacts found. {search && 'Try a different search term.'}
              </Alert>
            </Grid>
          ) : (
            displayContacts
              .filter(contact => !favoriteFilter || contact.isFavorite)
              .filter(contact => 
                !search || 
                contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
                contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
                contact.email.toLowerCase().includes(search.toLowerCase()) ||
                contact.phone.includes(search)
              )
              .slice((page - 1) * 9, page * 9)
              .map((contact) => (
              <Grid key={contact._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Contact Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="h2">
                          {contact.firstName} {contact.lastName}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleFavorite(contact._id)}
                        color={contact.isFavorite ? 'error' : 'default'}
                      >
                        {contact.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Box>

                    {/* Contact Info */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {contact.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {contact.phone}
                        </Typography>
                      </Box>
                      {contact.company && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BusinessIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {contact.company}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Tags/Chips */}
                    <Box sx={{ mb: 2 }}>
                      {contact.jobTitle && (
                        <Chip
                          label={contact.jobTitle}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      )}
                      {contact.isFavorite && (
                        <Chip
                          label="Favorite"
                          size="small"
                          color="error"
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(contact)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(contact)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>

      {/* Contact Form Modal */}
      <ContactForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedContact(null);
        }}
        onSubmit={handleFormSubmit}
        contact={selectedContact}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedContact?.firstName} {selectedContact?.lastName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContactList;