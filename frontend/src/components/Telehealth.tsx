import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, UserSquare2 } from 'lucide-react';

interface TelehealthProps {
  onEndCall: () => void;
  peerName: string;
}

const Telehealth: React.FC<TelehealthProps> = ({ onEndCall, peerName }) => {
  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callActive, setCallActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize camera
  useEffect(() => {
    let activeStream: MediaStream | undefined;
    
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Failed to get local stream", err);
        // Fallback if no camera
        setHasVideo(false);
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !hasVideo;
      });
      setHasVideo(!hasVideo);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !hasAudio;
      });
      setHasAudio(!hasAudio);
    }
  };

  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onEndCall();
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '600px',
      backgroundColor: '#0f172a',
      borderRadius: '1rem',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
    }}>
      
      {/* Remote Video (Mocked as a dark screen or waiting screen for now unless connected) */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)' }}>
        {!callActive ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gradient-primary)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserSquare2 size={50} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Calling {peerName}...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Waiting for them to join</p>
            <button 
              onClick={() => setCallActive(true)} 
              className="btn-primary" 
              style={{ marginTop: '2rem', padding: '0.5rem 2rem', background: 'var(--gradient-success)' }}
            >
              Simulate Connection
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {/* When connected, this would show the remote stream. Using placeholder. */}
             <div style={{ textAlign: 'center', animation: 'pulse 3s infinite' }}>
                <UserSquare2 size={80} color="var(--text-secondary)" opacity={0.5} />
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>{peerName} (Connected)</p>
             </div>
          </div>
        )}

        {/* Local Video Picture-in-Picture */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '200px',
          height: '150px',
          backgroundColor: '#000',
          borderRadius: '0.75rem',
          border: '2px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
        }}>
          {hasVideo ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b' }}>
              <UserSquare2 size={40} color="var(--text-secondary)" />
            </div>
          )}
        </div>
      </div>

      {/* Call Controls */}
      <div style={{
        padding: '1.5rem',
        background: 'var(--bg-tertiary)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem'
      }}>
        <ControlButton 
          icon={hasAudio ? <Mic size={24} /> : <MicOff size={24} />} 
          active={hasAudio} 
          onClick={toggleAudio} 
          activeColor="rgba(255,255,255,0.1)"
          inactiveColor="var(--accent-danger)"
        />
        <ControlButton 
          icon={hasVideo ? <Video size={24} /> : <VideoOff size={24} />} 
          active={hasVideo} 
          onClick={toggleVideo} 
          activeColor="rgba(255,255,255,0.1)"
          inactiveColor="var(--accent-danger)"
        />
        <ControlButton 
          icon={<PhoneOff size={24} />} 
          active={true} 
          onClick={handleEndCall} 
          activeColor="var(--accent-danger)"
          hoverColor="#dc2626"
        />
      </div>
    </div>
  );
};

const ControlButton = ({ icon, active, onClick, activeColor, inactiveColor, hoverColor }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        backgroundColor: active ? (isHovered && hoverColor ? hoverColor : activeColor) : (inactiveColor || 'rgba(255,255,255,0.1)'),
        transition: 'all 0.2s',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      {icon}
    </button>
  );
};

export default Telehealth;
