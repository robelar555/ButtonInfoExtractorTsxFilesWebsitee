"use client";

import React, { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  onFileRemove?: (file: File) => void;
  files?: File[];
  isProcessing?: boolean;
}

const FileUploader = ({
  onFileUpload = () => {},
  onFileRemove = () => {},
  files = [],
  isProcessing = false,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith(".tsx")) {
      setError("Only .tsx files are accepted");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        for (let i = 0; i < droppedFiles.length; i++) {
          const file = droppedFiles[i];
          if (validateFile(file)) {
            onFileUpload(file);
          }
        }
      }
    },
    [onFileUpload],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          if (validateFile(file)) {
            onFileUpload(file);
          }
        }
      }
    },
    [onFileUpload],
  );

  const handleRemoveFile = (file: File) => {
    onFileRemove(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-background">
      <Card className="border-2 border-dashed">
        <CardContent className="p-6">
          <div
            className={`flex flex-col items-center justify-center p-8 rounded-lg transition-colors ${
              isDragging ? "bg-primary/10 border-primary" : "bg-muted/50"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Upload TSX Files</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Drag and drop your .tsx files here, or click to browse
                </p>
              </div>

              <div className="mt-4">
                <input
                  id="file-upload"
                  type="file"
                  accept=".tsx"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isProcessing}
                    asChild
                  >
                    <span>
                      <FileText className="mr-2 h-4 w-4" />
                      Browse Files
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">
                Selected Files ({files.length})
              </h4>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="p-3 bg-muted rounded-md flex justify-between items-center"
                >
                  <p className="text-sm flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="font-medium">{file.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRemoveFile(file)}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {isProcessing && (
                <p className="text-sm text-muted-foreground mt-2">
                  Processing files...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploader;
