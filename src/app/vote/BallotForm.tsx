'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, ShieldCheck, Camera, CameraOff } from 'lucide-react';
import { Candidate } from '@/types';

interface BallotFormProps {
  electionId: string;
  candidates: Candidate[];
}

export default function BallotForm({ electionId, candidates }: BallotFormProps) {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        setCameraStream(stream);
      } catch (err) {
        console.error('Camera access denied:', err);
        setCameraError(true);
      }
    }

    setupCamera();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Separate effect to attach stream once video element is mounted
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  }, [cameraStream]);

  const handleSubmit = async () => {
    if (!selectedCandidate) return;
    setLoading(true);
    setError('');

    let auditPhoto = null;
    if (cameraStream && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video is ready
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better
        try {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw multiple times or with a tiny delay to ensure no black frames
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            auditPhoto = canvas.toDataURL('image/jpeg', 0.7);
          }
        } catch (err) {
          console.error('Failed to draw to canvas:', err);
        }
      } else {
        console.warn('Video not ready for capture, readyState:', video.readyState);
      }
    }

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          electionId, 
          candidateId: selectedCandidate,
          auditPhoto // Include the captured photo
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to confirmation with receipt token in state or query
        router.push(`/confirmation?token=${data.receiptToken}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit vote');
        setShowConfirm(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Camera Preview - Essential for rendering frames and transparency */}
      {cameraStream && (
        <div className="fixed bottom-4 right-4 z-40 w-32 h-40 bg-slate-900 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 group">
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/20">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-bold text-white uppercase tracking-wider">Live Audit</span>
          </div>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover grayscale contrast-125" 
          />
          <canvas ref={canvasRef} className="hidden" width="640" height="480" />
        </div>
      )}

      {cameraError && (
        <div className="flex items-center p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-xl mb-4">
          <CameraOff className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm">Camera access is required for audit purposes. Please enable it to continue.</p>
        </div>
      )}

      {cameraStream && !cameraError && (
        <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-xl mb-4">
          <Camera className="w-4 h-4 mr-3 flex-shrink-0 animate-pulse" />
          <p className="text-xs font-medium">Security camera active. A photo will be taken upon confirmation.</p>
        </div>
      )}

      {error && (
        <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {candidates.map((candidate) => (
          <label 
            key={candidate.id}
            className={`relative flex items-center p-5 cursor-pointer rounded-2xl border-2 transition-all duration-200 ${
              selectedCandidate === candidate.id 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="candidate"
              value={candidate.id}
              onChange={() => setSelectedCandidate(candidate.id)}
              className="sr-only"
            />
            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
              selectedCandidate === candidate.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-700'
            }`}>
              {selectedCandidate === candidate.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{candidate.name}</h3>
                {selectedCandidate === candidate.id && <CheckCircle className="w-5 h-5 text-blue-600" />}
              </div>
              {candidate.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{candidate.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          disabled={!selectedCandidate || loading}
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition duration-200 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
        >
          Review Selection
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cast Your Final Vote?</h3>
              <p className="text-slate-500 dark:text-slate-400">
                You are about to vote for <span className="font-bold text-slate-900 dark:text-white">
                  {candidates.find(c => c.id === selectedCandidate)?.name}
                </span>. This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowConfirm(false)}
                className="p-4 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition border-r border-slate-200 dark:border-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="p-4 text-blue-600 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              >
                {loading ? 'Submitting...' : 'Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
