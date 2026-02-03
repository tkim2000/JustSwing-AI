
import React, { useRef, useState, useEffect } from 'react';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

type UploaderMode = 'upload' | 'record';

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, isProcessing }) => {
  const [mode, setMode] = useState<UploaderMode>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Handle Camera Stream
  useEffect(() => {
    if (mode === 'record' && !previewUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, previewUrl]);

  const startCamera = async () => {
    setPermissionError(null);
    try {
      // Constraints optimized for recording quality
      const constraints = { 
        video: { 
          facingMode: 'environment', // Use back camera for better quality
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }, 
        audio: true 
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      let msg = "Could not access camera.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Camera/Microphone permission was denied. Please enable them in your browser settings and refresh.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = "No camera or microphone was found on this device.";
      }
      setPermissionError(msg);
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    
    // Check for supported mime types
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
      ? 'video/webm;codecs=vp9' 
      : 'video/webm';
      
    const recorder = new MediaRecorder(stream, { mimeType });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `swing_record_${Date.now()}.webm`, { type: 'video/webm' });
      setPreviewUrl(URL.createObjectURL(file));
      onFileSelect(file);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file.');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      alert('File too large. Please keep clips under 30MB for AI processing.');
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Mode Switcher */}
      {!previewUrl && !isProcessing && (
        <div className="flex justify-center p-1 bg-[#1a1a1a]/50 rounded-xl w-fit mx-auto border border-[#2d2d2d]">
          <button 
            onClick={() => setMode('upload')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'upload' ? 'bg-[#cfb991] text-black shadow-lg' : 'text-[#b89f73] hover:text-[#e6d7b8]'}`}
          >
            File Upload
          </button>
          <button 
            onClick={() => setMode('record')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'record' ? 'bg-[#cfb991] text-black shadow-lg' : 'text-[#b89f73] hover:text-[#e6d7b8]'}`}
          >
            Record Live
          </button>
        </div>
      )}

      {permissionError && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm text-center animate-fadeIn">
          <p className="font-bold mb-1">Camera Access Failed</p>
          <p>{permissionError}</p>
        </div>
      )}

      <div 
        className={`relative border-2 border-dashed rounded-3xl overflow-hidden transition-all duration-300 flex flex-col items-center justify-center min-h-[400px]
          ${dragActive ? 'border-[#cfb991] bg-[#cfb991]/10' : 'border-[#2d2d2d] bg-[#1a1a1a]/40'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!previewUrl ? (
          mode === 'upload' ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-[#cfb991]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#cfb991]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-oswald font-bold text-white mb-2">UPLOAD CLIPS</h3>
              <p className="text-[#b89f73] mb-8 max-w-xs mx-auto">Drag & drop your swing video or browse your files (MP4, MOV)</p>
              <button 
                onClick={() => inputRef.current?.click()}
                className="px-8 py-3 bg-[#cfb991] hover:bg-[#b89f73] text-black font-bold rounded-full transition-transform active:scale-95 shadow-xl"
              >
                Choose File
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full aspect-video bg-black flex items-center justify-center">
              <video 
                ref={videoPreviewRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover mirror-mode"
              />
              
              {/* Recording HUD */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  {isRecording ? (
                    <div className="flex items-center space-x-3 bg-red-600/90 text-white px-3 py-1.5 rounded-lg text-xs font-black tracking-widest animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>REC {formatTime(recordingTime)}</span>
                    </div>
                  ) : (
                    <div className="bg-[#1a1a1a]/60 text-[#cfb991] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#cfb991]/30">
                      CAMERA READY
                    </div>
                  )}
                </div>

                <div className="flex justify-center pointer-events-auto">
                  {!isRecording ? (
                    <button 
                      onClick={startRecording}
                      className="w-16 h-16 rounded-full bg-white border-4 border-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group"
                    >
                      <div className="w-10 h-10 bg-red-600 rounded-full group-hover:rounded-xl transition-all"></div>
                    </button>
                  ) : (
                    <button 
                      onClick={stopRecording}
                      className="w-16 h-16 rounded-full bg-white border-4 border-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                    >
                      <div className="w-8 h-8 bg-slate-900 rounded-sm"></div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="w-full p-4">
            <div className="relative group">
              <video 
                src={previewUrl} 
                className="w-full rounded-2xl shadow-2xl border border-[#2d2d2d] aspect-video object-cover" 
                controls 
              />
              {!isProcessing && (
                <button 
                  onClick={() => { setPreviewUrl(null); }}
                  className="absolute top-4 right-4 bg-[#1a1a1a]/80 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        <input 
          ref={inputRef}
          type="file" 
          accept="video/*" 
          className="hidden" 
          onChange={handleChange} 
        />
      </div>
      
      {isProcessing && (
        <div className="mt-8 text-center animate-fadeIn">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-[#cfb991] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-[#cfb991] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-[#cfb991] rounded-full animate-bounce"></div>
          </div>
          <p className="text-[#cfb991] font-oswald font-bold tracking-widest uppercase">Analyzing Frame Data</p>
          <p className="text-[#b89f73] text-sm italic">Identifying mechanical inefficiencies...</p>
        </div>
      )}

      <style>{`
        .mirror-mode {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default VideoUploader;
