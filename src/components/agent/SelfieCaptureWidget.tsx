import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onChange: (neutral: File | null, smiling: File | null) => void;
  initialNeutral?: File | null;
  initialSmiling?: File | null;
}

const SelfieCaptureWidget: React.FC<Props> = ({ onChange, initialNeutral = null, initialSmiling = null }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [supported, setSupported] = useState(true);
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0: neutral, 1: smiling, 2: done/review
  const [neutralFile, setNeutralFile] = useState<File | null>(initialNeutral);
  const [smilingFile, setSmilingFile] = useState<File | null>(initialSmiling);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    setSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);

  useEffect(() => {
    onChange(neutralFile, smilingFile);
  }, [neutralFile, smilingFile]);

  useEffect(() => {
    if (!supported) return;
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setPermissionDenied(false);
      } catch (err) {
        setPermissionDenied(true);
      }
    };
    start();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [supported]);

  const captureToFile = async (filename: string) => {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = canvasRef.current ?? document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        const file = new File([blob], filename, { type: blob.type });
        resolve(file);
      }, 'image/jpeg', 0.9);
    });
  };

  const startCountdownAndCapture = (forStep: 0 | 1) => {
    let c = 3;
    setCountdown(c);
    const t = setInterval(() => {
      c -= 1;
      setCountdown(c > 0 ? c : 0);
      if (c <= 0) {
        clearInterval(t);
        (async () => {
          const file = await captureToFile(forStep === 0 ? 'selfie-neutral.jpg' : 'selfie-smiling.jpg');
          if (file) {
            if (forStep === 0) setNeutralFile(file);
            else setSmilingFile(file);
            setStep((s) => (s === 0 ? 1 : 2));
          }
          setCountdown(null);
        })();
      }
    }, 1000);
  };

  const retake = (which: 'neutral' | 'smiling') => {
    if (which === 'neutral') {
      setNeutralFile(null);
      setStep(0);
    } else {
      setSmilingFile(null);
      setStep((s) => (s === 2 ? 1 : s));
    }
  };

  if (!supported) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Camera not supported in this browser or insecure context. Selfie capture requires HTTPS or localhost.
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Camera access was denied. Please enable camera permissions in your browser settings and reload this page.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(step === 0 || step === 1) && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            {step === 0 ? 'Look straight at the camera — neutral expression' : 'Now smile for the camera'}
          </p>
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-60 object-cover bg-black" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => startCountdownAndCapture(step === 0 ? 0 : 1)}
              className="rounded-xl bg-[#00C9A7] px-4 py-2 text-sm font-semibold text-[#0A1628]"
            >
              {countdown ? `Capturing in ${countdown}…` : 'Capture'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (step === 0) setNeutralFile(null);
                else setSmilingFile(null);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Review neutral */}
      {neutralFile && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Neutral photo</p>
          <img src={URL.createObjectURL(neutralFile)} alt="Neutral selfie" className="rounded-lg w-40 h-40 object-cover border" />
          <div className="flex gap-2">
            <button onClick={() => retake('neutral')} className="rounded-lg border px-3 py-1 text-sm">Retake</button>
            <button onClick={() => setStep(1)} className="rounded-lg bg-[#00C9A7] px-3 py-1 text-sm">Continue</button>
          </div>
        </div>
      )}

      {/* Review smiling */}
      {step >= 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Smiling photo</p>
          {smilingFile ? (
            <>
              <img src={URL.createObjectURL(smilingFile)} alt="Smiling selfie" className="rounded-lg w-40 h-40 object-cover border" />
              <div className="flex gap-2">
                <button onClick={() => retake('smiling')} className="rounded-lg border px-3 py-1 text-sm">Retake</button>
                <button onClick={() => setStep(2)} className="rounded-lg bg-[#00C9A7] px-3 py-1 text-sm">Finish</button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-slate-100 p-3 text-sm text-slate-500">Capture your smiling photo to continue.</div>
          )}
        </div>
      )}

      {/* Final status */}
      {step === 2 && neutralFile && smilingFile && (
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-sm font-medium text-slate-700">Both selfies captured</p>
          <div className="flex gap-3 mt-2">
            <img src={URL.createObjectURL(neutralFile)} alt="Neutral" className="w-24 h-24 object-cover rounded-lg border" />
            <img src={URL.createObjectURL(smilingFile)} alt="Smiling" className="w-24 h-24 object-cover rounded-lg border" />
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => { setNeutralFile(null); setSmilingFile(null); setStep(0); }} className="rounded-lg border px-3 py-1 text-sm">Retake both</button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default SelfieCaptureWidget;
