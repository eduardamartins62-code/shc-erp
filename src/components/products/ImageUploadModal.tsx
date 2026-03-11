import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentImageUrl?: string;
    onSave: (imageUrl: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, currentImageUrl, onSave }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    // Sync preview when modal opens or currentImageUrl changes
    useEffect(() => {
        if (isOpen) {
            setPreviewUrl(currentImageUrl || null);
        }
    }, [isOpen, currentImageUrl]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (previewUrl) {
            onSave(previewUrl);
            showToast('Product image saved successfully', 'success');
        }
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>Upload Product Image</h2>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                    <div
                        style={{
                            width: '200px',
                            height: '200px',
                            border: '2px dashed var(--color-border)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            backgroundColor: 'var(--color-bg-light)',
                            position: 'relative'
                        }}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                                <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <span>No image selected</span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => fileInputRef.current?.click()}>
                            <Upload size={16} style={{ marginRight: '0.5rem' }} />
                            Select File
                        </button>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
                        Supports JPG, PNG, WEBP. Max size 5MB.
                    </p>
                </div>

                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <div>
                        {previewUrl && (
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="btn-secondary"
                                style={{ color: 'var(--color-shc-red)', borderColor: 'var(--color-shc-red)' }}
                            >
                                <Trash2 size={14} style={{ marginRight: '0.25rem' }} />
                                Remove
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={onClose} className="btn-secondary">Cancel</button>
                        <button
                            onClick={handleSave}
                            className="btn-primary"
                            disabled={!previewUrl}
                        >
                            Save Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;
