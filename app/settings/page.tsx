"use client";

import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { BlockchainContext } from "@/context/blockchain-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsState {
  difficulty: number;
  miningReward: number;
}

const Settings = () => {
  const { difficulty, setDifficulty, miningReward, setMiningReward } = useContext(BlockchainContext);

  const [settings, setSettings] = useState<SettingsState>({
    difficulty: difficulty,
    miningReward: miningReward,
  });

  useEffect(() => {
    setSettings({
      difficulty: difficulty,
      miningReward: miningReward,
    });
  }, [difficulty, miningReward]);

  const handleSettingChange = (key: keyof SettingsState, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (Number(settings.difficulty) < 1) {
      toast("Operation failed", {
        description: "Mining difficulty must be at least 1",
        action: {
          label: "Understood",
          onClick: () => console.log("close"),
        },
      });

      setSettings({
        difficulty: difficulty,
        miningReward: miningReward,
      });
      return;
    }

    if (Number(settings.miningReward) < 100) {
      toast("Operation failed", {
        description: "Mining reward must be at least 100",
        action: {
          label: "Understood",
          onClick: () => console.log("close"),
        },
      });

      setSettings({
        difficulty: difficulty,
        miningReward: miningReward,
      });
      return;
    }

    try {
      setDifficulty(settings.difficulty);
      setMiningReward(settings.miningReward);
      toast("Success", {
        description: "The mining difficulty and reward have been successfully updated",
        action: {
          label: "Understood",
          onClick: () => console.log("close"),
        },
      });
    } catch (error) {
      toast('Operation failed.', {
        description: "An unexpected error occurred",
        action: {
          label: "Understood",
          onClick: () => console.log("close"),
        },
      });

      setSettings({
        difficulty: difficulty,
        miningReward: miningReward,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link href="/" passHref>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>
              Control how the blockchain behaves when new transactions or blocks are created. Changes are automatically saved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Input
                  id="difficulty"
                  type="number"
                  value={settings.difficulty}
                  onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                  min={1}
                />
                <p className="text-sm text-muted-foreground">
                  Difficulty controls how long the mining process takes. Higher numbers will make mining a lot slower!
                </p>
                <p className="text-sm text-muted-foreground">
                  Default: 2
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="miningReward">Mining Reward</Label>
                <Input
                  id="miningReward"
                  type="number"
                  value={settings.miningReward}
                  onChange={(e) => handleSettingChange('miningReward', e.target.value)}
                  min={100}
                />
                <p className="text-sm text-muted-foreground">
                  How much "coins" a miner receives for successfully creating a new block for the chain.
                </p>
                <p className="text-sm text-muted-foreground">
                  Default: 100
                </p>
              </div>
            </div>

            <Button onClick={handleSave} className="mt-4">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
