import React from 'react';
import { FileText, Download, FileJson, File, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { GeneratedDocument, useDocumentDownload } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/Button';

interface DocumentCardProps {
  document: GeneratedDocument;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const { getDownloadUrl, loading } = useDocumentDownload();

  const handleDownload = async () => {
    const url = await getDownloadUrl(document.documentId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getIcon = () => {
    switch (document.type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'docx':
        return <File className="w-6 h-6 text-blue-500" />;
      case 'md':
        return <FileJson className="w-6 h-6 text-gray-700" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const isPending = document.status === 'pending';
  const isExpired = document.status === 'expired';

  return (
    <div className="flex items-center gap-4 p-4 border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface)] transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-background)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border-light)] group-hover:border-[var(--color-primary)]/30 transition-colors">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-base font-bold text-[var(--color-foreground)] truncate">
            {document.title}
          </h4>
          {document.type === 'md' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Sparkles className="w-3 h-3" /> AI Note
            </span>
          )}
        </div>
        <div className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-2">
          <span className="uppercase font-semibold tracking-wider">{document.type}</span>
          <span>•</span>
          <span>{new Date(document.createdAt).toLocaleDateString()}</span>
          {isPending && (
            <>
              <span>•</span>
              <span className="text-amber-600 font-medium animate-pulse">Generating...</span>
            </>
          )}
          {isExpired && (
            <>
              <span>•</span>
              <span className="text-[var(--color-destructive)] font-medium">Expired</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        {document.type === 'pdf' && (
          <Button 
            variant="default" 
            size="sm" 
            className="rounded-full font-medium"
            disabled={isPending || isExpired || loading}
            onClick={handleDownload}
          >
            Open PDF
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full text-[var(--color-primary)] font-medium"
          disabled={isPending || isExpired || loading}
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Download
        </Button>
      </div>
    </div>
  );
}
