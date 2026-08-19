import React, { useState } from 'react';
import { Card, CardContent, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { HeaderBreadcrumb } from '../../components/layout/HeaderBreadcrumb';
import { ComplaintForm } from '../../components/forms/ComplaintForm';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';

export const CreateComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = async (formData: any) => {
    setErrorMsg('');
    try {
      const created = await complaintService.createComplaint({
        ...formData,
        citizenId: user?.id || 'usr_citizen_01',
        citizenName: user?.fullName || 'Rahul Sharma',
        citizenPhone: user?.phone || '+91 98765 43210',
      });
      setSuccessMsg(`Complaint registered successfully! Tracking Number: ${created.trackingNumber}`);
      setTimeout(() => {
        navigate('/citizen/history');
      }, 1500);
    } catch (err) {
      setErrorMsg('Failed to submit complaint. Please check your internet connection.');
    }
  };

  return (
    <>
      <HeaderBreadcrumb
        title="Register Civic Complaint"
        subtitle="Submit a location-verified report to municipal engineering wings and ward councillor."
        breadcrumbs={[
          { label: 'Citizen Portal', path: '/citizen/dashboard' },
          { label: 'Create Complaint' },
        ]}
      />

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: 0 }}>
          <ComplaintForm
            initialWard={user?.ward}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate('/citizen/dashboard')}
          />
        </CardContent>
      </Card>
    </>
  );
};
