import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Banner } from '../types/admin';

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBanners();
      setBanners(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch banners');
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    try {
      const updatedBanner = await adminService.updateBanner(id, updates);
      setBanners(banners.map(b => b.id === id ? updatedBanner : b));
      return updatedBanner;
    } catch (err) {
      throw err;
    }
  };

  const uploadImage = async (file: File) => {
    try {
      return await adminService.uploadBannerImage(file);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    loading,
    error,
    updateBanner,
    uploadImage,
    refetch: fetchBanners,
  };
};