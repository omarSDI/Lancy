'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Palette, Plus, Minus, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Type, ZoomIn, ZoomOut, MousePointer2, Image as ImageIcon, Undo, Redo } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAccessToken } from '@/lib/auth';

interface Props {
  sessionId: string;
  onClose: () => void;
}

export default function InteractiveCVEditor({ sessionId, onClose }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toolbar, setToolbar] = useState<{ visible: boolean; x: number; y: number; isImage?: boolean } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [currentStyles, setCurrentStyles] = useState<{ fontSize: string; fontFamily: string }>({ fontSize: '12', fontFamily: 'Arial' });

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const token = await getAccessToken();
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        if (apiUrl && !apiUrl.startsWith('http')) {
          apiUrl = `https://${apiUrl}`;
        }
        const res = await fetch(`${apiUrl}/api/v1/cv/${sessionId}/html`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Échec du chargement du CV');
        const text = await res.text();
        
        // Inject our interactive script into the head
        const interactiveScript = `
          <style>
            [contenteditable]:hover {
              outline: 1px dashed #2563EB !important;
              cursor: text;
            }
            [contenteditable]:focus, img.selected-img {
              outline: 2px solid #2563EB !important;
            }
          </style>
          <script>
            let currentSelected = null;
            let undoStack = [];
            let currentIndex = -1;

            function saveState() {
              const html = document.body.innerHTML;
              if (currentIndex < undoStack.length - 1) {
                undoStack = undoStack.slice(0, currentIndex + 1);
              }
              if (undoStack.length === 0 || undoStack[currentIndex] !== html) {
                undoStack.push(html);
                currentIndex++;
                if (undoStack.length > 50) {
                  undoStack.shift();
                  currentIndex--;
                }
              }
            }

            function reattachListeners() {
              const tags = ['h1', 'h2', 'h3', 'h4', 'p', 'span', 'div', 'li', 'strong', 'img'];
              document.body.querySelectorAll(tags.join(',')).forEach(el => {
                if (el.tagName === 'IMG' || el.children.length === 0 || Array.from(el.children).every(c => c.tagName === 'BR' || c.tagName === 'STRONG' || c.tagName === 'EM' || c.tagName === 'U')) {
                  if (el.tagName !== 'IMG') {
                    el.setAttribute('contenteditable', 'true');
                  }
                  
                  el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (currentSelected && currentSelected.tagName === 'IMG') {
                      currentSelected.classList.remove('selected-img');
                    }
                    currentSelected = el;
                    if (el.tagName === 'IMG') el.classList.add('selected-img');
                    
                    const rect = el.getBoundingClientRect();
                    const computed = window.getComputedStyle(el);
                    window.parent.postMessage({ 
                      type: 'SHOW_TOOLBAR', 
                      rect: { top: rect.top, left: rect.left, bottom: rect.bottom, width: rect.width },
                      styles: { fontSize: computed.fontSize, fontFamily: computed.fontFamily },
                      isImage: el.tagName === 'IMG'
                    }, '*');
                  });
                }
              });
            }

            function undo() {
              if (currentIndex > 0) {
                currentIndex--;
                document.body.innerHTML = undoStack[currentIndex];
                reattachListeners();
                window.parent.postMessage({ type: 'HIDE_TOOLBAR' }, '*');
              }
            }

            function redo() {
              if (currentIndex < undoStack.length - 1) {
                currentIndex++;
                document.body.innerHTML = undoStack[currentIndex];
                reattachListeners();
                window.parent.postMessage({ type: 'HIDE_TOOLBAR' }, '*');
              }
            }

            document.addEventListener('keydown', (e) => {
              if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
              if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
            });

            let debounceTimeout;
            document.addEventListener('input', () => {
              clearTimeout(debounceTimeout);
              debounceTimeout = setTimeout(saveState, 500);
            });

            document.addEventListener('DOMContentLoaded', () => {
              reattachListeners();
              saveState();

              document.body.addEventListener('click', (e) => {
                if (!e.target.closest('[contenteditable="true"]') && e.target.tagName !== 'IMG') {
                  if (currentSelected && currentSelected.tagName === 'IMG') currentSelected.classList.remove('selected-img');
                  currentSelected = null;
                  window.parent.postMessage({ type: 'HIDE_TOOLBAR' }, '*');
                }
              });
            });

            // Global Drag Logic for Absolute Text Blocks
            let isGlobalDragging = false;
            let dragTarget = null;
            let dragOffsetX = 0;
            let dragOffsetY = 0;

            document.addEventListener('mousedown', (e) => {
              if (e.shiftKey && e.target.style.position === 'absolute') {
                isGlobalDragging = true;
                dragTarget = e.target;
                dragOffsetX = e.clientX - parseInt(dragTarget.style.left || 0);
                dragOffsetY = e.clientY - parseInt(dragTarget.style.top || 0);
              }
            });

            document.addEventListener('mousemove', (e) => {
              if (isGlobalDragging && dragTarget) {
                e.preventDefault();
                dragTarget.style.left = (e.clientX - dragOffsetX) + 'px';
                dragTarget.style.top = (e.clientY - dragOffsetY) + 'px';
              }
            });

            document.addEventListener('mouseup', () => {
              if (isGlobalDragging) {
                isGlobalDragging = false;
                dragTarget = null;
                saveState();
              }
            });

            window.addEventListener('message', (e) => {
              if (e.data.type === 'UNDO') { undo(); return; }
              if (e.data.type === 'REDO') { redo(); return; }

              if (e.data.type === 'CHANGE_STYLE') {
                if (e.data.style === 'addText') {
                  const newEl = document.createElement('div');
                  newEl.textContent = 'Nouveau texte...';
                  newEl.setAttribute('contenteditable', 'true');
                  newEl.style.position = 'absolute';
                  newEl.style.top = '100px';
                  newEl.style.left = '50px';
                  newEl.style.fontSize = '14pt';
                  newEl.style.fontFamily = 'Arial';
                  newEl.style.color = '#000000';
                  newEl.style.zIndex = '1000';
                  
                  const container = document.querySelector('.main') || document.body;
                  container.appendChild(newEl);
                  reattachListeners();
                  saveState();
                  return;
                }

                if (!currentSelected) return;

                if (e.data.style === 'fontSizeDelta') {
                  const currentSize = window.getComputedStyle(currentSelected).fontSize;
                  const newSize = parseFloat(currentSize) + e.data.value;
                  currentSelected.style.fontSize = newSize + 'px';
                  window.parent.postMessage({ type: 'UPDATE_STYLES', styles: { fontSize: newSize + 'px' } }, '*');
                } else if (e.data.style === 'fontSize') {
                  currentSelected.style.fontSize = e.data.value + 'px';
                } else if (e.data.style === 'fontWeight') {
                  currentSelected.style.fontWeight = currentSelected.style.fontWeight === 'bold' || currentSelected.style.fontWeight === '700' ? 'normal' : 'bold';
                } else if (e.data.style === 'fontStyle') {
                  currentSelected.style.fontStyle = currentSelected.style.fontStyle === 'italic' ? 'normal' : 'italic';
                } else if (e.data.style === 'textDecoration') {
                  currentSelected.style.textDecoration = currentSelected.style.textDecoration.includes('underline') ? 'none' : 'underline';
                } else if (e.data.style === 'textTransform') {
                  currentSelected.style.textTransform = currentSelected.style.textTransform === 'uppercase' ? 'none' : 'uppercase';
                } else if (e.data.style === 'imgSizeDelta') {
                  const currentWidth = currentSelected.clientWidth;
                  currentSelected.style.width = (currentWidth + e.data.value) + 'px';
                  currentSelected.style.height = 'auto';
                } else if (e.data.style === 'imgSrc') {
                  currentSelected.src = e.data.value;
                } else {
                  currentSelected.style[e.data.style] = e.data.value;
                }
                saveState();
              }
            });
          </script>
        `;
        
        const modifiedHtml = text.replace('</head>', `${interactiveScript}</head>`);
        setHtml(modifiedHtml);
      } catch (err) {
        toast.error("Erreur lors du chargement de l'aperçu");
      } finally {
        setLoading(false);
      }
    };
    fetchHtml();
  }, [sessionId]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'SHOW_TOOLBAR') {
        const { rect, styles, isImage } = e.data;
        // Adjust for zoom
        const scaledBottom = rect.bottom * (zoom / 100);
        const scaledLeft = rect.left * (zoom / 100);
        const scaledWidth = rect.width * (zoom / 100);
        
        setToolbar({ visible: true, x: scaledLeft + (scaledWidth / 2), y: scaledBottom + 10, isImage });
        if (styles) {
          setCurrentStyles(prev => ({ ...prev, ...styles }));
        }
      } else if (e.data.type === 'HIDE_TOOLBAR') {
        setToolbar(null);
      } else if (e.data.type === 'UPDATE_STYLES') {
        setCurrentStyles(prev => ({ ...prev, ...e.data.styles }));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [zoom]);

  const sendStyleCommand = (style: string, value: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'CHANGE_STYLE', style, value }, '*');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        sendStyleCommand('imgSrc', event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!iframeRef.current?.contentDocument) return;
    
    // Clone document to clean it
    const docClone = iframeRef.current.contentDocument.cloneNode(true) as Document;
    
    // Remove injected script and styles
    docClone.querySelectorAll('script, style').forEach(el => {
      if (el.textContent?.includes('SHOW_TOOLBAR') || el.textContent?.includes('[contenteditable]:hover')) {
        el.remove();
      }
    });
    
    // Remove contenteditable attributes and selection classes
    docClone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
    });
    docClone.querySelectorAll('.selected-img').forEach(el => {
      el.classList.remove('selected-img');
    });

    const finalHtml = docClone.documentElement.outerHTML;
    
    const toastId = toast.loading('Génération du PDF final...');
    try {
      const token = await getAccessToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/cv/${sessionId}/custom-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ html_content: finalHtml })
      });
      
      if (!res.ok) throw new Error('Échec de génération');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lansy_cv_export.pdf`;
      a.click();
      toast.success('Téléchargé avec succès !', { id: toastId });
    } catch (e) {
      toast.error('Erreur lors du téléchargement', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div className="animate-spin" style={{ display: 'inline-block', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', width: 24, height: 24, marginBottom: 16 }} />
        <p>Chargement de l'éditeur interactif...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Palette size={18} color="var(--primary)" /> Éditeur de CV
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Cliquez sur n'importe quel texte pour le modifier.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary btn-sm" onClick={handleDownload}>
            <Download size={14} /> Télécharger
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>

      {/* Canva-like Top Toolbar */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Font Family */}
        <select 
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', outline: 'none', cursor: 'pointer', fontFamily: currentStyles.fontFamily, width: 140 }}
          onChange={(e) => sendStyleCommand('fontFamily', e.target.value)}
          value={currentStyles.fontFamily.split(',')[0].replace(/['"]/g, '')}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="'Segoe UI'">Segoe UI</option>
        </select>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Font Size */}
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', borderRadius: 0 }} onClick={() => sendStyleCommand('fontSizeDelta', -1)}>
            <Minus size={16} />
          </button>
          <input 
            type="text" 
            value={parseInt(currentStyles.fontSize) || 12} 
            onChange={(e) => sendStyleCommand('fontSize', parseInt(e.target.value) || 12)}
            style={{ width: 40, textAlign: 'center', border: 'none', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '4px 0', outline: 'none' }} 
          />
          <button className="btn btn-ghost" style={{ padding: '4px 8px', borderRadius: 0 }} onClick={() => sendStyleCommand('fontSizeDelta', 1)}>
            <Plus size={16} />
          </button>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Text Color */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <Type size={18} />
          <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 4, background: '#000', borderRadius: 2 }} />
          <input 
            type="color" 
            onChange={(e) => sendStyleCommand('color', e.target.value)}
            style={{ position: 'absolute', opacity: 0, inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Formatting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => sendStyleCommand('fontWeight', '')} title="Gras">
            <Bold size={16} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => sendStyleCommand('fontStyle', '')} title="Italique">
            <Italic size={16} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => sendStyleCommand('textDecoration', '')} title="Souligné">
            <Underline size={16} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontWeight: 600, fontSize: 14 }} onClick={() => sendStyleCommand('textTransform', '')} title="Majuscules">
            aA
          </button>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Alignment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => sendStyleCommand('textAlign', 'left')} title="Aligner à gauche">
            <AlignLeft size={16} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => sendStyleCommand('textAlign', 'center')} title="Centrer">
            <AlignCenter size={16} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => sendStyleCommand('textAlign', 'right')} title="Aligner à droite">
            <AlignRight size={16} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => sendStyleCommand('textAlign', 'justify')} title="Justifier">
            <AlignJustify size={16} />
          </button>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Add Text Block */}
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => sendStyleCommand('addText', null)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          title="Ajouter un nouveau bloc de texte libre (Maintenez MAJ/SHIFT pour le déplacer)"
        >
          <Type size={14} /> Ajouter Texte
        </button>

        <div style={{ flex: 1 }} />

        {/* Undo/Redo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => iframeRef.current?.contentWindow?.postMessage({ type: 'UNDO' }, '*')} title="Annuler (Ctrl+Z)">
            <Undo size={16} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => iframeRef.current?.contentWindow?.postMessage({ type: 'REDO' }, '*')} title="Rétablir (Ctrl+Y)">
            <Redo size={16} />
          </button>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', padding: '4px 12px', borderRadius: 20 }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: 4, height: 'auto', borderRadius: '50%' }} onClick={() => setZoom(Math.max(50, zoom - 10))}>
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
          <button className="btn btn-ghost btn-sm" style={{ padding: 4, height: 'auto', borderRadius: '50%' }} onClick={() => setZoom(Math.min(200, zoom + 10))}>
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div style={{ flex: 1, position: 'relative', background: '#e5e7eb', overflow: 'auto', padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          background: 'white', 
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease',
          position: 'relative'
        }}>
          <iframe
            ref={iframeRef}
            srcDoc={html || ''}
            style={{ width: '100%', height: '100%', minHeight: '297mm', border: 'none' }}
            title="CV Interactive Editor"
          />
        </div>

        {/* Floating Context Menu (Like Canva) */}
        {toolbar?.visible && (
          <div 
            className="animate-scale-in"
            style={{ 
              position: 'absolute', 
              top: toolbar.y, 
              left: toolbar.x, 
              transform: 'translateX(-50%)',
              background: 'white', 
              borderRadius: 8, 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', 
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              zIndex: 50,
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {toolbar.isImage ? <><ImageIcon size={14} /> Image</> : <><Palette size={14} /> Style</>}
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            
            {toolbar.isImage ? (
              <>
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => sendStyleCommand('imgSizeDelta', 10)} title="Agrandir l'image">
                  <Plus size={16} />
                </button>
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => sendStyleCommand('imgSizeDelta', -10)} title="Réduire l'image">
                  <Minus size={16} />
                </button>
                <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>
                  Changer
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => sendStyleCommand('fontSizeDelta', 1)} title="Agrandir">
                  <Plus size={16} />
                </button>
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => sendStyleCommand('fontSizeDelta', -1)} title="Réduire">
                  <Minus size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
