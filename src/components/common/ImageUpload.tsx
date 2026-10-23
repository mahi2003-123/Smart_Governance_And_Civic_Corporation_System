import React, { useRef, useState } from 'react';
import { Box, Typography, IconButton, Paper, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { validateAndResizeImage } from '../../utils/imageUtils';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 3,
  label = 'Attach Photo Evidence (Optional)',
  helperText = 'Supported formats: JPG, PNG, WEBP (Max 2MB per file)',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    setErrorMessage(null);
    const newImageUrls: string[] = [];

    for (const file of files) {
      try {
        const resized = await validateAndResizeImage(file);
        newImageUrls.push(resized);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid image file';
        setErrorMessage(msg);
      }
    }

    if (newImageUrls.length > 0) {
      const combined = [...images, ...newImageUrls].slice(0, maxImages);
      onChange(combined);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
        {label}
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: '10px' }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {images.length < maxImages && (
        <Paper
          elevation={0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: dragOver ? '#2563EB' : '#CBD5E1',
            borderRadius: '16px',
            backgroundColor: dragOver ? '#EFF6FF' : '#F8FAFC',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#2563EB',
              backgroundColor: '#EFF6FF',
            },
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            multiple={maxImages > 1}
            style={{ display: 'none' }}
          />

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
            }}
          >
            <CloudUploadIcon />
          </Box>

          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
            Click to upload or drag & drop photo
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', mt: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        </Paper>
      )}

      {/* Image Preview List */}
      {images.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          {images.map((imgUrl, index) => (
            <Box
              key={index}
              sx={{
                position: 'relative',
                width: 110,
                height: 110,
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <img
                src={imgUrl}
                alt={`Upload preview ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  color: '#FFFFFF',
                  '&:hover': { backgroundColor: '#DC2626' },
                  width: 24,
                  height: 24,
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
