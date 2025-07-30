import React, { useState, useRef } from 'react';
import { Camera, User, Palette, Upload, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface AvatarCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  recipientName?: string;
  onAvatarSelect: (avatar: string) => void;
}

// Preset avatar options
const presetAvatars = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b6e08c3c?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f16?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
];

// Color options for generated avatars
const avatarColors = [
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-green-500', text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-pink-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-red-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-cyan-500', text: 'text-white' },
  { bg: 'bg-yellow-500', text: 'text-gray-900' },
  { bg: 'bg-gray-600', text: 'text-white' },
  { bg: 'bg-emerald-500', text: 'text-white' },
];

export function AvatarCustomization({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  recipientName = '',
  onAvatarSelect 
}: AvatarCustomizationProps) {
  const [selectedTab, setSelectedTab] = useState<'presets' | 'colors' | 'upload'>('presets');
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [selectedColor, setSelectedColor] = useState(avatarColors[0]);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateColorAvatar = (color: typeof avatarColors[0]) => {
    const initials = recipientName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
    
    return {
      type: 'color',
      initials,
      color,
    };
  };

  const handleSave = () => {
    if (selectedTab === 'colors') {
      // For color avatars, we'll save a special format
      const colorAvatar = generateColorAvatar(selectedColor);
      onAvatarSelect(`color:${JSON.stringify(colorAvatar)}`);
    } else {
      onAvatarSelect(selectedAvatar);
    }
    onClose();
  };

  const getInitials = () => {
    return recipientName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-gray-200/30 dark:border-white/10 max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-gray-800 dark:text-white">
            Choose Avatar
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100/50 dark:bg-gray-900/50 rounded-lg p-1 mb-4">
          <button
            onClick={() => setSelectedTab('presets')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              selectedTab === 'presets'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User size={16} />
            Presets
          </button>
          <button
            onClick={() => setSelectedTab('colors')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              selectedTab === 'colors'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Palette size={16} />
            Colors
          </button>
          <button
            onClick={() => setSelectedTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              selectedTab === 'upload'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Upload size={16} />
            Upload
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedTab === 'presets' && (
            <div className="grid grid-cols-4 gap-3">
              {presetAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative rounded-full overflow-hidden hover:scale-105 transition-transform ${
                    selectedAvatar === avatar ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`Preset ${index + 1}`}
                    className="w-16 h-16 object-cover"
                  />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <Check size={20} className="text-blue-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedTab === 'colors' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${selectedColor.bg} ${selectedColor.text}`}>
                  {getInitials()}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Avatar with initials
                </p>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {avatarColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`relative w-12 h-12 rounded-full ${color.bg} hover:scale-105 transition-transform ${
                      selectedColor === color ? 'ring-2 ring-gray-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''
                    }`}
                  >
                    {selectedColor === color && (
                      <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'upload' && (
            <div className="space-y-4">
              <div className="text-center">
                {uploadedImage ? (
                  <div className="relative inline-block">
                    <img
                      src={uploadedImage}
                      alt="Uploaded avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setUploadedImage('');
                        setSelectedAvatar('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto">
                    <Camera size={24} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10"
                >
                  <Upload size={16} className="mr-2" />
                  Choose Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Supported formats: JPG, PNG, GIF (Max 5MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200/30 dark:border-white/10">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-gray-100/30 dark:bg-gray-900/30 border-gray-200/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200/30 dark:hover:bg-gray-900/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedAvatar && selectedTab !== 'colors'}
            className="flex-1 card-gradient hover:opacity-90 text-white"
          >
            Save Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to render avatars based on the saved format
export function renderCustomAvatar(avatarData: string, name: string, className: string = "w-12 h-12") {
  if (avatarData.startsWith('color:')) {
    try {
      const colorData = JSON.parse(avatarData.replace('color:', ''));
      return (
        <div className={`${className} rounded-full flex items-center justify-center text-lg font-bold ${colorData.color.bg} ${colorData.color.text}`}>
          {colorData.initials}
        </div>
      );
    } catch {
      // Fallback to regular Avatar component
      return (
        <Avatar className={className}>
          <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {name[0]}
          </AvatarFallback>
        </Avatar>
      );
    }
  } else {
    return (
      <Avatar className={className}>
        <AvatarImage src={avatarData} />
        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {name[0]}
        </AvatarFallback>
      </Avatar>
    );
  }
}