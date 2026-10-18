'use client';

// src/app/studio/StudioAddBlockModal.tsx — Create New Studio Block Modal
import React, { useState } from 'react';
import {
  type StudioBlock,
  type StudioBlockType,
  type StudioColorAccent,
} from './studio-store';
import {
  Button,
  Input,
  TextArea,
  CloseIcon,
  BoltIcon,
  FileCodeIcon,
  RocketIcon,
  EditIcon,
} from '@/components/ui';
import { playSuccessChime, playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

interface StudioAddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (block: StudioBlock) => void;
}

export function StudioAddBlockModal({
  isOpen,
  onClose,
  onAddBlock,
}: StudioAddBlockModalProps) {
  const [type, setType] = useState<StudioBlockType>('quote');
  const [title, setTitle] = useState('');
  const [category] = useState('Commercial');
  const [colorAccent, setColorAccent] = useState<StudioColorAccent>('cyan');

  // Type specific state
  const [itemName] = useState('New License Item');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(500);

  const [specModule, setSpecModule] = useState('module.ts');
  const [specContract, setSpecContract] = useState('Async Data Transport');

  const [markdown, setMarkdown] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    unlockAudio();
    playSuccessChime();

    const newBlock: StudioBlock = {
      id: `block-${Date.now()}`,
      type,
      title: title.trim(),
      category: category.trim() || 'General',
      colorAccent,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (type === 'quote') {
      newBlock.quoteData = {
        itemName: itemName.trim() || title.trim(),
        quantity,
        unitPrice,
        taxPercent: 18,
        currency: 'USD',
      };
    } else if (type === 'spec') {
      newBlock.specData = {
        module: specModule.trim() || 'core.ts',
        interfaceContract: specContract.trim() || 'Contract spec',
        latencySla: '< 1ms',
        status: 'Active',
      };
    } else if (type === 'speed') {
      newBlock.speedData = {
        targetFps: 60,
        renderBudgetMs: 16.6,
        clsScore: 0.0,
        reflowGuarded: true,
      };
    } else if (type === 'note') {
      newBlock.noteData = {
        markdown: markdown.trim() || 'Draft note content...',
        tags: ['Draft'],
      };
    }

    onAddBlock(newBlock);
    // Reset
    setTitle('');
    onClose();
  }

  const accents: StudioColorAccent[] = ['cyan', 'indigo', 'rose', 'emerald', 'amber', 'violet'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-shade/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-surface/98 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base text-cyan font-bold">+</span>
            <h2 className="text-sm font-bold text-fg">Add Block to Canvas</h2>
          </div>
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onClose();
            }}
            aria-label="Close modal"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-fg-muted hover:border-border hover:bg-surface-2 hover:text-fg transition-colors cursor-pointer"
          >
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5 text-xs">
          {/* Block Type Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">
              Select Block Archetype
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { t: 'quote', icon: BoltIcon, label: 'Quote' },
                { t: 'spec', icon: FileCodeIcon, label: 'Spec' },
                { t: 'speed', icon: RocketIcon, label: 'Speed' },
                { t: 'note', icon: EditIcon, label: 'Note' },
              ].map((item) => (
                <Button
                  key={item.t}
                  variant="plain"
                  size="none"
                  latencyMode="none"
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    playHapticTick();
                    setType(item.t as StudioBlockType);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                    type === item.t
                      ? 'border border-cyan/40 bg-cyan/15 font-bold text-cyan shadow-2xs'
                      : 'border border-border/60 bg-surface-2/40 text-fg-muted hover:text-fg'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">
              Title
            </span>
            <Input
              type="text"
              required
              placeholder="e.g. Enterprise SLA Agreement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 rounded-lg border border-border/70 bg-surface px-2.5 text-xs text-fg focus:border-brand focus:outline-hidden"
            />
          </div>

          {/* Color Accent */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">
              Color Accent Glow
            </span>
            <div className="flex items-center gap-2">
              {accents.map((acc) => {
                const isActive = colorAccent === acc;
                const dotColorMap: Record<StudioColorAccent, string> = {
                  cyan: 'bg-cyan',
                  indigo: 'bg-indigo',
                  rose: 'bg-rose',
                  emerald: 'bg-emerald',
                  amber: 'bg-amber',
                  violet: 'bg-violet',
                };
                return (
                  <Button
                    key={acc}
                    variant="plain"
                    size="none"
                    latencyMode="none"
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      playHapticTick();
                      setColorAccent(acc);
                    }}
                    aria-label={`Accent ${acc}`}
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform cursor-pointer ${
                      isActive ? 'ring-2 ring-fg ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full ${dotColorMap[acc]}`} />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Type Specific Fields */}
          {type === 'quote' && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-surface-2/40 p-2.5">
              <div>
                <span className="text-[10px] text-fg-muted">Quantity</span>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="h-7 w-full rounded border border-border/70 bg-surface px-2 text-xs font-mono text-fg"
                />
              </div>
              <div>
                <span className="text-[10px] text-fg-muted">Unit Price ($)</span>
                <Input
                  type="number"
                  min={0}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="h-7 w-full rounded border border-border/70 bg-surface px-2 text-xs font-mono text-fg"
                />
              </div>
            </div>
          )}

          {type === 'spec' && (
            <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-surface-2/40 p-2.5">
              <Input
                type="text"
                placeholder="Module file or name"
                value={specModule}
                onChange={(e) => setSpecModule(e.target.value)}
                className="h-7 rounded border border-border/70 bg-surface px-2 font-mono text-xs text-fg"
              />
              <Input
                type="text"
                placeholder="Interface contract or description"
                value={specContract}
                onChange={(e) => setSpecContract(e.target.value)}
                className="h-7 rounded border border-border/70 bg-surface px-2 text-xs text-fg"
              />
            </div>
          )}

          {type === 'note' && (
            <TextArea
              rows={3}
              placeholder="Type note or story content..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="rounded-xl border border-border/70 bg-surface p-2 text-xs text-fg focus:border-brand focus:outline-hidden"
            />
          )}

          {/* Modal Footer */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
            <Button
              variant="plain"
              size="none"
              latencyMode="none"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border/60 px-3 py-1.5 text-xs font-semibold text-fg-muted hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="plain"
              size="none"
              latencyMode="none"
              type="submit"
              className="rounded-lg border border-cyan/40 bg-cyan/15 px-4 py-1.5 text-xs font-bold text-cyan hover:bg-cyan/25 transition-all cursor-pointer"
            >
              Add Block
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
