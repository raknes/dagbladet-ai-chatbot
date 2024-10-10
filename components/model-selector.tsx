"use client"

import { useEffect, useState } from 'react';
import { z } from 'zod';

const aiProviders = [
  { name: 'Anthropic', models: ['claude-3-5-sonnet-20240620', 'claude-3-haiku-20240307'] },
  { name: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] },
];

export const AIProviderSchema = z.object({
  name: z.string(),
  models: z.array(z.string()).default([]),
});
export type AIProvider = z.infer<typeof AIProviderSchema>;

// type AIDropdownProps = {
//   handleModelChange: (model: string) => void;
// };
// export function AIDropdown(props: AIDropdownProps) {
export function AIDropdown() {
    const [selectedProvider, setSelectedProvider] = useState<AIProvider>(localStorage.getItem('aiProvider') ? (aiProviders.find(x => x.name === localStorage.getItem('aiProvider')) ?? aiProviders[0]) : aiProviders[0]);
    const [selectedModel, setSelectedModel] = useState(localStorage.getItem('aiModel') ?? aiProviders[0].models[0]);
  
    useEffect(() => {
      localStorage.setItem('aiProvider', selectedProvider.name);
      localStorage.setItem('aiModel', selectedModel);
    }, [selectedProvider, selectedModel]);

    const handleProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const provider = aiProviders.find(p => p.name === event.target.value);
      if (provider) {
        setSelectedProvider(provider);
        setSelectedModel(provider.models[0]);
      }
    };

    const internalHandleModelChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModel(event.target.value);
    };
  
    return (
      <div className="flex items-center gap-4">
        <select value={selectedProvider.name} onChange={handleProviderChange}>
          {aiProviders.map(provider => (
            <option key={provider.name} value={provider.name}>
              {provider.name}
            </option>
          ))}
        </select>
        <select value={selectedModel} onChange={internalHandleModelChange}>
          {selectedProvider.models.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
    );
  }