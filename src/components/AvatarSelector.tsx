import React from 'react';

export interface AvatarIcon {
  id: string;
  emoji: string;
  label: string;
  bgGradient: string;
}

export const AVATAR_OPTIONS: AvatarIcon[] = [
  { id: 'owl', emoji: '🦉', label: 'Knowledge Owl', bgGradient: 'from-violet-400 to-indigo-600' },
  { id: 'rocket', emoji: '🚀', label: 'Cosmic Explorer', bgGradient: 'from-sky-400 to-blue-600' },
  { id: 'robot', emoji: '🤖', label: 'Tech Wizard', bgGradient: 'from-emerald-400 to-teal-600' },
  { id: 'fox', emoji: '🦊', label: 'Clever Fox', bgGradient: 'from-orange-400 to-red-500' },
  { id: 'dino', emoji: '🦖', label: 'Dino DJ', bgGradient: 'from-amber-400 to-yellow-600' },
  { id: 'unicorn', emoji: '🦄', label: 'Dream Unicorn', bgGradient: 'from-pink-400 to-rose-500' },
  { id: 'koala', emoji: '🐨', label: 'Chill Koala', bgGradient: 'from-slate-400 to-gray-600' },
  { id: 'squirrel', emoji: '🐿️', label: 'Busy Squirrel', bgGradient: 'from-amber-500 to-orange-600' },
];

interface AvatarSelectorProps {
  selectedId: string;
  onSelect: (avatar: AvatarIcon) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-3 p-2 bg-slate-50 rounded-xl max-w-sm" id="avatar-selection-grid">
      {AVATAR_OPTIONS.map((avatar) => {
        const isSelected = selectedId === avatar.id || (selectedId.includes(avatar.emoji));
        return (
          <button
            key={avatar.id}
            id={`avatar-btn-${avatar.id}`}
            type="button"
            onClick={() => onSelect(avatar)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-200 cursor-pointer ${
              isSelected ? 'ring-4 ring-indigo-500 bg-white scale-105 shadow-md' : 'hover:bg-white bg-transparent hover:shadow-sm'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center text-2xl shadow-sm`}
            >
              {avatar.emoji}
            </div>
            <span className="text-[10px] mt-1 font-medium text-slate-500 text-center truncate w-14">
              {avatar.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
