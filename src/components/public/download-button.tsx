import { Download } from 'lucide-react'

interface DownloadButtonProps {
  fileUrl: string
  name: string
}

export function DownloadButton({ fileUrl, name }: DownloadButtonProps) {
  return (
    <a
      href={fileUrl}
      download={name}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors text-slate-700 min-w-fit"
    >
      <Download className="h-4 w-4" />
      Download
    </a>
  )
}
