import { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// --- CONFIGURACIÓN DEL WORKER DE VITE ---
// Esto es vital para que react-pdf funcione sin configuraciones complejas de Webpack
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title?: string;
}

const PDFModal = ({ isOpen, onClose, fileUrl, title }: Props) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ajustar ancho al tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // En móvil restamos un poco de margen, en desktop usamos un ancho máximo
        const width = containerRef.current.clientWidth;
        setContainerWidth(width > 800 ? 800 : width - 32); 
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]); // Recalcular cuando se abre

  // --- CORRECCIÓN: Resetear SOLO si cambia el archivo, NO isOpen ---
  // Al usar renderizado condicional en el padre ({isOpen && <Modal/>}), 
  // este componente nace de nuevo cada vez que se abre, por lo que 
  // pageNumber empieza en 1 automáticamente. 
  // Este efecto es solo por si cambias de PDF estando el modal abierto.
  useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPageNumber(1);
      setScale(1.0);
  }, [fileUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages || 1));
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 2.5));
  };

  // Seguridad extra por si no se desmonta correctamente
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-6">
      
      <div className="bg-white w-full h-full md:h-[90vh] md:w-auto md:aspect-[3/4] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/90 backdrop-blur z-10 shrink-0">
            <div className="min-w-0 flex-1 pr-4">
                <h3 className="font-bold text-slate-800 truncate">{title || 'Documento PDF'}</h3>
                <p className="text-xs text-slate-400">Página {pageNumber} de {numPages || '-'}</p>
            </div>
            <div className="flex items-center gap-2">
                 {/* Botón Descargar (visible solo desktop o si hay espacio) */}
                 <a href={fileUrl} download className="p-2 text-slate-400 hover:text-[#2dd4bf] hover:bg-slate-50 rounded-full transition-colors hidden sm:flex">
                    <Download size={20} />
                </a>
                <button 
                    onClick={onClose}
                    className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>

        {/* --- BODY (VIEWER) --- */}
        <div 
            ref={containerRef}
            className="flex-1 overflow-auto bg-slate-100 relative flex justify-center p-4 custom-scrollbar"
        >
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#2dd4bf]" size={40}/>
                    </div>
                }
                error={
                    <div className="mt-10 text-red-500 font-medium text-center">
                        No se pudo cargar el PDF. Intenta descargarlo.
                    </div>
                }
                className="flex justify-center shadow-lg"
            >
                <Page 
                    pageNumber={pageNumber} 
                    width={containerWidth} 
                    scale={scale}
                    renderTextLayer={false} // Desactiva selección de texto para mejor performance en móvil
                    renderAnnotationLayer={false}
                    className="bg-white shadow-lg"
                />
            </Document>
        </div>

        {/* --- FOOTER (CONTROLES) --- */}
        <div className="p-3 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between gap-4 safe-area-bottom">
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button onClick={() => handleZoom(-0.25)} className="p-2 text-slate-500 hover:text-[#2dd4bf] active:bg-white rounded-md transition-all">
                    <ZoomOut size={18} />
                </button>
                <span className="text-xs font-bold w-8 text-center text-slate-600">{Math.round(scale * 100)}%</span>
                <button onClick={() => handleZoom(0.25)} className="p-2 text-slate-500 hover:text-[#2dd4bf] active:bg-white rounded-md transition-all">
                    <ZoomIn size={18} />
                </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-3">
                <button 
                    disabled={pageNumber <= 1}
                    onClick={() => changePage(-1)}
                    className="w-10 h-10 rounded-full bg-[#2dd4bf] text-white disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center shadow-md active:scale-95 transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    disabled={pageNumber >= (numPages || 1)}
                    onClick={() => changePage(1)}
                    className="w-10 h-10 rounded-full bg-[#2dd4bf] text-white disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center shadow-md active:scale-95 transition-all"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PDFModal;