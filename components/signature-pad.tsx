'use client'

import { useRef, forwardRef, useImperativeHandle } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/use-translation'
import { Eraser } from 'lucide-react'

// #region agent log
const debugLog = (location: string, message: string, data: Record<string, unknown>, hypothesisId: string) => {
  fetch('http://127.0.0.1:7244/ingest/38b9ffd5-17e1-41de-990c-d6f0876091b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location,message,data,timestamp:Date.now(),sessionId:'debug-session',hypothesisId})}).catch(()=>{});
};
// #endregion

export interface SignaturePadRef {
  clear: () => void
  getDataURL: () => string
  isEmpty: () => boolean
}

interface SignaturePadProps {
  onSignatureChange?: (hasSignature: boolean) => void
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  function SignaturePad({ onSignatureChange }, ref) {
    const sigCanvasRef = useRef<SignatureCanvas>(null)
    const { t } = useTranslation()

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvasRef.current?.clear()
        onSignatureChange?.(false)
      },
      getDataURL: () => {
        if (sigCanvasRef.current?.isEmpty()) {
          return ''
        }
        return sigCanvasRef.current?.getTrimmedCanvas().toDataURL('image/png') || ''
      },
      isEmpty: () => {
        return sigCanvasRef.current?.isEmpty() ?? true
      },
    }))

    const handleClear = () => {
      sigCanvasRef.current?.clear()
      onSignatureChange?.(false)
    }

    const handleEnd = () => {
      // #region agent log
      debugLog('signature-pad.tsx:handleEnd', 'called', { hasCanvas: !!sigCanvasRef.current }, 'H2');
      // #endregion
      const isEmpty = sigCanvasRef.current?.isEmpty() ?? true
      // #region agent log
      debugLog('signature-pad.tsx:handleEnd', 'isEmpty check', { isEmpty }, 'H2');
      // #endregion
      onSignatureChange?.(!isEmpty)
    }

    return (
      <div className="space-y-3">
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-background p-1">
          <SignatureCanvas
            ref={sigCanvasRef}
            canvasProps={{
              className: 'w-full h-40 rounded-md cursor-crosshair',
              style: { 
                width: '100%', 
                height: '160px',
                touchAction: 'none'
              },
            }}
            backgroundColor="rgb(255, 255, 255)"
            penColor="rgb(0, 0, 0)"
            onEnd={handleEnd}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="flex items-center gap-2"
        >
          <Eraser className="h-4 w-4" />
          {t('clearSignature')}
        </Button>
      </div>
    )
  }
)
