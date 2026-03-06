import { useRef } from 'react';
import { Camera } from 'lucide-react';

interface PetAvatarProps {
  avatar: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onAvatarChange?: (dataUrl: string) => void;
}

const sizeMap = {
  sm: 'w-14 h-14 text-4xl',
  md: 'w-16 h-16 text-5xl',
  lg: 'w-24 h-24 text-6xl',
};

function isDataUrl(s: string) {
  return s.startsWith('data:image');
}

export default function PetAvatar({ avatar, size = 'md', editable = false, onAvatarChange }: PetAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && onAvatarChange) {
        // Resize to save localStorage space
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = (h / w) * maxDim; w = maxDim; }
            else { w = (w / h) * maxDim; h = maxDim; }
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          onAvatarChange(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const classes = sizeMap[size];

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-muted overflow-hidden flex-shrink-0 ${classes} ${editable ? 'cursor-pointer group' : ''}`}
      onClick={() => editable && inputRef.current?.click()}
    >
      {isDataUrl(avatar) ? (
        <img src={avatar} alt="pet avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{avatar || '🐾'}</span>
      )}
      {editable && (
        <>
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </>
      )}
    </div>
  );
}
