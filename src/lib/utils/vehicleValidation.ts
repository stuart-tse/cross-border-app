// Vehicle validation utilities

// Additional validation helpers
export function validateVehiclePhotos(photos: File[]): string[] {
  const errors: string[] = [];
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxPhotos = 10;

  if (photos.length > maxPhotos) {
    errors.push(`Maximum ${maxPhotos} photos allowed`);
  }

  photos.forEach((photo, index) => {
    if (photo.size > maxFileSize) {
      errors.push(`Photo ${index + 1} is too large (max 10MB)`);
    }
    
    if (!allowedTypes.includes(photo.type)) {
      errors.push(`Photo ${index + 1} must be JPEG, PNG, or GIF format`);
    }
  });

  return errors;
}

// Check if documents are expiring soon (within 30 days)
export function checkExpiringDocuments(insuranceExpiry: string, inspectionExpiry: string): {
  hasExpiringDocuments: boolean;
  expiringDocuments: string[];
} {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringDocuments: string[] = [];
  
  if (new Date(insuranceExpiry) <= thirtyDaysFromNow) {
    expiringDocuments.push('Insurance');
  }
  
  if (new Date(inspectionExpiry) <= thirtyDaysFromNow) {
    expiringDocuments.push('Inspection');
  }

  return {
    hasExpiringDocuments: expiringDocuments.length > 0,
    expiringDocuments,
  };
}