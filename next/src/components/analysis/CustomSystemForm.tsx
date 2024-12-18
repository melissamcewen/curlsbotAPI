'use client';

import { useState, useEffect } from 'react';
import { getBundledSettings, getBundledDatabase } from '../../../../src/data/bundledData';

interface CustomSystemFormProps {
  onSave: (settings: string[]) => void;
  initialSettings: string[];
}

interface SettingGroup {
  name: string;
  description?: string;
  settings: Array<{
    id: string;
    name: string;
    description: string;
    categories?: string[];
    groups?: string[];
  }>;
}

export default function CustomSystemForm({ onSave, initialSettings }: CustomSystemFormProps) {
  const [selectedSettings, setSelectedSettings] = useState<string[]>(initialSettings);
  const [settingGroups, setSettingGroups] = useState<SettingGroup[]>([]);

  useEffect(() => {
    const settings = getBundledSettings();
    const database = getBundledDatabase();

    // Create groups based on setting types
    const groups: Record<string, SettingGroup> = {
      'Detergents': {
        name: 'Detergents',
        description: 'Control which types of cleansing agents are allowed',
        settings: []
      },
      'Silicones': {
        name: 'Silicones',
        description: 'Manage silicone-related ingredients',
        settings: []
      },
      'Alcohols': {
        name: 'Alcohols',
        description: 'Control different types of alcohols',
        settings: []
      },
      'Other': {
        name: 'Other Ingredients',
        description: 'Additional ingredient controls',
        settings: []
      }
    };

    // Sort settings into appropriate groups
    Object.entries(settings).forEach(([id, setting]) => {
      const settingData = {
        id,
        name: setting.name,
        description: setting.description || '',
        categories: setting.categories,
        groups: setting.groups
      };

      // Determine which group this setting belongs to
      if (id.includes('sulfate') || id.includes('detergent')) {
        groups['Detergents'].settings.push(settingData);
      } else if (id.includes('silicone')) {
        groups['Silicones'].settings.push(settingData);
      } else if (id.includes('alcohol')) {
        groups['Alcohols'].settings.push(settingData);
      } else {
        groups['Other'].settings.push(settingData);
      }
    });

    // Filter out empty groups and sort settings within each group
    const filteredGroups = Object.values(groups)
      .filter(group => group.settings.length > 0)
      .map(group => ({
        ...group,
        settings: group.settings.sort((a, b) => a.name.localeCompare(b.name))
      }));

    setSettingGroups(filteredGroups);
  }, []);

  const handleSettingToggle = (settingId: string) => {
    setSelectedSettings(prev => {
      if (prev.includes(settingId)) {
        return prev.filter(id => id !== settingId);
      } else {
        return [...prev, settingId];
      }
    });
  };

  useEffect(() => {
    onSave(selectedSettings);
  }, [selectedSettings, onSave]);

  return (
    <div className="space-y-6">
      {settingGroups.map(group => (
        <div key={group.name} className="collapse collapse-plus bg-base-200">
          <input type="checkbox" defaultChecked={false} />
          <div className="collapse-title text-xl font-medium flex justify-between items-center">
            <div>
              {group.name}
              <div className="text-sm font-normal text-base-content/70">
                {group.settings.filter(s => selectedSettings.includes(s.id)).length} selected
              </div>
            </div>
          </div>
          <div className="collapse-content">
            {group.description && (
              <p className="text-sm text-base-content/70 mb-4">{group.description}</p>
            )}
            <div className="space-y-4">
              {group.settings.map(setting => (
                <div key={setting.id} className="form-control bg-base-100 p-3 rounded-lg">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedSettings.includes(setting.id)}
                      onChange={() => handleSettingToggle(setting.id)}
                    />
                    <div>
                      <span className="label-text font-medium">{setting.name}</span>
                      {setting.description && (
                        <p className="text-sm text-base-content/70 mt-1">
                          {setting.description}
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
