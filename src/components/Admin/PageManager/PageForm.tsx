
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PageFormData } from './types';
import { Palette, Link, FileText, ToggleRight } from 'lucide-react';

interface PageFormProps {
  formData: Partial<PageFormData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchChange: (checked: boolean) => void;
}

const PageForm: React.FC<PageFormProps> = ({
  formData,
  onInputChange,
  onSwitchChange
}) => {
  return (
    <div className="space-y-6 p-4 rounded-lg bg-[#2C2C44] border border-[#343A40]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-300 flex items-center"><FileText className="mr-2 h-4 w-4" /> Título da Página *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={onInputChange}
            placeholder="Ex: Xbox"
            required
            className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-gray-300 flex items-center"><Link className="mr-2 h-4 w-4" /> URL da Página *</Label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            <Input
              id="slug"
              name="slug"
              value={formData.slug || ''}
              onChange={onInputChange}
              placeholder="Ex: xbox"
              required
              className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-300 flex items-center"><FileText className="mr-2 h-4 w-4" /> Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={onInputChange}
          placeholder="Descreva brevemente o conteúdo desta página"
          rows={3}
          className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-4 p-4 rounded-lg border border-[#343A40]">
        <h3 className="text-lg font-medium text-white flex items-center"><Palette className="mr-2 h-5 w-5" /> Tema da Página</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="theme.primaryColor" className="text-gray-300">Cor Primária</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="theme.primaryColor"
                name="theme.primaryColor"
                type="color"
                value={formData.theme?.primaryColor || '#107C10'}
                onChange={onInputChange}
                className="w-12 h-8 p-1 border border-[#343A40] rounded-md"
              />
              <Input
                value={formData.theme?.primaryColor || '#107C10'}
                onChange={onInputChange}
                name="theme.primaryColor"
                className="flex-1 bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme.secondaryColor" className="text-gray-300">Cor Secundária</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="theme.secondaryColor"
                name="theme.secondaryColor"
                type="color"
                value={formData.theme?.secondaryColor || '#3A3A3A'}
                onChange={onInputChange}
                className="w-12 h-8 p-1 border border-[#343A40] rounded-md"
              />
              <Input
                value={formData.theme?.secondaryColor || '#3A3A3A'}
                onChange={onInputChange}
                name="theme.secondaryColor"
                className="flex-1 bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <Switch
          id="isActive"
          checked={formData.isActive ?? true}
          onCheckedChange={onSwitchChange}
          className="data-[state=checked]:bg-[#007BFF]"
        />
        <Label htmlFor="isActive" className="text-gray-300 flex items-center"><ToggleRight className="mr-2 h-4 w-4" /> Página Ativa</Label>
      </div>
    </div>
  );
};

export default PageForm;
