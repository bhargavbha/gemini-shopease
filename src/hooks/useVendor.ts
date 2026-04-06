import { useParams, useLocation } from 'react-router-dom';

export const useVendorId = () => {
  const { vendor_id } = useParams<{ vendor_id: string }>();
  if (vendor_id) return vendor_id;
  
  // Fallback to location parsing in case used outside of exact route hierarchy
  const pathParts = useLocation().pathname.split('/');
  return pathParts[1] || '';
};
