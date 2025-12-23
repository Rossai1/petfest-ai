'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_FORMATS = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

export default function ImageUploaderStitch({ files, onFilesChange }) {
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
      {/* Stitch Style Upload Zone */}
      <div className="w-full bg-[#fdfbf7] dark:bg-gray-800 rounded-3xl p-2 shadow-xl border border-white/20 dark:border-gray-700">
        <div
          {...getRootProps()}
          className={`w-full border-2 border-dashed ${
            isDragActive 
              ? 'border-[#79aca9] bg-[#79aca9]/5' 
              : 'border-gray-300 dark:border-gray-600 hover:border-[#79aca9]/50'
          } rounded-2xl bg-[#fdfbf7] dark:bg-gray-800/50 min-h-[300px] flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer relative overflow-hidden group ${
            files.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input {...getInputProps()} />
          <div className="bg-[#79aca9]/10 p-5 rounded-full group-hover:scale-110 transition-transform duration-300">
            <CloudUpload className="h-12 w-12 text-[#79aca9] dark:text-[#79aca9]" />
          </div>
          <div className="text-center space-y-2 z-0">
            {files.length >= MAX_FILES ? (
              <>
                <h3 className="font-display font-semibold text-xl text-gray-800 dark:text-white">
                  Limite de {MAX_FILES} imagens atingido
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Remova algumas imagens para adicionar novas
                </p>
              </>
            ) : (
              <>
                <h3 className="font-display font-semibold text-xl text-gray-800 dark:text-white group-hover:text-[#79aca9] transition-colors">
                  {isDragActive ? 'Solte as imagens aqui' : 'Arraste imagens ou clique para selecionar'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  PNG, JPEG ou WebP (máx 4MB cada) • Até {MAX_FILES} imagens
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Erros encontrados:</p>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-[#fdfbf7] dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-white/20 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              {files.length} {files.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAll}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full min-h-[44px] px-4"
            >
              Limpar todas
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
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
                  className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-9 w-9 rounded-full bg-red-500 hover:bg-red-600 touch-manipulation"
                  onClick={() => removeFile(index)}
                  aria-label={`Remover ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate px-1">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


