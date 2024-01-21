import React from 'react';
import Link from 'next/link';
import {Drawer, List, ListItem, ListItemText} from '@mui/material';

const LeftNavBar = () => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        backgroundColor: '#cb650e',
        width: '200px',
        color: 'blue',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 200,
          boxSizing: 'border-box',
        },
      }}
    >
      <List>
        <ListItem>
          <Link href="/app/dashboard">
            <ListItemText primary="Dashboard" />
          </Link>
        </ListItem>
        <ListItem>
          <Link href="/user/profile">
            <ListItemText primary="Profile" />
          </Link>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default LeftNavBar;
