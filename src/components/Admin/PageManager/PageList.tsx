
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Eye, EyeOff, Edit, Trash2, Plus, Layout, ExternalLink } from 'lucide-react';
import { Page } from '@/hooks/usePages';

interface PageListProps {
  pages: Page[];
  loading: boolean;
  error: string | null;
  onCreatePage: () => void;
  onEditPage: (page: Page) => void;
  onDeletePage: (page: Page) => void;
  onOpenLayout: (page: Page) => void;
}

const PageList: React.FC<PageListProps> = ({
  pages,
  loading,
  error,
  onCreatePage,
  onEditPage,
  onDeletePage,
  onOpenLayout
}) => {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-12 w-full bg-[#343A40]" />
        <Skeleton className="h-12 w-full bg-[#343A40]" />
        <Skeleton className="h-12 w-full bg-[#343A40]" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-8 bg-[#2C2C44] rounded-lg border border-[#343A40]">
        <p className="text-gray-400 mb-4">Nenhuma página encontrada. Comece criando uma nova página.</p>
        <Button onClick={onCreatePage} className="bg-[#007BFF] hover:bg-[#0056B3] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Criar Página
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#343A40] overflow-hidden">
      <Table className="w-full text-white">
        <TableHeader className="bg-[#343A40]">
          <TableRow className="border-b border-[#495057]">
            <TableHead className="text-gray-300">Título</TableHead>
            <TableHead className="text-gray-300">URL</TableHead>
            <TableHead className="text-gray-300">Status</TableHead>
            <TableHead className="text-right text-gray-300">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-[#2C2C44]">
          {pages.map((page) => (
            <TableRow key={page.id} className="border-b border-[#343A40] hover:bg-[#3A3A50]">
              <TableCell className="font-medium text-white">{page.title}</TableCell>
              <TableCell className="text-gray-300">/{page.slug}</TableCell>
              <TableCell>
                {page.isActive ? (
                  <Badge className="bg-[#28A745] text-white hover:bg-[#218838]">
                    <Eye className="mr-1 h-3 w-3" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge className="bg-[#6C757D] text-white hover:bg-[#5A6268]">
                    <EyeOff className="mr-1 h-3 w-3" />
                    Inativo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onOpenLayout(page)} className="text-[#007BFF] hover:bg-[#007BFF]/20 hover:text-[#007BFF]">
                  <Layout className="h-4 w-4" />
                  <span className="sr-only">Layout</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEditPage(page)} className="text-[#FFC107] hover:bg-[#FFC107]/20 hover:text-[#FFC107]">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-[#17A2B8] hover:bg-[#17A2B8]/20 hover:text-[#17A2B8]">
                  <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Visualizar</span>
                  </a>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-[#DC3545] hover:bg-[#DC3545]/20 hover:text-[#DC3545]">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#2C2C44] border-[#343A40] text-white">
                    <DialogHeader className="border-b border-[#343A40] pb-4 mb-4">
                      <DialogTitle className="text-white">Excluir página</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Tem certeza que deseja excluir a página "{page.title}"? Esta ação não pode ser desfeita.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                      <DialogClose asChild>
                        <Button variant="outline" className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <Button onClick={() => onDeletePage(page)} className="bg-[#DC3545] hover:bg-[#C82333] text-white">
                        Excluir
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PageList;
