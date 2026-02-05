// Validation utilities for user profile
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ProfileFormData {
  full_name: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
}

export const validateProfileForm = (data: ProfileFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate full name
  if (data.full_name && data.full_name.trim()) {
    if (data.full_name.length < 2) {
      errors.full_name = "Nome deve ter pelo menos 2 caracteres";
    } else if (data.full_name.length > 100) {
      errors.full_name = "Nome deve ter no máximo 100 caracteres";
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(data.full_name)) {
      errors.full_name = "Nome contém caracteres inválidos";
    }
  }

  // Validate bio
  if (data.bio && data.bio.length > 500) {
    errors.bio = "Bio deve ter no máximo 500 caracteres";
  }

  // Validate location
  if (data.location && data.location.length > 100) {
    errors.location = "Localização deve ter no máximo 100 caracteres";
  }

  // Validate phone
  if (data.phone && data.phone.trim()) {
    // Brazilian phone format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    const phoneRegex = /^(\+55\s?)?(\(\d{2}\)\s?)?(\d{4,5}-?\d{4})$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ""))) {
      errors.phone = "Telefone inválido. Use: (XX) XXXXX-XXXX";
    }
  }

  // Validate website
  if (data.website && data.website.trim()) {
    try {
      const url = new URL(data.website.startsWith("http") ? data.website : `https://${data.website}`);
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.website = "URL deve começar com http:// ou https://";
      }
    } catch {
      errors.website = "URL inválida";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateAvatar = (file: File): ValidationResult => {
  const errors: Record<string, string> = {};

  // Check file type
  if (!file.type.startsWith("image/")) {
    errors.file = "Arquivo deve ser uma imagem";
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.file = "Imagem deve ter menos de 5MB";
  }

  // Check if it's a supported format
  const supportedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!supportedFormats.includes(file.type)) {
    errors.file = "Formato não suportado. Use: JPG, PNG ou WebP";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Format phone number for display
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 11) {
    // (XX) XXXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    // (XX) XXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Compress and resize image
export const compressImage = async (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob conversion failed"));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};
