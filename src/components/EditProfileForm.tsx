/**
 * @fileoverview A profile page displaying user's email and editable name
 */

import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import axios from 'axios';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {useAuth} from '@/hooks/useAuth';

const EditProfileForm = () => {
  const auth = useAuth();

  const originalName = auth.user?.username ?? '';
  const userEmail = auth.user?.email;
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(originalName);

  const onSubmit = async () => {
    const newUsername = username.trim();
    if (originalName === newUsername) {
      toast.success('User name not changed');
      setEditMode(false);
      return;
    }

    await axios
      .put('/api/user/me', {
        username: newUsername ?? '',
      })
      .then(() => {
        auth.reloadUser();
        toast.success('User name updated successfully');
        setEditMode(false);
      })
      .catch(err => {
        toast.error(err.response.data.error);
      });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} spacing={3}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField disabled fullWidth label="email" defaultValue={userEmail} />
      </Grid>

      <Grid item xs={12}>
        <TextField
          disabled={!editMode}
          fullWidth
          value={username}
          label="username"
          onChange={e => {
            setUsername(e.target.value);
          }}
        />
      </Grid>

      <Grid item xs={12}>
        {!editMode ? (
          <Button variant={'outlined'} onClick={() => setEditMode(!editMode)}>
            Edit Profile
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant={'outlined'}
              color="error"
              onClick={() => {
                setEditMode(false);
                setUsername(originalName);
              }}
            >
              Cancel
            </Button>
            <Button variant={'contained'} onClick={() => onSubmit()}>
              Confirm
            </Button>
          </Stack>
        )}
      </Grid>
    </Grid>
  );
};

export default EditProfileForm;
