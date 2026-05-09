'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { AlertTriangle } from 'lucide-react';

export function SpiceGateModal() {
  const {
    isSpiceGateOpen,
    setSpiceGateOpen,
    pendingSpiceAction,
    setPendingSpiceAction,
    unlockSpice3,
  } = useAppStore();

  const handleConfirm = () => {
    unlockSpice3();
    if (pendingSpiceAction) {
      pendingSpiceAction();
    }
    setSpiceGateOpen(false);
    setPendingSpiceAction(null);
  };

  const handleCancel = () => {
    setSpiceGateOpen(false);
    setPendingSpiceAction(null);
  };

  return (
    <Dialog open={isSpiceGateOpen} onOpenChange={setSpiceGateOpen}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <DialogTitle className="text-center text-white">
            Unlock Spicy Content?
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            These prompts can be sexual, intense, or very personal in nature.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-800/50 rounded-lg p-4 my-4">
          <p className="text-sm text-slate-300 text-center">
            By continuing, you confirm that:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              Everyone playing is 21+ years old
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              All players consent to adult content
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              You understand this content is for entertainment only
            </li>
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleConfirm}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            I Confirm - Unlock Spicy Content
          </Button>
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white"
          >
            Keep It Mild
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useSpiceGate() {
  const { settings, setSpiceGateOpen, setPendingSpiceAction } = useAppStore();

  const checkSpice3Access = (action: () => void): boolean => {
    if (settings.spice3Unlocked) {
      action();
      return true;
    }
    setPendingSpiceAction(() => action);
    setSpiceGateOpen(true);
    return false;
  };

  return { checkSpice3Access, isUnlocked: settings.spice3Unlocked };
}
