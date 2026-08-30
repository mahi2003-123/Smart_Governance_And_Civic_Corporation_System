import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  color?: 'default' | 'error' | 'warning' | 'primary';
  divider?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ items }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleItemClick = (item: ActionMenuItem, event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    item.onClick();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          color: '#68706B',
          '&:hover': { backgroundColor: '#F3F5F2', color: '#202522' },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            border: '1px solid #E5E8E4',
            borderRadius: '8px',
            minWidth: 160,
            py: 0.5,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          },
        }}
      >
        {items.map((item, idx) => {
          let textColor = '#202522';
          if (item.color === 'error') textColor = '#B45D59';
          if (item.color === 'warning') textColor = '#B58A45';
          if (item.color === 'primary') textColor = '#496A57';

          return (
            <MenuItem
              key={idx}
              onClick={(e) => handleItemClick(item, e)}
              divider={item.divider}
              sx={{
                py: 1,
                px: 2,
                fontSize: '0.85rem',
                color: textColor,
                '&:hover': { backgroundColor: '#F3F5F2' },
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ minWidth: 28, color: textColor }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {item.label}
              </ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default ActionMenu;
