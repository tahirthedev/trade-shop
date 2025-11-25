const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const uploadApi = {
  // Upload a single image
  uploadImage: async (file: File, type: 'profiles' | 'portfolio' = 'profiles') => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/upload/image?type=${type}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload image');
    }
  },

  // Upload multiple images
  uploadImages: async (files: File[], type: 'profiles' | 'portfolio' = 'portfolio') => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${API_URL}/upload/images?type=${type}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload images');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload images');
    }
  },

  // Delete an image
  deleteImage: async (filename: string, type: 'profiles' | 'portfolio' = 'profiles') => {
    try {
      const response = await fetch(`${API_URL}/upload/image/${filename}?type=${type}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete image');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete image');
    }
  },

  // Get full image URL
  getImageUrl: (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  }
};
