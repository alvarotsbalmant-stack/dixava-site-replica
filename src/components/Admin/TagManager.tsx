
import { useState } from 'react';
import { useTags } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Tag, Type, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const TagManager = () => {
  const { tags, loading, addTag, deleteTag } = useTags();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) return;

    try {
      await addTag(newTagName.trim());
      setNewTagName('');
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled in useTags
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a tag "${name}"?`)) {
      await deleteTag(id);
    }
  };

  return (
    <Card className="bg-[#2C2C44] border-[#343A40]">
      <CardHeader className="border-b border-[#343A40] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Tag className="w-6 h-6 text-[#007BFF]" />
              Gerenciar Tags
            </CardTitle>
            <Alert className="mt-3 bg-[#1A1A2E] border-[#343A40] text-gray-300">
              <Info className="h-4 w-4 text-[#007BFF]" />
              <AlertDescription>
                Tags são usadas para categorizar produtos e criar seções dinâmicas. Exemplos: Ação, RPG, Aventura, Promoção.
              </AlertDescription>
            </Alert>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsDialogOpen(true)}
                size="sm"
                className="bg-[#007BFF] hover:bg-[#0056B3] text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nova Tag
              </Button>
            </DialogTrigger>
            
            <DialogContent className="bg-[#2C2C44] border-[#343A40] text-white">
              <DialogHeader className="border-b border-[#343A40] pb-4 mb-4">
                <DialogTitle className="text-white">
                  Adicionar Nova Tag
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tagName" className="text-gray-300 flex items-center">
                    <Type className="mr-2 h-4 w-4" />
                    Nome da Tag *
                  </Label>
                  <Input
                    id="tagName"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
                    placeholder="Ex: Ação, RPG, Aventura"
                    required
                  />
                </div>

                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white"
                    >
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-[#007BFF] hover:bg-[#0056B3] text-white"
                  >
                    Adicionar Tag
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-[#007BFF] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando tags...</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhuma tag encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-3 bg-[#343A40] rounded-lg border border-[#495057] hover:bg-[#3A3A50] transition-colors">
                <Badge className="bg-[#6F42C1] text-white hover:bg-[#5A2D91] font-medium">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
                
                <Button
                  onClick={() => handleDelete(tag.id, tag.name)}
                  size="sm"
                  className="bg-[#DC3545] hover:bg-[#C82333] text-white h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
