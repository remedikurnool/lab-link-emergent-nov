'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  bucket: 'prescriptions' | 'reports';
  onUploadComplete?: (filePath: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ 
  bucket, 
  onUploadComplete, 
  accept = 'image/*,application/pdf',
  maxSizeMB = 5 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File ${file.name} is larger than ${maxSizeMB}MB`);
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          setError(uploadError.message);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        const uploadedFile = {
          name: file.name,
          path: filePath,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size,
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
        onUploadComplete?.(filePath);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = async (filePath: string) => {
    try {
      await supabase.storage.from(bucket).remove([filePath]);
      setUploadedFiles(prev => prev.filter(f => f.path !== filePath));
    } catch (err: any) {
      console.error('Error removing file:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          multiple
        />
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          <Upload className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {uploading ? 'Uploading...' : 'Click to upload or drag files'}
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Supported: Images, PDF (Max {maxSizeMB}MB)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.path}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <FileText className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.path)}
                className="p-1 hover:bg-red-50 rounded text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
