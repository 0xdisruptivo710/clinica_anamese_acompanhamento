'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Camera, Upload, X, Image } from 'lucide-react';

const PHOTO_TYPES = [
  { value: 'before', label: 'Antes' },
  { value: 'after', label: 'Depois' },
  { value: 'during', label: 'Durante' },
  { value: 'progress', label: 'Progresso' },
];

const PHOTO_ANGLES = [
  { value: 'frontal', label: 'Frontal' },
  { value: 'left_profile', label: 'Perfil Esquerdo' },
  { value: 'right_profile', label: 'Perfil Direito' },
  { value: 'left_three_quarters', label: '3/4 Esquerdo' },
  { value: 'right_three_quarters', label: '3/4 Direito' },
];

interface PhotoUploadProps {
  sessionId: string;
  clientId: string;
  onUploadComplete?: () => void;
}

interface PendingPhoto {
  file: File;
  preview: string;
  photoType: string;
  angle: string;
}

export function PhotoUpload({ sessionId, clientId, onUploadComplete }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      photoType: 'before',
      angle: 'frontal',
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updatePhoto = (index: number, field: string, value: string) => {
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      for (const photo of photos) {
        const formData = new FormData();
        formData.append('file', photo.file);
        formData.append('sessionId', sessionId);
        formData.append('clientId', clientId);
        formData.append('photoType', photo.photoType);
        formData.append('angle', photo.angle);
        formData.append('isConsentOk', 'true');

        await fetch('/api/v1/photos/upload', {
          method: 'POST',
          body: formData,
        });
      }
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      onUploadComplete?.();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {photos.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50"
        >
          <div className="rounded-full bg-primary/10 p-3">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Arraste fotos ou clique para selecionar</p>
            <p className="text-xs text-muted-foreground">JPG, PNG ate 10MB cada</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative rounded-lg border p-3">
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-2 top-2 z-10 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="mb-3 aspect-square overflow-hidden rounded-md bg-muted">
                  <img
                    src={photo.preview}
                    alt={`Foto ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={photo.photoType}
                      onValueChange={(v) => updatePhoto(index, 'photoType', v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PHOTO_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Angulo</Label>
                    <Select
                      value={photo.angle}
                      onValueChange={(v) => updatePhoto(index, 'angle', v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PHOTO_ANGLES.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="mr-2 h-4 w-4" />
              Mais fotos
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                'Enviando...'
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar {photos.length} foto{photos.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
