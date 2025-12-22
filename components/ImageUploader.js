'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_FORMATS = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

export default function ImageUploader({ files, onFilesChange }) {
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setErrors([]);
      const newErrors = [];

      // Processar arquivos rejeitados
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          if (error.code === 'file-too-large') {
            newErrors.push(`${file.name}: Arquivo muito grande (máx 4MB)`);
          } else if (error.code === 'file-invalid-type') {
            newErrors.push(`${file.name}: Formato inválido (use PNG, JPEG ou WebP)`);
          } else {
            newErrors.push(`${file.name}: ${error.message}`);
          }
        });
      });

      // Verificar limite de arquivos
      const currentCount = files.length;
      const acceptedCount = acceptedFiles.length;
      const totalCount = currentCount + acceptedCount;

      if (totalCount > MAX_FILES) {
        const excess = totalCount - MAX_FILES;
        newErrors.push(`Você pode adicionar no máximo ${MAX_FILES} imagens. ${excess} imagem(ns) foram ignoradas.`);
        acceptedFiles = acceptedFiles.slice(0, MAX_FILES - currentCount);
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
      }

      // Adicionar arquivos aceitos
      if (acceptedFiles.length > 0) {
        const newFiles = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
        onFilesChange([...files, ...newFiles]);
      }
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: files.length >= MAX_FILES,
  });

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    // Revogar URL do objeto para liberar memória
    URL.revokeObjectURL(files[index].preview);
    onFilesChange(newFiles);
  };

  const clearAll = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    onFilesChange([]);
    setErrors([]);
  };

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`upload-zone ${
          isDragActive
            ? 'active !border-accent'
            : ''
        } ${files.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          {files.length >= MAX_FILES ? (
            <div>
              <p className="text-lg font-semibold text-foreground">Limite de {MAX_FILES} imagens atingido</p>
              <p className="text-sm text-muted-foreground mt-1">
                Remova algumas imagens para adicionar novas
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-foreground">
                {isDragActive ? 'Solte as imagens aqui' : 'Arraste imagens ou clique para selecionar'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PNG, JPEG ou WebP (máx 4MB cada) • Até {MAX_FILES} imagens
              </p>
            </div>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="organic-card bg-soft-pink/30 border border-terracotta/20">
          <p className="text-sm font-medium text-terracotta mb-2">Erros encontrados:</p>
          <ul className="text-sm text-terracotta/80 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="organic-card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              {files.length} {files.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAll}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              Limpar todas
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-[16px] overflow-hidden bg-secondary border border-border">
                  <Image
                    src={file.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-full bg-terracotta hover:bg-terracotta/90"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="mt-2 text-xs text-muted-foreground truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
