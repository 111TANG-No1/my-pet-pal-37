import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PetPhoto } from '@/types/pet';
import { generateId } from '@/lib/storage';
import { savePhotosToIDB, deletePhotoFromIDB } from '@/lib/photoDB';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PhotoGalleryProps {
  photos: PetPhoto[];
  petId: string;
  onPhotosChange: (photos: PetPhoto[]) => void;
}

export default function PhotoGallery({ photos, petId, onPhotosChange }: PhotoGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    const newPhotos: PetPhoto[] = [];
    let processed = 0;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = (h / w) * maxDim; w = maxDim; }
            else { w = (w / h) * maxDim; h = maxDim; }
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          const photo: PetPhoto = {
            id: generateId(),
            petId,
            url: canvas.toDataURL('image/jpeg', 0.7),
            createdAt: Date.now(),
          };
          newPhotos.push(photo);
          processed++;
          if (processed === files.length) {
            try {
              await savePhotosToIDB(newPhotos);
              onPhotosChange([...photos, ...newPhotos]);
            } catch (err) {
              console.error('图片保存失败:', err);
              alert('图片保存失败，请重试');
            } finally {
              setLoading(false);
            }
          }
        };
        img.onerror = () => {
          processed++;
          if (processed === files.length) setLoading(false);
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        processed++;
        if (processed === files.length) setLoading(false);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = async (id: string) => {
    try {
      await deletePhotoFromIDB(id);
      onPhotosChange(photos.filter(p => p.id !== id));
    } catch (err) {
      console.error('删除图片失败:', err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {photos.map(photo => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-muted">
            <img
              src={photo.url}
              alt={photo.caption || '宠物照片'}
              className="w-full h-full object-cover"
              onClick={() => setPreview(photo.url)}
            />
            <button
              onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="text-xs">处理中…</span>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span className="text-xs">添加</span>
            </>
          )}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg p-2">
          {preview && <img src={preview} alt="preview" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
